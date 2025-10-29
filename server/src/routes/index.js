import { route } from './utils';
import pingRoutes from './pingRoutes';
import securityRoutes from './securityRoutes';
import userRoutes from './userRoutes';
import testApiRoutes from './testRoutes';
import quotesRoutes from './quotesRoutes';

// guaranteed to get dependencies
export default () => {
  pingRoutes();
  // securityRoutes();
  // userRoutes();
  // quotesRoutes();
  // testApiRoutes();
  return route;
};
