import Joi from 'joi';
import {
  requiredStringValidator,
  requiredEmailValidator,
  requiredPhoneNumberValidator
} from '../../../utils';

export default Joi.object(((messageKey) => ({
  name: requiredStringValidator(messageKey, 'name'),
  email: requiredEmailValidator(messageKey, 'email'),
  password: requiredStringValidator(messageKey, 'password'),
  phoneNumber: requiredPhoneNumberValidator(messageKey, 'phoneNumber')
    .messages({
      'any.required': `${messageKey}.phoneNumber is required`,
      'number.base': `${messageKey}.phoneNumber must be a number`,
    }),
}))('signup')).options({ stripUnknown: true });
