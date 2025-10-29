/* eslint-disable */
import { routes, featureLevel, put } from './utils';
import { Right } from '../auth';

export default () => {
  put(featureLevel.development,
    Right.general.TEST_API,
    routes.test.TEST_ACTION,
    async () => {
      return {
        message: 'ok',
      }
    });
};
