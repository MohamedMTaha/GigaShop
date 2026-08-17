CREATE TABLE
    cart_items (
        id SERIAL PRIMARY KEY,
        cart_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL CHECK (quantity > 0),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (cart_id, product_id),
        FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id)
    );