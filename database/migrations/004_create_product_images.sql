CREATE TABLE
    product_images (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        cloudinary_public_id TEXT NOT NULL,
        UNIQUE (product_id, image_url),
        sort_order INTEGER NOT NULL CHECK (sort_order > 0),
        UNIQUE (product_id, sort_order),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    );