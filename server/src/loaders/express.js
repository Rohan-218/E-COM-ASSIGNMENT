import { Express } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import logger from 'morgan';
import helmet from 'helmet';
import routes from '../routes';
import config from '../config';
import {
  HttpException,
  formatErrorResponse,
  logOrigin,
  handleCors,
  handleErrorResponse,
} from '../utils';

const { allowedOrigins } = config.cors;
const allowedOriginsCS = allowedOrigins ? allowedOrigins.split(',') : [];

/**
 * Initialize the express middleware here
 * @param {{ app: Express }}
 */
export default ({ app }) => {
  app.disable('x-powered-by');

  app.use(logger(':method :url :status :response-time ms'));

  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable('trust proxy');

  // Enable Cross Origin Resource Sharing to all origins by default
  app.use(
    cors({
      origin(origin, callback) {
        logOrigin(origin, allowedOriginsCS);
        handleCors(origin, allowedOriginsCS, callback);
      },
      methods: 'GET,PUT,POST,DELETE,OPTIONS,PATCH',
      allowedHeaders: 'Content-Type,Authorization,X-Requested-With,Content-Length,Accept,Origin',
      exposedHeaders: 'Authorization',
      credentials: true,
    }),
  );

  // Middleware that transforms the raw string of req.body into json
  app.use(bodyParser.json({
    limit: '2mb',
  }));

  // Middleware to handle form data requests for file upload
  app.use(bodyParser.urlencoded({ extended: true }));

  // Load API routes
  app.use(routes());

  // / catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new HttpException.NotFound(formatErrorResponse('general', 'notFound'));
    next(err);
  });

  app.use(helmet(
    {
      xFrameOptions: {
        action: 'deny',
      },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'"],
          styleSrc: null,
          fontSrc: null,
          baseUri: null,
          formAction: null,
          frameAncestors: null,
          imgSrc: null,
          objectSrc: null,
          scriptSrc: null,
          scriptSrcAttr: null,
          upgradeInsecureRequests: null,
        },
      },
    },
  ));

  // / error handlers
  /* eslint-disable-next-line no-unused-vars */
  app.use((err, req, res, next) => {
    const fallbackErrorCode = err?.isJoi ? 400 : 500;
    res.status(err.status || fallbackErrorCode);
    handleErrorResponse(err, res);
  });
};
