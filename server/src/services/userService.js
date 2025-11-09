import { Container } from 'typedi';
import { UserDao } from '../dao';
import {
  HttpException, STATUS, formatErrorResponse,
  formatSuccessResponse,
  generateUUIDString,
  isValidUUIDString,
  messageResponse,
  parserString,
} from '../utils';

import { Password } from '../models';
import { parserInteger } from '../dao/helper';
import { handleError } from './helperService';
import MessageService from './messageService';

class UserService {
  static MAX_TOKEN_GENERATION_ATTEMPTS = 5;

  constructor() {
    this.txs = Container.get('DbTransactions');
    this.dao = Container.get(UserDao);
  }

  async createUser(client, dto, createdBy) {
    const messageKey = 'createUser';
    if (await this.dao.findDuplicate(client, dto)) {
      throw new HttpException.Conflict(formatErrorResponse(messageKey, 'duplicateUser'));
    }

    try {
      const createUserDto = await UserService.createUserDto(dto, createdBy);
      const id = await this.dao.createUser(client, createUserDto);
      const user = this.findUserById(client, id);
      return user;
    } catch (err) {
      console.log(err);
      throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'unableToCreate'));
    }
  }

  async updateUser(client, dto, updatedBy) {
    const messageKey = 'updateUser';
    try {
      const updateUserDto = UserService.updateProfileDto(dto, updatedBy);
      const success = await this.dao.updateUser(client, updateUserDto);
      if (!success) throw new HttpException.NotFound(formatErrorResponse(messageKey, 'unableToUpdate'));
    } catch (err) {
      console.log(err);
      throw new HttpException.NotFound(formatErrorResponse(messageKey, 'unableToUpdate'));
    }
    return await this.findUserById(client, dto.id);
  }


  async findUserById(client, id) {
    return UserService.fromUser(await this.dao.findUserById(client, id));
  }

  async findUserByEmail(client, email) {
    return UserService.fromUser(await this.dao.findUserByEmail(client, email));
  }

  async findPersistedUserById(id, messageKey = 'fetchUser') {
    return this.txs.withTransaction(async (client) => {
      const user = await this.findUserById(client, id);
      if (!user) {
        throw new HttpException.NotFound(
          formatErrorResponse(messageKey, 'notFound'),
        );
      }
      return user;
    });
  }

  async fetchUserProfile(actionUser) {
    return UserService.fromUserProfile(actionUser);
  }

  async modifyUserProfile(updateDto, actionUser) {
    return this.txs.withTransaction(async (client) => {
      const dto = UserService.updateProfileDto(updateDto, actionUser.id);
      const user = await this.updateUser(client, dto, actionUser.id);
      return UserService.fromUserProfile(user);
    });
  }

  async changePassword(changePasswordDto, actionUser) {
    const messageKey = 'changeUserPassword';
    return this.txs.withTransaction(async (client) => {
      const dto = UserService.changePasswordDto(changePasswordDto, actionUser.id);
      UserService.validatePassword(dto, messageKey, true);
      const hashedPassword = await new Password(dto.newPassword).hashPassword();
      await this.isOldPasswordValid(client, dto.oldPassword, actionUser, messageKey);
      return await this.updatePassword(client, hashedPassword, actionUser.id, messageKey);
    });
  }

  async isOldPasswordValid(client, oldPassword, actionUser, messageKey) {
    const user = await this.dao.findUserById(client, actionUser.id);
    const validPassword = await user.passwordHash.check(oldPassword);
    if (!validPassword) {
      throw new HttpException.BadRequest(
        formatErrorResponse(messageKey, 'invalidCredentials'),
      );
    }
  }

  async updatePassword(client, hashedPassword, userId, messageKey) {
    try {
      const isUpdated = await this.dao.updatePassword(client, hashedPassword, userId);
      if (!isUpdated) {
        throw new HttpException.NotFound(formatErrorResponse(messageKey, 'unableToChangePassword'));
      }
      return messageResponse(
        formatSuccessResponse(messageKey, 'passwordChanged'),
      );
    } catch (error) {
      return handleError(error, messageKey, 'unableToChangePassword');
    }
  }

  async forgetPassword(email) {
    const messageKey = 'forgetPassword';
    try {
      return this.txs.withTransaction(async (client) => {
        const user = await this.dao.findUserByEmail(client, email, true);
        this.isValidUser(user, messageKey);
        const token = await this.getTokenResult(client, user, messageKey);
        await this.sendForgetPasswordEmail(user, token);
        return messageResponse(
          formatSuccessResponse(messageKey, 'emailSent'),
        );
      });
    } catch (error) {
      return handleError(error, messageKey, 'failedToGeneratePasswordResetLink');
    }
  }

  isValidUser(user, messageKey) {
    if (!user) {
      throw new HttpException.NotFound(
        formatErrorResponse(messageKey, 'notFound'),
      );
    }
  }

  /**
   * @returns {Promise.<import('../dao/userDao').PasswordRestToken>}
   */
  async getTokenResult(client, user, messageKey) {
    const oldActiveToken = await this.dao.getUserPasswordResetToken(client, user.id);
    if (oldActiveToken) {
      return oldActiveToken;
    }
    const newToken = await this.generateUUIDToken(client, user.id, messageKey);
    return newToken;
  }

  async generateUUIDToken(client, userId, messageKey) {
    let success = false;
    let attempts = 0;
    const maxAttempts = 5;
    /**
     * @type {import('../dao/userDao').PasswordRestToken}
     */
    let tokenResult;

    while (!success && attempts < maxAttempts) {
      try {
        const token = generateUUIDString();
        // eslint-disable-next-line no-await-in-loop
        tokenResult = await this.dao.saveToken(client, token, userId);
        success = tokenResult.token === token;
      } catch (error) {
        if (error.code !== '23505') {
          break;
        }
      }
      attempts += 1;
    }

    if (!success) {
      throw new HttpException.ServerError(
        formatErrorResponse(messageKey, 'unableToGeneratePasswordResetLink'),
      );
    }
    return tokenResult;
  }

  /**
   *
   * @param {import('../dao/userDao').PasswordRestToken} token
   */
  async sendForgetPasswordEmail(user, token) {
    const isMailSent = await MessageService.sendPasswordReset(
      user,
      token,
    );
    if (!isMailSent) {
      throw new HttpException.ServerError(
        formatErrorResponse('forgetPassword', 'unableToSendPasswordResetLink'),
      );
    }
  }

  async resetPassword(data, requestMetadata) {
    const messageKey = 'resetPassword';
    return await this.txs.withTransaction(async (client) => {
      const {
        resetToken,
      } = data;
      this.validateResetToken(resetToken, messageKey);
      const user = await this.dao.validateResetToken(client, resetToken);
      this.isValidUser(user, messageKey);

      const dto = UserService.resetPasswordDto(data, user.id);
      UserService.validatePassword(dto, messageKey);
      const hashedPassword = await new Password(dto.newPassword).hashPassword();
      const response = await this.updatePassword(client, hashedPassword, user.id, messageKey);
      const logDto = UserService.logPasswordResetDto(requestMetadata, user.id, resetToken);
      await this.dao.logPasswordReset(client, logDto);
      return response;
    });
  }

  validateResetToken(token, messageKey) {
    if (!isValidUUIDString(token)) {
      throw new HttpException.BadRequest(
        formatErrorResponse(messageKey, 'invalidToken'),
      );
    }
  }

  /**
   * @param {changePasswordDto} dto
   * @param {string} messageKey
   * @param {boolean} [blockSameOldPassword=false] is set to true, it will block
   * if the new password is same old password. adding this so that I can use this
   * for both forgot and reset password
   */
  static validatePassword(dto, messageKey, blockSameOldPassword = false) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new HttpException.BadRequest(
        formatErrorResponse(messageKey, 'passwordsDoNotMatch'),
      );
    }

    if (blockSameOldPassword && dto.oldPassword === dto.newPassword) {
      throw new HttpException.BadRequest(
        formatErrorResponse(messageKey, 'oldPasswordSameAsNew'),
      );
    }
  }

  static async createUserDto(dto, createdBy) {
    let hash = null;
    if (dto.password) {
      hash = await new Password(dto.password).hashPassword();
    }
    return {
      name: dto.name,
      email: dto.email,
      phone_no: dto.phoneNumber,
      password: hash,
      status: STATUS.ACTIVE,
      createdBy,
    };
  }

  static updateUserDto(dto, updatedBy) {
    return {
      id: dto.id,
      name: dto.name,
      updatedBy,
    };
  }

  /**
   * @returns {updateProfileDto}
   */
  static updateProfileDto(dto, actionUserId) {
    return {
      id: parserInteger(actionUserId),
      name: parserString(dto?.name),
      email: parserString(dto?.email),
    };
  }

  static fromUser(user) {
    if (!user) {
      return null;
    }

    return {
      ...user,
    };
  }

  /**
   * @param {import('../dao/userDao').ActionUser} user
   */
  static fromUserProfile(user) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
    };
  }

  /**
   * @returns {changePasswordDto}
   */
  static changePasswordDto(dto, actionUserId) {
    return {
      newPassword: parserString(dto?.newPassword),
      oldPassword: parserString(dto?.oldPassword),
      confirmPassword: parserString(dto?.confirmPassword),
      id: parserInteger(actionUserId),
    };
  }

  static requestForgotPasswordDto(dto) {
    return {
      email: parserString(dto?.email),
    };
  }

  static resetPasswordDto(dto, userId) {
    return {
      id: parserInteger(userId),
      resetToken: parserString(dto?.email),
      newPassword: parserString(dto?.newPassword),
      confirmPassword: parserString(dto?.confirmPassword),
    };
  }

  /**
   * @param {import('./securityService').RequestDetails} requestMetadata
   * @param {number} userId
   * @returns {resetPasswordLogDto}
   */
  static logPasswordResetDto(requestMetadata, userId, token) {
    return {
      userId,
      ip: parserString(requestMetadata?.ip),
      userAgent: parserString(requestMetadata?.userAgent),
      token: parserString(token),
    };
  }
}

export default UserService;

/**
 * @typedef {Object} updateProfileDto
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 */

/**
 * @typedef {Object} changePasswordDto
 * @property {string} newPassword
 * @property {string} oldPassword
 * @property {string} confirmPassword
 */

/**
 * @typedef {Object} resetPasswordLogDto
 * @property {number} userId
 * @property {string} ip
 * @property {string} userAgent
 * @property {string} token
 */
