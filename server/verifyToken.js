/* eslint-disable consistent-return */
import { Request, NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Container } from 'typedi';
import config from '../../config';
import { HttpException, formatErrorResponse } from '../../utils';
import { SecurityService } from '../../services';
import { TokenValidationResult, Authentication } from '../../auth';

/**
 * Get the token from the header
 * We are assuming that the JWT will come in a header with the form
 * Authorization: Bearer ${JWT}
 * @param {Request} req
 * @param {string} messageKey
 * @param {NextFunction} next
 * @returns {string|null}
 */
const getTokenFromHeader = (req, messageKey, next) => {
  if ((req?.headers?.authorization?.split(' ')[0] === 'Bearer')) {
    return req?.headers?.authorization?.split(' ')[1] || null;
  }
  return next(new HttpException.Unauthorized(formatErrorResponse(messageKey, 'notFound')));
};

/**
 * Get the payload from the token
 * @param {string} token
 * @param {string} messageKey
 * @param {NextFunction} next
 * @returns {jwt.JwtPayload}
 */
const getPayloadFromToken = (token, messageKey, next) => {
  try {
    const payload = jwt.verify(
      token,
      config.authTokens.publicKey,
      {
        algorithms: config.authTokens.algorithm,
        issuer: config.authTokens.issuer,
        audience: [config.authTokens.audience.web, config.authTokens.audience.app],
        ignoreExpiration: true,
      },
    );
    return payload;
  } catch (error) {
    if (config.env !== 'prod') {
      console.log('getPayloadFromToken: Error while validating the JWT token');
      console.dir(error, { depth: 4 });
    }
    return next(new HttpException.Unauthorized(formatErrorResponse(messageKey, 'invalidToken')));
  }
};

/**
 * This function is called when the token is valid
 * @param {TokenValidationResult} result
 * @param {Request} req
 * @param {jwt.JwtPayload} payload
 * @param {NextFunction} next
 */
const onValidToken = (result, req, payload, next) => {
  const { user } = result;
  user.rights = Authentication.userEffectiveRights(user);
  user.tokenAud = payload.aud;
  user.ip = req.ip;
  user.userAgent = req?.headers['user-agent'] || null;
  delete user.passwordHash;
  req.currentUser = { ...user };
  Object.freeze(req.currentUser);
  next();
};

/**
 * A middleware to validate the token, get the user from the database
 * and set it in the request object as `currentUser` AKA actionUser
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
const verifyToken = async (req, res, next) => {
  const messageKey = 'authToken';
  const token = getTokenFromHeader(req, messageKey, next);
  const payload = getPayloadFromToken(token, messageKey, next);
  const service = Container.get(SecurityService);
  const result = await service.validateToken(req.ip, payload);
  const statusActions = {
    [TokenValidationResult.tokenValidationStatus.EXPIRED]: () => next(new HttpException.Unauthorized(formatErrorResponse(messageKey, 'expired'))),
    [TokenValidationResult.tokenValidationStatus.OLD_VERSION]: () => next(new HttpException.UpgradeRequired(formatErrorResponse(messageKey, 'invalidApiVersion'))),
    [TokenValidationResult.tokenValidationStatus.INVALID_USER]: () => next(new HttpException.Unauthorized(formatErrorResponse(messageKey, 'invalidUser'))),
    [TokenValidationResult.tokenValidationStatus.INACTIVE_USER]: () => next(new HttpException.Unauthorized(formatErrorResponse(messageKey, 'inactiveUser'))),
    [TokenValidationResult.tokenValidationStatus.INVALID_TOKEN]: () => next(new HttpException.UpgradeRequired(formatErrorResponse(messageKey, 'invalidToken'))),
    [TokenValidationResult.tokenValidationStatus.VALID]:
      () => onValidToken(result, req, payload, next),
  };
  if (statusActions[result.status]) {
    statusActions[result.status]();
    return;
  }
  console.log('[ERROR] None of case matched for result: %s', result);
  throw new HttpException.Unauthorized(formatErrorResponse(messageKey, 'invalidToken'));
};

export default verifyToken;
