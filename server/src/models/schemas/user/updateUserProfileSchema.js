import Joi from 'joi';
import {
  nullableEmailValidator,
  stringValidator,
} from '../../../utils';

export default Joi.object(((messageKey) => ({
  firstName: stringValidator(messageKey, 'firstName'),
  lastName: stringValidator(messageKey, 'lastName'),
  email: nullableEmailValidator(messageKey, 'email'),
}))('updateUserProfile')).options({ stripUnknown: true });
