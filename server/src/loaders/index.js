/* eslint-disable no-console */
import DatabaseLoader from './database';
import DependencyInjectorLoader from './dependencyInjector';
import ExpressLoader from './express';

export default async ({ expressApp }) => {
  const DbTransactions = await DatabaseLoader();
  console.info('✌ DB connected and loaded successfully!');

  DependencyInjectorLoader({ DbTransactions });
  console.info('✌️ Dependency Injector loaded');

  ExpressLoader({ app: expressApp });
  console.info('✌️ Express loaded');
};
