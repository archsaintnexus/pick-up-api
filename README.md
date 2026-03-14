# Pick-Up Logistics API

A comprehensive Node.js REST API for managing logistics operations, shipments, and tracking. Built with Express.js and TypeScript, this API provides robust features for handling shipment lifecycle management, user authentication, and real-time tracking capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Overview

Pick-Up Logistics API is a modern logistics management system designed to streamline shipment operations. It provides complete functionality for:

- User authentication and account management
- Shipment creation, tracking, and management
- Admin dashboard for monitoring and controlling shipments
- Real-time shipment tracking updates
- Audit logging and invoice generation

The API is production-ready with security features including helmet.js for HTTP headers, CORS support, request sanitization, and rate limiting.

## Features

✅ **User Management**
- User registration and authentication
- Secure password handling
- User profile management

✅ **Shipment Management**
- Create and manage shipments
- Track shipment status in real-time
- Admin control panel for shipment oversight
- Shipment history and audit logging

✅ **Tracking System**
- Real-time shipment tracking
- Location updates
- Status notifications

✅ **Security**
- Helmet.js for HTTP header protection
- MongoDB data sanitization
- CORS protection
- Environment-based configuration

✅ **Developer Experience**
- TypeScript for type safety
- Async/await error handling
- Request validation with Joi
- Comprehensive error handling
- Morgan logging

## Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js v4
- **Database:** MongoDB with Mongoose
- **Validation:** Joi
- **Security:** Helmet.js, CORS, Express Mongo Sanitize
- **Email:** Nodemailer & Resend
- **Development:** Nodemon, tsx, Morgan

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v16 or higher
- **npm** v8 or higher
- **MongoDB** database (local or MongoDB Atlas cloud)
- **Git** for version control

## Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pick-up-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `config.env` file in the root directory based on `config.env.example`:

```bash
cp config.env.example config.env
```

Edit `config.env` and add your configuration:

```env
PORT=3000
NODE_ENV=development
DATABASE=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/pickup-logistics?retryWrites=true&w=majority
DATABASE_PASSWORD=YOUR_REAL_PASSWORD
```

### 4. MongoDB Setup

#### Option A: MongoDB Atlas (Cloud)

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Create a database user with credentials
4. Get your connection string
5. Replace `YOUR_USERNAME`, `YOUR_PASSWORD`, and `YOUR_CLUSTER` in your `config.env`

#### Option B: Local MongoDB

1. Install MongoDB locally
2. Update your `DATABASE` URL to: `mongodb://localhost:27017/pickup-logistics`

### 5. Verify Installation

```bash
npm run build
```

This should compile TypeScript without errors.

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `DATABASE` | MongoDB connection string | - |
| `DATABASE_PASSWORD` | MongoDB password | - |

### Request Limits

- JSON payload limit: **10kb**
- URL-encoded payload limit: **10kb**

### Middleware Stack

The API includes the following middleware:

1. **CORS** - Cross-Origin Resource Sharing
2. **Helmet** - HTTP header security
3. **Morgan** - Request logging (development only)
4. **Express JSON Parser** - Parse JSON requests
5. **Express URL Encoder** - Parse URL-encoded requests
6. **Mongo Sanitize** - Prevent NoSQL injection
7. **Error Handler** - Centralized error handling

## Usage

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Production Mode

Start the production server:

```bash
npm run prod
```

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

### Run Compiled Code

Start the compiled server:

```bash
npm start
```

## API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Users
```
POST   /users/register          - Register a new user
POST   /users/login             - Login user
GET    /users/:id               - Get user details
PUT    /users/:id               - Update user profile
DELETE /users/:id               - Delete user account
```

### Shipments
```
POST   /shipments               - Create new shipment
GET    /shipments               - List user shipments
GET    /shipments/:id           - Get shipment details
PUT    /shipments/:id           - Update shipment
DELETE /shipments/:id           - Cancel shipment
GET    /shipments/:id/tracking  - Get shipment tracking info
```

### Admin Shipments
```
GET    /admin/shipments         - List all shipments
PUT    /admin/shipments/:id     - Update shipment status
GET    /admin/shipments/:id     - Get shipment details
DELETE /admin/shipments/:id     - Delete shipment
```

### Shipment Tracking
```
GET    /shipments/:id/tracking  - Get tracking details
POST   /shipments/:id/tracking  - Create tracking update
```

For detailed API documentation, refer to the controller files in the `controller/` directory.

## Project Structure

```
pick-up-api/
├── controller/              # Route handlers and business logic
│   ├── authController.ts
│   ├── shipmentController.ts
│   ├── adminShipmentController.ts
│   ├── shipmentTrackingController.ts
│   └── errorController.ts
├── routes/                  # API route definitions
│   ├── userRoute.ts
│   ├── shipmentRoute.ts
│   ├── adminShipmentRoute.ts
│   └── shipmentTrackingRoute.ts
├── models/                  # MongoDB schema definitions
│   ├── userModel.ts
│   ├── shipmentModel.ts
│   ├── shipmentTrackingModel.ts
│   ├── invoiceModel.ts
│   └── auditLogModel.ts
├── services/                # Business logic services
├── middleware/              # Express middleware
├── utils/                   # Utility functions and classes
├── constants/               # Application constants
├── SchemaTypes/             # TypeScript schema type definitions
├── app.ts                   # Express app configuration
├── server.ts                # Server entry point
├── db.ts                    # Database connection
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies and scripts
└── config.env               # Environment variables (not in git)
```

## Contributing

We welcome contributions from the community! Please follow these guidelines:

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/pick-up-api.git
   cd pick-up-api
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Making Changes

1. **Follow TypeScript best practices**
   - Use strict typing
   - Avoid `any` types
   - Keep functions focused and reusable

2. **Code Style**
   - Use consistent indentation (2 spaces)
   - Follow existing naming conventions
   - Write clear, descriptive variable and function names

3. **Testing**
   - Test your changes thoroughly
   - Ensure existing functionality is not broken
   - Add test cases if test suite exists

4. **Commit Messages**
   - Write clear, descriptive commit messages
   - Use present tense ("Add feature" not "Added feature")
   - Reference related issues or pull requests

   Example:
   ```
   Add user email verification endpoint
   
   - Implement email verification logic
   - Add JWT token generation for verification
   - Update user model with verification status
   ```

### Submitting Changes

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request**
   - Provide a clear title and description
   - Reference any related issues (#123)
   - Explain the changes and why they're needed
   - Ensure all tests pass

3. **Code Review**
   - Be open to feedback
   - Make requested changes promptly
   - Discuss any concerns or questions

### Reporting Issues

When reporting bugs:
- Provide a clear title and description
- Include steps to reproduce
- Provide expected vs actual behavior
- Include relevant error messages or logs
- Mention your environment (Node version, OS, etc.)

### Feature Requests

When suggesting new features:
- Clearly describe the feature
- Explain the use case and benefits
- Provide examples if possible
- Consider backward compatibility

## License

This project is licensed under the ISC License. See LICENSE file for details.

---

## Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

**Happy coding!** 🚀
