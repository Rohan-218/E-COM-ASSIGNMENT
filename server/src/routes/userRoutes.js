// import { Container } from 'typedi';
// import {
//   routes, featureLevel, get, put,
//   publicPost,
//   publicPut,
// } from './utils';
// import { Right } from '../auth';
// import { UserService } from '../services';
// import {
//   changeUserPasswordSchema,
//   updateUserProfileSchema,
//   forgotPasswordSchema,
//   resetPasswordSchema,
// } from '../models';

// export default () => {
//   get(
//     featureLevel.production,
//     Right.general.VIEW_PROFILE,
//     routes.user.PROFILE,
//     async (req) => {
//       const service = Container.get(UserService);
//       return await service.fetchUserProfile({ ...req.currentUser });
//     },
//   );

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

//   put(
//     featureLevel.production,
//     Right.general.CHANGE_PASSWORD,
//     routes.user.CHANGE_PASSWORD,
//     async (req) => {
//       const service = Container.get(UserService);
//       const data = await changeUserPasswordSchema.validateAsync(req.body);
//       return await service.changePassword(data, { ...req.currentUser });
//     },
//   );

//   publicPost(
//     featureLevel.production,
//     routes.user.FORGOT_PASSWORD,
//     async (req) => {
//       const service = Container.get(UserService);
//       const { email } = await forgotPasswordSchema.validateAsync(req.body);
//       return await service.forgetPassword(email);
//     },
//   );

//   publicPut(
//     featureLevel.production,
//     routes.user.RESET_PASSWORD,
//     async (req) => {
//       const service = Container.get(UserService);
//       const data = await resetPasswordSchema.validateAsync(req.body);
//       const { 'user-agent': userAgent } = req.headers;
//       const requestMetadata = {
//         userAgent,
//         ip: req.ip,
//       };
//       return await service.resetPassword(data, requestMetadata);
//     },
//   );
// };
