import { Container } from 'typedi';
import { routes, featureLevel, publicPost } from './utils';
import { SecurityService } from '../services';
import {
  loginSchema,signupSchema, 
} from '../models';

/**
  * Login/Signup end point
* */
export default () => {
  publicPost(
    featureLevel.production,
    routes.security.LOGIN,
    async (req) => {
      const service = Container.get(SecurityService);
      const { email, password } = await loginSchema.validateAsync(req.body);
      const { 'user-agent': userAgent } = req.headers;
      const requestMetadata = {
        userAgent,
        ip: req.ip,
      };
      return await service.login(requestMetadata, email, password);
    },
  );

  publicPost(
    featureLevel.production,
    routes.security.SIGN_UP, 
    async (req) => {
      const service = Container.get(SecurityService);
      const signUpDto = await signupSchema.validateAsync(req.body); 
      const { 'user-agent': userAgent } = req.headers;
      const requestMetadata = {
        userAgent,
        ip: req.ip,
      };
      return await service.signUp(requestMetadata, signUpDto);
    },
  );
};
