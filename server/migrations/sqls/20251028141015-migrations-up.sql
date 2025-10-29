-- ENUM type for status
CREATE TYPE status_enum AS ENUM ('Active', 'Inactive');

-- USERS table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    status status_enum NOT NULL,
    created_by INT NOT NULL,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by INT NOT NULL,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- USER_DETAILS table
CREATE TABLE user_details (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone_no BIGINT NOT NULL,
    address VARCHAR(255),
    status status_enum NOT NULL,
    created_by INT NOT NULL,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by INT NOT NULL,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- PRODUCT table
CREATE TABLE product (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    rating INT,
    status status_enum NOT NULL,
    created_by INT NOT NULL,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by INT NOT NULL,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- CART table
CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    total_items INT DEFAULT 0,
    total_cost INT DEFAULT 0,
    created_by INT NOT NULL,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by INT NOT NULL,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- CART_PRODUCT (junction table)
CREATE TABLE cart_product (
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    qty INT NOT NULL,
    PRIMARY KEY (cart_id, product_id),
    CONSTRAINT fk_cart FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
    CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
);

-- ORDERS table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    qty INT NOT NULL,
    status status_enum NOT NULL,
    created_by INT NOT NULL,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by INT NOT NULL,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_product FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
);

-- FUNCTION to auto-update 'updated_on'
CREATE OR REPLACE FUNCTION set_updated_on()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_on = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
CREATE TRIGGER trg_users_updated_on BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_on();
CREATE TRIGGER trg_user_details_updated_on BEFORE UPDATE ON user_details FOR EACH ROW EXECUTE FUNCTION set_updated_on();
CREATE TRIGGER trg_product_updated_on BEFORE UPDATE ON product FOR EACH ROW EXECUTE FUNCTION set_updated_on();
CREATE TRIGGER trg_cart_updated_on BEFORE UPDATE ON cart FOR EACH ROW EXECUTE FUNCTION set_updated_on();
CREATE TRIGGER trg_cart_product_updated_on BEFORE UPDATE ON cart_product FOR EACH ROW EXECUTE FUNCTION set_updated_on();
CREATE TRIGGER trg_orders_updated_on BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_on();
