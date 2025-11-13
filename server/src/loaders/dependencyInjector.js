import { Container } from 'typedi';
import { UserDao, OrderDao, CartDao, ProductDao } from '../dao';
import { UserService, SecurityService, MessageService } from '../services';

export default ({ DbTransactions }) => {
  // Register shared resources first
  Container.set('DbTransactions', DbTransactions);

  // Register DAOs (simple classes without external construction deps)
  Container.set(UserDao, new UserDao());
  Container.set(OrderDao, new OrderDao());
  Container.set(CartDao, new CartDao());
  Container.set(ProductDao, new ProductDao());

  // Register services (they fetch DAOs / DbTransactions from the container in ctor)
  Container.set(UserService, new UserService());
  Container.set(SecurityService, new SecurityService());
  Container.set(MessageService, new MessageService());
};
