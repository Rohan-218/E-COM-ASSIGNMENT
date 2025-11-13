import {
  filterUndefinedFromObject,
} from '../../../utils';

export default (user) => {
  const map = {
    status: user.status,
    email: user.email,
    updated_by: user.updatedBy,
  };

  return filterUndefinedFromObject(map);
};
