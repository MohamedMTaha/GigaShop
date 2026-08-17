CREATE TABLE
    carts (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    );