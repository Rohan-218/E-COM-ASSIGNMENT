-- Drop triggers
DROP TRIGGER IF EXISTS trg_users_created_by_self ON users;
DROP TRIGGER IF EXISTS trg_orders_updated_on ON orders;
DROP TRIGGER IF EXISTS trg_cart_product_updated_on ON cart_product;
DROP TRIGGER IF EXISTS trg_cart_updated_on ON cart;
DROP TRIGGER IF EXISTS trg_product_updated_on ON product;
DROP TRIGGER IF EXISTS trg_user_details_updated_on ON user_details;
DROP TRIGGER IF EXISTS trg_users_updated_on ON users;

-- Drop functions
DROP FUNCTION IF EXISTS set_created_by_self();
DROP FUNCTION IF EXISTS set_updated_on();

-- Drop tables (reverse order due to dependencies)
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_product CASCADE;
DROP TABLE IF EXISTS cart CASCADE;
DROP TABLE IF EXISTS product CASCADE;
DROP TABLE IF EXISTS user_details CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop ENUM type
DROP TYPE IF EXISTS status_enum;
