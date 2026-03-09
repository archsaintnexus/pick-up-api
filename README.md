# Pick-Up Logistics API

A professional logistics management API built with Node.js, Express, and MongoDB. This API handles shipment tracking, user authentication, and administrative operations for a pick-up logistics system.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Management**: User registration and authentication
- **Shipment Tracking**: Create, track, and manage shipments
- **Shipment Cancellation**: Cancel shipments with proper validation
- **Invoice Generation**: Generate invoices for shipments
- **Admin Dashboard**: Administrative controls for shipment management
- **Security**: Helmet, CORS, and MongoDB sanitization
- **Error Handling**: Comprehensive error handling with async support
- **Rate Limiting**: Built-in rate limiting for API protection
- **Logging**: Morgan HTTP request logging
- **Type Safety**: Full TypeScript support

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Language**: TypeScript
- **Authentication**: JWT-based (ready for implementation)
- **Validation**: Joi schema validation
- **Security**:
  - Helmet for HTTP headers security
  - CORS for cross-origin requests
  - MongoDB sanitization
  - Rate limiting
- **Email**: Nodemailer and Resend integration
- **Development Tools**: Nodemon, tsx, Mocha for testing

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn package manager
- MongoDB (local or Atlas cloud database)
- Git

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

Create a `config.env` file in the root directory by copying the example:

```bash
cp config.env.example config.env
```

Edit `config.env` and set your environment variables:

```env
PORT=3000
NODE_ENV=development
DATABASE=mongodb+srv://YOUR_USERNAME:<db_password>@YOUR_CLUSTER.mongodb.net/pickup-logistics?retryWrites=true&w=majority
DATABASE_PASSWORD=YOUR_REAL_PASSWORD
```

**Key Variables**:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development or production)
- `DATABASE`: MongoDB connection string
- `DATABASE_PASSWORD`: MongoDB password (used in connection string)

## Configuration

The application uses environment-based configuration:

- **Development**: Uses Morgan HTTP request logging for better visibility
- **Production**: Optimized for performance and security
- **Error Handling**: Different error handling strategies based on environment

TypeScript configuration is managed in `tsconfig.json` with ES modules support.

## Usage

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

This uses `nodemon` and `tsx` for fast TypeScript execution with automatic restart on file changes.

### Production Mode

For production with environment set to Production:

```bash
npm run prod
```

### Build Only

Compile TypeScript to JavaScript:

```bash
npm build
```

### Start Production Server

```bash
npm start
```

This builds the TypeScript and starts the compiled JavaScript from `dist/server.js`.

## API Endpoints

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/signUp` | Register a new user |

### Shipment Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/shipments/history/:userId` | Get shipment history for a user |
| PATCH | `/api/v1/shipments/:shipmentId/cancel` | Cancel a shipment |
| GET | `/api/v1/shipments/:shipmentId/invoice` | Generate invoice for a shipment |

### Admin Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| * | `/api/v1/admin/*` | Administrative shipment management endpoints |

### Testing

| Method | Endpoint | Description |
|--------|----------|-------------|
| * | `/api/v1/test-shipments/*` | Test endpoints for shipment operations |

## Project Structure

```
.
├── controller/          # Request handlers and business logic
├── routes/              # API route definitions
├── models/              # Mongoose data models
│   ├── userModel.ts
│   ├── shipmentModel.ts
│   ├── invoiceModel.ts
│   └── auditLogModel.ts
├── middleware/          # Express middleware
├── services/            # Business logic services
├── utils/               # Utility functions and helpers
├── SchemaTypes/         # Joi validation schemas
├── app.ts               # Express app configuration
├── server.ts            # Server entry point
├── db.ts                # Database connection
├── config.env           # Environment variables (not committed)
├── config.env.example   # Example environment variables
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies
```

## Development

### Project Dependencies

Key dependencies used in this project:

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **joi** - Schema validation
- **helmet** - Security middleware
- **cors** - Cross-origin resource sharing
- **morgan** - HTTP request logging
- **express-rate-limit** - Rate limiting
- **nodemailer** & **resend** - Email services
- **uuid** - Unique identifier generation

### Code Style

- TypeScript with strict mode enabled
- ES6+ module syntax
- Async/await for asynchronous operations
- Joi for input validation

### Error Handling

The application includes a custom `ErrorClass` for consistent error handling across all endpoints. Global error middleware is implemented in `controller/errorController.js`.

## Building for Production

### Step 1: Build TypeScript

```bash
npm run build
```

This compiles TypeScript files in the source directory to JavaScript in the `dist/` directory.

### Step 2: Start the Server

```bash
npm start
```

Or manually:

```bash
NODE_ENV=production node dist/server.js
```

## Contributing

We welcome contributions to improve the Pick-Up Logistics API. Please follow these guidelines:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Commit with clear messages: `git commit -m "Add your feature description"`
5. Push to your fork: `git push origin feature/your-feature-name`
6. Open a Pull Request

### Code Contributions

- Maintain TypeScript type safety
- Follow the existing code structure and naming conventions
- Use meaningful variable and function names
- Add proper input validation using Joi schemas
- Write clean, readable code with minimal comments (comment complex logic only)
- Ensure your code doesn't break existing functionality

### Commit Guidelines

- Use clear, descriptive commit messages
- Reference issues when applicable
- Keep commits focused on a single feature or fix

### Pull Request Process

1. Ensure your code compiles without TypeScript errors
2. Test your changes thoroughly
3. Update relevant documentation
4. Provide a clear description of your changes in the PR

### Areas for Contribution

- Bug fixes and performance improvements
- New API endpoints and features
- Improved error handling and validation
- Documentation enhancements
- Test coverage improvements
- Security enhancements

## License

This project is licensed under the ISC License. See the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on the repository.

---

**Last Updated**: 2026-03-09
