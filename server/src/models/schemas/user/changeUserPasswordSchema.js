import Joi from 'joi';
import {
  requiredStringValidator,
} from '../../../utils';

export default Joi.object(((messageKey) => ({
  oldPassword: requiredStringValidator(messageKey, 'oldPassword'),
  newPassword: requiredStringValidator(messageKey, 'newPassword'),
  confirmPassword: requiredStringValidator(messageKey, 'confirmPassword'),
}))('changeUserPassword')).options({ stripUnknown: true });
