CREATE TABLE
    products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        category_id INT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL,
        CONSTRAINT fk_category_id FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
        CONSTRAINT chk_price_positive CHECK (price > 0),
        CONSTRAINT chk_stock_non_negative CHECK (stock >= 0)
    );  