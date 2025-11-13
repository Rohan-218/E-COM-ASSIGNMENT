import Joi from 'joi';
import config from '../../../config';
import { requiredStringValidator, nullableEnumValidator } from '../../../utils';

export default Joi.object(((messageKey) => ({
  email: requiredStringValidator(messageKey, 'email'),
  password: requiredStringValidator(messageKey, 'password'),
}))('login')).options({ stripUnknown: true });
