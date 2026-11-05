# Secure Notes: Backend Focused Application with Role-Based Access Control

A full-stack application for managing personal notes and public posts, featuring JWT-based authentication, role-based access control, and administrative management capabilities.

## Live Demo

[View Live Application](https://backend-demo-frontend.vercel.app)

## Overview

Secure Notes is a web application that allows users to register, authenticate, manage personal notes, and publish public posts. It also provides administrative functionality for managing users and accessing application-wide data.

The backend is built with **Node.js, Express.js, and MongoDB**, following a modular architecture with separate routes, controllers, middleware, models, and utilities.

## Features

### Authentication & Authorization
- User registration and login.
- JWT-based authentication.
- Password hashing using bcrypt.
- Role-based access control (User and Admin).
- Protected API endpoints.

### Personal Notes
- Create, retrieve, update, and delete personal notes.
- Ownership-based access control.
- Users can access and manage their own notes.

### Public Posts
- Create and publish posts.
- Retrieve individual posts and public post listings.
- Update and delete posts with author-based access control.
- Retrieve posts belonging to a specific user.

### Administrative Operations
- Retrieve all notes.
- View and manage registered users.
- Retrieve users based on their interests.
- Perform administrative CRUD operations.

### Backend Capabilities
- RESTful API architecture.
- MongoDB database integration using Mongoose.
- MongoDB aggregation pipelines.
- Cursor-based pagination.
- Input validation and error handling.
- Reusable authentication and authorization middleware.

## Tech Stack

| Category | Technologies |
|---|---|
| Runtime | Node.js |
| Backend Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| Password Security | bcrypt |
| Middleware | Express Middleware, CORS |
| Environment Configuration | dotenv |
| Development Tools | Nodemon |

## Project Structure

```text
backend-demo/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
└── frontend/
```

## API Endpoints

All endpoints use the `/api` base path.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |

### Notes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/notes` | Create a note |
| GET | `/api/notes` | Retrieve personal notes |
| GET | `/api/notes/:id` | Retrieve a specific note |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |

### Posts

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/posts` | Retrieve public posts |
| GET | `/api/posts/:id` | Retrieve a specific post |
| POST | `/api/posts` | Create a post |
| GET | `/api/posts/user/:userId` | Retrieve posts by user |
| PUT | `/api/posts/:id` | Update a post |
| DELETE | `/api/posts/:id` | Delete a post |

### Administration

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/notes` | Retrieve all notes |
| GET | `/api/admin/users` | Retrieve users |
| POST | `/api/admin/users` | Create a user |
| GET | `/api/admin/users/:id` | Retrieve a specific user |
| PUT | `/api/admin/users/:id` | Update a user |
| DELETE | `/api/admin/users/:id` | Delete a user |
| GET | `/api/admin/users-by-interest` | Retrieve users by interest |

**Authorization:** Administrative endpoints require an authenticated administrator. Protected endpoints require a valid JWT access token.

## Security & Access Control

The application implements several security-related mechanisms:

- Password hashing with bcrypt before database storage.
- JWT verification through reusable authentication middleware.
- Role-based authorization for administrative operations.
- Ownership verification for personal notes and user-created posts.
- Unique email constraints and database-level validation through Mongoose.

## Database Design

MongoDB is used as the primary database, with Mongoose schemas defining application data models.

The user model includes:
- Name and email.
- Hashed password.
- User role.
- Interests.
- Creation and update timestamps.

Additional models support notes and posts.

## Deployment

- **Frontend:** [Vercel](https://backend-demo-frontend.vercel.app)
- **Backend:** Node.js and Express.js
- **Database:** MongoDB

The frontend communicates with the backend through RESTful API endpoints.
---

*This project was developed to demonstrate practical backend development, REST API design, authentication, authorization, and database management.*
