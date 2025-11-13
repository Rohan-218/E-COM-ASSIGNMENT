import {
  routes, featureLevel, get, publicGet,
} from './utils';
import { messageResponse } from '../utils';
import { Right } from '../auth';

/**
   * Token/Health Check endpoints
 * */
export default () => {
  publicGet(
    featureLevel.production,
    routes.healthCheck,
    async () => messageResponse('ok'),
  );

  get(
    featureLevel.production,
    Right.general.PING,
    routes.ping,
    async () => messageResponse('ok'),
  );
};
