import { messageResponse } from './apiResponses';

export const handleCors = (origin, allowedOriginsCS, callback) => {
  if (!origin || allowedOriginsCS.some((x) => origin && origin.indexOf(x) !== -1)) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

export const handleErrorResponse = (err, res) => {
  if (err.metaData) {
    res.json(messageResponse(err.message, err.metaData));
  } else {
    if (!err?.isTrusted) {
      console.error('=== Logging unhandled exception ===');
      console.error(err);
    }
    res.json(messageResponse(err.message));
  }
};
