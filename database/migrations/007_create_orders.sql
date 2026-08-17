CREATE TABLE
    orders (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        order_status VARCHAR(20) NOT NULL CHECK (
            order_status IN (
                'pending',
                'confirmed',
                'shipped',
                'delivered',
                'cancelled'
            )
        ),
        payment_status VARCHAR(20) NOT NULL CHECK (
            payment_status IN ('pending', 'paid', 'failed', 'refunded')
        ),
        stripe_payment_intent_id TEXT UNIQUE,
        payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card')),
        subtotal_amount NUMERIC(10, 2) NOT NULL CHECK (subtotal_amount >= 0),
        shipping_fee NUMERIC(10, 2) NOT NULL CHECK (shipping_fee >= 0),
        shipping_name VARCHAR(100) NOT NULL,
        shipping_phone VARCHAR(20) NOT NULL,
        shipping_governorate VARCHAR(100) NOT NULL,
        shipping_city VARCHAR(100) NOT NULL,
        shipping_address_line VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
    );