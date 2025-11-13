import { HttpException, formatErrorResponse } from '../utils';

/**
 * Checks if at least one file is provided
 * @param {File[]} files
 * @param {string} messageKey
 */
export const basicFileValidation = (files, messageKey) => {
  if (!files) {
    throw new HttpException.BadRequest(
      formatErrorResponse(messageKey, 'filesNotProvided'),
    );
  }
  if (!Array.isArray(files)) {
    console.log('messageKey', files);
    throw new HttpException.BadRequest(
      formatErrorResponse(messageKey, 'invalidData'),
    );
  }
  if (files.length === 0) {
    throw new HttpException.BadRequest(
      formatErrorResponse(messageKey, 'noFilesProvided'),
    );
  }
};

/**
 * Handles errors with proper logging
 * @param {Error} error
 * @param {string} messageKey
 * @param {string} fallbackErrorMessage
 */
export const handleError = (error, messageKey, fallbackErrorMessage) => {
  console.log('-----');
  console.log(`[ERROR][${messageKey}] error Handler:`);
  console.dir(error, { depth: 4 });
  console.log('-----');
  if (error.isTrusted) {
    throw error;
  }
  throw new HttpException.ServerError(
    formatErrorResponse(messageKey, fallbackErrorMessage),
  );
};
