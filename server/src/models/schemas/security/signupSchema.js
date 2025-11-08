import Joi from 'joi';
import {
  requiredStringValidator, requiredEmailValidator,
} from '../../../utils';

export default Joi.object(((messageKey) => ({
  name: requiredStringValidator(messageKey, 'name'),
  email: requiredEmailValidator(messageKey, 'email'),
  password: requiredStringValidator(messageKey, 'password'),
  phoneNumber: requiredPhoneNumberValidator(messageKey, 'phoneNumber'),
  role: Joi.string().required()
    .messages({
      'any.required': `${messageKey}.role is required`,
      'number.base': `${messageKey}.role must be a string`,
    }),
}))('signup')).options({ stripUnknown: true });
