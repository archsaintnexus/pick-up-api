# Pick-Up Logistics API

A modern, scalable Node.js API for managing shipment logistics and real-time tracking using Express.js, MongoDB, and Socket.IO.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Overview

Pick-Up Logistics is a comprehensive API designed to streamline shipment management and logistics operations. It provides real-time tracking capabilities, user authentication, and administrative controls for managing shipments efficiently. The API is built with TypeScript for type safety and uses MongoDB as the primary data store.

## Features

- **User Management**: Register, authenticate, and manage user accounts
- **Shipment Management**: Create, update, and track shipments
- **Real-Time Updates**: Socket.IO integration for live shipment tracking and notifications
- **Admin Dashboard**: Administrative endpoints for shipment oversight and management
- **Security**: Helmet.js for HTTP security headers, rate limiting, and MongoDB sanitization
- **API Documentation**: Integrated Swagger/OpenAPI documentation at `/api-docs`
- **Error Handling**: Comprehensive error handling with custom error classes
- **CORS Support**: Cross-origin resource sharing enabled for flexible client integration
- **Request Logging**: Morgan middleware for HTTP request logging in development

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-Time**: Socket.IO
- **Validation**: Joi
- **Security**: Helmet, Express Rate Limit, MongoDB Sanitizer
- **Documentation**: Swagger UI Express
- **Email**: Nodemailer and Resend
- **Development**: Nodemon, tsx, TypeScript

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB account (local or cloud via MongoDB Atlas)
- Environment variables configured

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pick-up-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp config.env.example config.env
   ```
   
   Edit `config.env` with your actual values:
   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE=mongodb+srv://YOUR_USERNAME:<db_password>@YOUR_CLUSTER.mongodb.net/pickup-logistics?retryWrites=true&w=majority
   DATABASE_PASSWORD=YOUR_REAL_PASSWORD
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   # Development mode (with hot reload)
   npm run dev

   # Production mode
   npm run prod

   # Standard start (requires build first)
   npm start
   ```

The API will be available at `http://localhost:3000` (or your configured PORT).

## Usage

### Starting the Server

```bash
# Development with nodemon and hot reload
npm run dev

# Production environment
npm run prod

# Build and run
npm run build && npm start
```

### API Endpoints

The API provides the following main endpoint groups:

#### Users API
- **Base URL**: `/api/v1/users`
- User registration, authentication, and profile management

#### Shipments API
- **Base URL**: `/api/v1/shipments`
- Create, retrieve, and manage shipments
- Real-time tracking updates via Socket.IO

#### Admin API
- **Base URL**: `/api/v1/admin`
- Administrative shipment management and oversight

### Real-Time Features

The API uses Socket.IO for real-time communication:

```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

// Listen for shipment updates
socket.on('shipmentUpdate', (data) => {
  console.log('Shipment updated:', data);
});

// Emit tracking requests
socket.emit('trackShipment', { shipmentId: '123' });
```

### API Documentation

Interactive API documentation is available at:
```
http://localhost:3000/api-docs
```

This Swagger UI interface allows you to explore all available endpoints, view request/response schemas, and test endpoints directly.

## Project Structure

```
pick-up-api/
├── app.ts                 # Express app configuration
├── server.ts              # Server entry point
├── db.ts                  # MongoDB connection setup
├── socket.ts              # Socket.IO configuration
├── config.env             # Environment variables (git ignored)
├── tsconfig.json          # TypeScript configuration
├── swagger.json           # Swagger/OpenAPI documentation
│
├── controller/            # Route handlers and business logic
│   └── errorController.ts # Global error handling
│
├── routes/                # API route definitions
│   ├── userRoute.ts
│   ├── shipmentRoute.ts
│   └── adminShipmentRoute.ts
│
├── models/                # Mongoose schemas and models
│
├── services/              # Business logic and external integrations
│
├── middleware/            # Custom Express middleware
│
├── events/                # Event listeners and handlers
│   └── registerEventListeners.ts
│
├── SchemaTypes/           # TypeScript types for schemas
│
├── utils/                 # Utility functions
│   └── ErrorClass.ts      # Custom error class
│
├── constants/             # Application constants
│
└── node_modules/          # Dependencies (git ignored)
```

## Contributing

We welcome contributions to the Pick-Up Logistics API! Please follow these guidelines:

### Getting Started

1. **Fork the repository** and clone your fork
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and ensure code quality

### Code Standards

- **Language**: TypeScript with strict mode enabled
- **Style**: Follow existing code conventions
- **Type Safety**: All functions and variables should have proper TypeScript types
- **Error Handling**: Use the custom `ErrorClass` for consistent error management
- **Validation**: Use Joi for request validation

### Before Submitting a Pull Request

1. **Test your changes**
   ```bash
   npm run build
   ```

2. **Verify the API still starts correctly**
   ```bash
   npm run dev
   ```

3. **Check for TypeScript errors**
   ```bash
   npx tsc --noEmit
   ```

4. **Format and review your code** for consistency and clarity

### Pull Request Process

1. Update the README if your changes introduce new features or configuration
2. Clearly describe the changes in your pull request
3. Reference any related issues
4. Ensure all checks pass before requesting review

### Reporting Issues

When reporting issues, please include:
- A clear description of the problem
- Steps to reproduce the issue
- Expected vs. actual behavior
- Your environment details (Node version, OS, etc.)

## License

This project is licensed under the ISC License. See the package.json for more details.

---

**Maintained by**: Your Team Name

For questions or support, please open an issue on the repository or contact the development team.
