import { Container } from 'typedi';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import config from '../config';
import {
  HttpException, encrypt, decrypt,
  formatErrorResponse, STATUS,
  parserString,
} from '../utils';
import {
  Authentication, Right, TokenValidationResult, Role,
} from '../auth';
import UserService from './userService';

class SecurityService {
  static TOKEN_EXPIRATION_MINUTES = 1;

  static SAME_IP_TOKEN_EXPIRATION_MINUTES = 60;

  static MAX_LOGIN_ATTEMPTS = 3;

  static ACCOUNT_BLOCK_HOURS = 1;

  constructor() {
    this.txs = Container.get('DbTransactions');
    this.userService = Container.get(UserService);
  }

  /**
   * @param {import('../dao/userDao').ActionUser} user
   */
  async updateUserWrongLoginCount(user) {
    let wrongLoginCount = (user.wrongLoginCount || 0) + 1;
    if (wrongLoginCount > SecurityService.MAX_LOGIN_ATTEMPTS) wrongLoginCount = 1;
    await this.userService.updateUserWrongLoginCount(wrongLoginCount, user.id);
  }

  async postLoginActions(client, userId, requestDetails) {
    await this.userService.markUserLogin(client, userId, requestDetails);
  }

  /**
   * Login with email and password
   * @param {RequestDetails} requestDetails
   * @param {string} email
   * @param {string} password
   * @returns {Promise.<{token: string}>}
   */
  async login(requestDetails, email, password) {
    return await this.txs.withTransaction(async (client) => {
      const messageKey = 'login';
      const invalidLoginErr = new HttpException.Unauthorized(formatErrorResponse(messageKey, 'invalidCredentials'));
      /**
       * @type {import('../dao/userDao').ActionUser}
       */
      const user = await this.userService.findUserByEmail(client, email);
      if (!user?.passwordHash) {
        throw invalidLoginErr;
      }

      if (SecurityService.accountBlocked(user)) {
        throw new HttpException.Unauthorized(formatErrorResponse(messageKey, 'accountBlocked'));
      }

      const validPassword = await user.passwordHash.check(password);

      if (validPassword && await this.canLogin(user)) {
        const type = user.role.getId();
        const token = SecurityService.createToken(
          requestDetails,
          user.id,
          config.authTokens.audience.web,
          type,
          !(user.lastLogin),
        );
        await this.postLoginActions(client, user.id, requestDetails);
        return { token };
      }
      this.updateUserWrongLoginCount(user);
      throw invalidLoginErr;
    });
  }

  /**
   * @param {RequestDetails} requestDetails
   * Used to signup only mobile app users
   * When using this endpoint, update requestDetails
   * */
  async signUp(requestDetails, signUpDto) {
    return await this.txs.withTransaction(async (client) => {
      /**
       * @type {import('../dao/userDao').ActionUser}
       */
      const user = await this.userService.createUser(
        client,
        { ...signUpDto },
      );
      const token = SecurityService.createToken(
        requestDetails,
        user.id,
        config.authTokens.audience.web,
        user.role.getId(),
        !(user.lastLogin),
      );
      await this.userService.markUserLogin(client, user.id, requestDetails);
      return { token };
    });
  }

  static accountBlocked(user) {
    let blocked = false;
    if ((user.wrongLoginCount >= SecurityService.MAX_LOGIN_ATTEMPTS)
      && user.lastWrongLoginAttempt) {
      const blockedTill = user.lastWrongLoginAttempt.clone().add(SecurityService.ACCOUNT_BLOCK_HOURS, 'hour');
      blocked = blockedTill.isAfter();
    }
    return blocked;
  }

  async canLogin(user) {
    const messageKey = 'user';
    if (user.status !== STATUS.ACTIVE) {
      throw new HttpException.Unauthorized(formatErrorResponse(messageKey, 'inactiveUser'));
    }

    return Authentication.hasRight(user, Right.general.LOGIN);
  }

  /**
   * Generates token, returns token for old token
   * @param {RequestDetails} requestDetails
   * @param {number} id
   * @param {string} aud
   * @param {string} type
   * @returns {string}
   */
  static updateToken(requestDetails, id, aud, type) {
    return SecurityService.createToken(requestDetails, id, aud, type);
  }

