import Joi from 'joi';
import {
  requiredStringValidator,
} from '../../../utils';

export default Joi.object(((messageKey) => ({
  resetToken: requiredStringValidator(messageKey, 'resetToken'),
  newPassword: requiredStringValidator(messageKey, 'newPassword'),
  confirmPassword: requiredStringValidator(messageKey, 'confirmPassword'),
}))('forgotPassword')).options({ stripUnknown: true });

/**
 * @typedef {Object} resetPasswordDto
 * @property {string} resetToken
 * @property {string} newPassword
 * @property {string} confirmPassword
 */
