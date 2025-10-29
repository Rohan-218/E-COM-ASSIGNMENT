// import { Container } from 'typedi';
// import {
//   routes, featureLevel, get, publicGet, 
//   publicPost, publicPut, publicDelete,
//   post, put, deleteMethod, 
// } from './utils';
// import { QuotesService } from '../services';
// import { Right } from '../auth';

// /**
//  * Daily Quote endpoints
//  */
// export default () => {
//   publicGet(
//     featureLevel.development,
//     routes.quotes,
//     async () => {
//       const service = Container.get(QuotesService);
//       return await service.getDailyQuote();
//     },
//   );

//   publicPost(
//     featureLevel.development,
//     routes.quotes,
//     async (req) => {
//       const service = Container.get(QuotesService);
//       const { quote, author } = req.body; 
//       return await service.addQuote({ quote, author });
//     },
//   );

//   publicPut(
//     featureLevel.development,
//     routes.quotes,
//     async (req) => {
//       const service = Container.get(QuotesService);
//       const { id, quote, author } = req.body;
//       return await service.updateQuote({ id, quote, author });
//     },
//   );

//   publicDelete(
//     featureLevel.development,
//     routes.quotes,
//     async (req) => {
//       const service = Container.get(QuotesService);
//       const { id } = req.query; 
//       return await service.deleteQuote(id);
//     },
//   );

//   get(
//     featureLevel.development,
//     Right.general.GET_QUOTES, 
//     routes.auth_quotes, 
//     async (req) => {
//       const service = Container.get(QuotesService);
//       return await service.getDailyQuote();
//     },
//   );

//   post(
//     featureLevel.development,
//     Right.quotes.CREATE_QUOTES, 
//     routes.auth_quotes, 
//     async (req) => {
//       const service = Container.get(QuotesService);
//       const { quote, author } = req.body; 
//       return await service.addQuote({ quote, author });
//     },
//   );

//   put(
//     featureLevel.development,
//     Right.quotes.MODIFY_QUOTES, 
//     routes.auth_quotes,
//     async (req) => {
//       const service = Container.get(QuotesService);
//       const { id, quote, author } = req.body;
//       return await service.updateQuote({ id, quote, author });
//     },
//   );

//   deleteMethod(
//     featureLevel.development,
//     Right.quotes.DELETE_QUOTES, 
//     routes.auth_quotes,
//     async (req) => {
//       const service = Container.get(QuotesService);
//       const { id } = req.query; 
//       return await service.deleteQuote(id);
//     },
//   );
// };
