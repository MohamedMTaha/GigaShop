CREATE TABLE
    order_items (
        id SERIAL PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_image_url TEXT NOT NULL,
        price_at_purchase NUMERIC(10, 2) NOT NULL CHECK (price_at_purchase > 0),
        quantity INT NOT NULL CHECK (quantity > 0),
        CONSTRAINT uq_order_product UNIQUE (order_id, product_id),
        CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
        CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT
    );