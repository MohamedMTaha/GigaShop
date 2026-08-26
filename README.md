# GigaShop — E-Commerce Backend

A scalable RESTful API for a full-stack e-commerce application built with Node.js, Express.js, and PostgreSQL.

GigaShop provides authentication, product and category management, shopping cart functionality, order processing, image management, shipping rates, and payment integration.

---

## 🔗 Related Links

- **Frontend Repository:** [GitHub](https://github.com/MohamedMTaha/GigaShop-Frontend)
- **Live Demo:** [GigaShop](https://giga-shop-frontend.vercel.app/)


## 🚀 Features

* User registration and authentication using JWT
* Role-based authorization for admin operations
* User profile management
* Product management
* Category management
* Product image upload and management using Cloudinary
* Soft deletion and restoration of products
* Shopping cart management
* Stock validation
* Checkout and order creation
* Order management
* Payment integration using Stripe
* Shipping rates management
* PostgreSQL database with SQL migrations
* Centralized error handling
* Input validation
* Layered architecture with separation of concerns

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* PostgreSQL
* JWT
* bcrypt
* Stripe
* Cloudinary

### Architecture

* Feature-based architecture
* Controller / Service / Repository pattern
* Centralized error handling
* Middleware-based authentication and authorization
* Database migrations

---

## 📁 Project Structure

```text
ecommerce-backend/
│
├── database/
│   └── migrations/
│
├── src/
│   ├── config/
│   ├── errors/
│   ├── middlewares/
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── categories/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── product-images/
│   │   ├── products/
│   │   ├── shipping/
│   │   └── users/
│   │
│   ├── scripts/
│   ├── services/
│   ├── utils/
│   └── server.js
│
├── .env
├── .gitignore
├── package.json
└── package-lock.json
```

---

## 🔐 Authentication & Authorization

GigaShop uses JSON Web Tokens (JWT) for authentication.

Protected routes require a valid access token, while admin-only operations are protected using role-based authorization.

Passwords are securely hashed using bcrypt before being stored in the database.

---

## 🗄️ Database

The application uses PostgreSQL as its primary database.

The database contains tables for:

* Users
* Categories
* Products
* Product Images
* Carts
* Cart Items
* Orders
* Order Items
* Shipping Rates

Database changes are managed through SQL migration files.

---

## ☁️ Image Management

Product images are uploaded and managed using Cloudinary.

The application stores the Cloudinary public ID along with the image URL, allowing images to be updated or deleted when necessary.

---

## 💳 Payments

Stripe is integrated for payment processing.

Payment-related operations are handled separately from the core order logic to keep the application modular and maintainable.

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000

DATABASE_URL=your_postgresql_connection_string

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
```

> Never commit your `.env` file to GitHub.

---

## ▶️ Running Locally

### 1. Clone the repository

```bash
git clone <repository-url>
cd ecommerce-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file and add the required environment variables.

### 4. Run database migrations

```bash
node src/scripts/migrate.js
```

### 5. Start the development server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```

---

## 🧱 Architecture

The backend follows a layered architecture:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
PostgreSQL
```

### Controller

Handles HTTP requests and responses.

### Service

Contains business logic and application rules.

### Repository

Responsible for database access and SQL queries.

### Middleware

Handles authentication, authorization, file uploads, and centralized error handling.

This structure keeps responsibilities separated and makes the application easier to maintain and extend.

---

## 🧪 Development

The project is structured to support future improvements such as:

* Redis caching
* Background jobs
* Additional payment methods
* More advanced shipping functionality
* Seller functionality
* Improved API documentation

---

## 🌐 Frontend

GigaShop also includes a separate frontend application built for interacting with this API.

The frontend provides the user-facing e-commerce experience, while this repository is responsible for the backend API and business logic.

---

## 👨‍💻 Author

Mohamed Mahmoud

---

## 📄 License

This project was built for educational and portfolio purposes.
