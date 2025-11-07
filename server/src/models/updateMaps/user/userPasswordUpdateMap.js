import { filterUndefinedFromObject } from '../../../utils';

export default (user) => {
  const map = {
    password: user.hashedPassword,
  };

  return filterUndefinedFromObject(map);
};
