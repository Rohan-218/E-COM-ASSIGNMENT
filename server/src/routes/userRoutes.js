import { Container } from 'typedi';
import {
  routes, featureLevel, get, put,
  publicPost,
  publicPut,
} from './utils';
import { Right } from '../auth';
import { UserService } from '../services';
import {
  changeUserPasswordSchema,
  updateUserProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../models';

export default () => {
  get(
    featureLevel.production,
    Right.general.VIEW_PROFILE,
    routes.user.PROFILE,
    async (req) => {
      const service = Container.get(UserService);
      return await service.fetchUserProfile({ ...req.currentUser });
    },
  );

//   put(
//     featureLevel.production,
//     Right.general.UPDATE_PROFILE,
//     routes.user.PROFILE,
//     async (req) => {
//       const service = Container.get(UserService);
//       const updateDto = await updateUserProfileSchema.validateAsync(req.body);
//       return await service.modifyUserProfile(updateDto, { ...req.currentUser });
//     },
//   );

  // put(
  //   featureLevel.production,
  //   Right.general.CHANGE_PASSWORD,
  //   routes.user.CHANGE_PASSWORD,
  //   async (req) => {
  //     const service = Container.get(UserService);
  //     const data = await changeUserPasswordSchema.validateAsync(req.body);
  //     return await service.changePassword(data, { ...req.currentUser });
  //   },
  // );
};
