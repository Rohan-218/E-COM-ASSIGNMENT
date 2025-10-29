const API_ROOT = '/api';
const USER_ROOT = `${API_ROOT}/user`;

export default Object.freeze({
  ping: `${API_ROOT}/ping`,
  healthCheck: `${API_ROOT}/health-check`,
  products: `${API_ROOT}/products`,
  checkout: `${API_ROOT}/checkout`,
  security: {
    SIGN_UP: `${API_ROOT}/signup`,
    LOGIN: `${API_ROOT}/login`
  },
  user: {
    PROFILE: `${USER_ROOT}/profile`,
    CART: `${USER_ROOT}/cart`,
    ORDER: `${USER_ROOT}/order`,
    CART_ITEM: `${USER_ROOT}/cart/item`,
  },
  test: {
    TEST_ACTION: `${API_ROOT}/test/`,
  },
});