  /**
   * Generates token, returns token
   * @param {RequestDetails} requestDetails
   * @param {string} id
   * @param {string} aud
   * @param {number|string} type Token type based on the role
   * @param {boolean} firstLogin says if this is the first login
   * @returns {string}
   */
  static createToken(requestDetails, id, aud, type, firstLogin) {
    const payload = {
      exp: SecurityService.anyIpAddressExpiryTimestamp(),
      iat: SecurityService.currentTimestamp(),
      nbf: SecurityService.currentTimestamp(),
      iss: config.authTokens.issuer,
      sub: encrypt(parserString(id)),
      aud,
      version: config.authTokens.version,
      exp2: {
        ip: requestDetails.ip,
        userAgent: requestDetails.userAgent,
        time: SecurityService.sameIpAddressExpiryTimestamp(),
      },
      firstLogin: firstLogin || undefined,
      type,
    };
    if (aud && aud === config.authTokens.audience.app) {
      payload.aud = config.authTokens.audience.app;
      delete payload.exp;
      delete payload.exp2;
    }

    return jwt.sign(
      payload,
      config.authTokens.privateKey,
      { algorithm: config.authTokens.algorithm },
    );
  }

  static currentTimestamp() {
    return moment.utc().unix();
  }

  static anyIpAddressExpiryTimestamp() {
    return moment()
      .add(SecurityService.TOKEN_EXPIRATION_MINUTES, 'minute')
      .unix();
  }

  static sameIpAddressExpiryTimestamp() {
    return moment()
      .add(SecurityService.SAME_IP_TOKEN_EXPIRATION_MINUTES, 'minute')
      .unix();
  }

  /**
   * Gets user from the token
   * @param {jwt.JwtPayload} payload
   * @returns {Promise.<TokenValidationResult>}
   */
  async getUserFromToken(payload) {
    const id = decrypt(payload.sub);
    const user = await this.txs.withTransaction(async (client) => (
      this.userService.findUserById(client, id)
    ));

    if (!user) {
      return new TokenValidationResult(
        TokenValidationResult.tokenValidationStatus.INVALID_USER,
      );
    }

    if (user?.status !== STATUS.ACTIVE) {
      return new TokenValidationResult(
        TokenValidationResult.tokenValidationStatus.INACTIVE_USER,
      );
    }

    return new TokenValidationResult(TokenValidationResult.tokenValidationStatus.VALID, user);
  }

  /**
   * Validates the token, fetches the user and returns token validation
   * @param {string} ip
   * @param {jwt.JwtPayload} payload
   * @returns {Promise.<TokenValidationResult>}
   */
  async validateToken(ip, payload) {
    if (!payload) {
      return new TokenValidationResult(TokenValidationResult.tokenValidationStatus.INVALID_TOKEN);
    }

    if ((payload.aud !== config.authTokens.audience.app)
           && SecurityService.isExpired(ip, payload, moment())) {
      return new TokenValidationResult(TokenValidationResult.tokenValidationStatus.EXPIRED);
    }
    if (SecurityService.isOldVersion(payload)) {
      return new TokenValidationResult(TokenValidationResult.tokenValidationStatus.OLD_VERSION);
    }

    try {
      return await this.getUserFromToken(payload);
    } catch (e) {
      return new TokenValidationResult(TokenValidationResult.tokenValidationStatus.INVALID_USER);
    }
  }

  static isExpired(ip, payload, currentTime) {
    return (!SecurityService.isValidForGeneralExpiration(currentTime, payload)
      && !SecurityService.isValidForSameIpExpiration(currentTime, ip, payload));
  }

  static isValidForGeneralExpiration(currentTime, payload) {
    return moment.unix(payload.exp).isAfter(currentTime);
  }

  static isValidForSameIpExpiration(currentTime, ip, payload) {
    return (ip === payload.exp2.ip) && (moment.unix(payload.exp2.time).isAfter(currentTime));
  }

  static isOldVersion(payload) {
    return config.authTokens.version !== payload.version;
  }
}

export default SecurityService;

/**
 * @typedef {Object} RequestDetails
 * @property {string} ip
 * @property {string} userAgent
 */
