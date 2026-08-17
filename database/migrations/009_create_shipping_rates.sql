CREATE TABLE
    shipping_rates (
        id SERIAL PRIMARY KEY,
        governorate_name VARCHAR(100) NOT NULL,
        shipping_fee NUMERIC(10, 2) NOT NULL CHECK (shipping_fee >= 0),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_governorate_name UNIQUE (governorate_name)
    );