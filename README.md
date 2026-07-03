# Project Manager API

A backend-focused Project Management application built using Node.js, Express, and MongoDB. This API provides core features required to manage users, projects, tasks, and collaboration.

---

## 🚀 Features

* User Authentication (JWT-based)
* Project creation and management
* Task and subtask handling
* Project member management
* Input validation using middleware
* Email utilities (Nodemailer + Mailgen)
* Centralized error and response handling
* Health check endpoint

---

## 🛠️ Tech Stack

* **Node.js**
* **Express.js**
* **MongoDB (Mongoose)**
* **JWT Authentication**
* **Nodemailer (Email services)**
* **Express Validator**

---

## 📁 Folder Structure

```
src/
│
├── controllers/        # Business logic
├── db/                 # Database connection
├── middlewares/        # Auth & validation middleware
├── models/             # Mongoose schemas
├── routes/             # API routes
├── utils/              # Helpers (error handling, email, constants)
├── validators/         # Request validation logic
│
├── app.js              # Express app setup
└── index.js            # Entry point
```

---

## ⚙️ Installation & Setup

1. Clone the repository:

```
git clone <your-repo-link>
cd projectmanger
```

2. Install dependencies:

```
npm install
```

3. Create a `.env` file in the root directory and add:

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

4. Run the server:

```
npm run dev
```

---

## 📡 API Endpoints

### Auth Routes

* `POST /api/auth/register`
* `POST /api/auth/login`

### Project Routes

* `POST /api/projects/`
* `GET /api/projects/`
* `GET /api/projects/:id`

### Health Check

* `GET /api/health`

---

## 🔐 Authentication

* Uses JSON Web Tokens (JWT)
* Protected routes require token in headers:

```
Authorization: Bearer <token>
```

---

## 📬 Email Functionality

* Integrated using **Nodemailer**
* Supports sending emails using predefined templates via Mailgen

---

## 🧪 Scripts

```
npm run dev     # Run with nodemon
npm start       # Run normally
```

---

## 📌 Notes

* Backend-only project (no frontend included)
* Designed for learning and understanding API architecture
* Clean modular structure for scalability

---

## 📄 License

ISC License

---

## 👤 Author

Kunal Thakur
