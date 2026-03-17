# Pick-Up Logistics API

A comprehensive Node.js/Express API for managing logistics operations, shipment tracking, and user management. Built with TypeScript, MongoDB, and real-time WebSocket support.

## 📋 Overview

Pick-Up Logistics API is a production-ready backend service designed to streamline logistics operations. It provides features for user management, shipment tracking, real-time updates via WebSocket, and administrative controls.

### Key Features

- **User Management**: Registration, authentication, and profile management
- **Shipment Management**: Create, update, and manage shipments
- **Real-Time Tracking**: WebSocket support for live shipment updates
- **Admin Dashboard**: Administrative endpoints for shipment oversight
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Security**: Helmet for HTTP headers, CORS configuration, and request sanitization
- **Validation**: Joi schema validation for request payloads
- **Error Handling**: Comprehensive error handling and logging
- **TypeScript**: Full type safety across the codebase
- **Testing**: Jest-based unit and integration tests

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-Time**: Socket.io
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, express-mongo-sanitize
- **Email**: Nodemailer & Resend
- **Testing**: Jest & Supertest
- **Linting**: ESLint with TypeScript support
- **Development**: Nodemon, tsx

## 📦 Prerequisites

- Node.js >= 18.x
- npm >= 9.x or yarn
- MongoDB 4.4+ (local or Atlas)
- Environment variables configured (see [Configuration](#configuration))

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pick-up-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configuration

Create a `.env` file in the root directory based on the provided `.env.example`:

```bash
cp config.env.example config.env
```

Update `config.env` with your values:

```env
PORT=3000
NODE_ENV=development
DATABASE=mongodb+srv://username:password@cluster.mongodb.net/pickup-logistics?retryWrites=true&w=majority
DATABASE_PASSWORD=your_actual_password
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Required Environment Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `DATABASE` | MongoDB connection string | `mongodb+srv://...` |
| `DATABASE_PASSWORD` | MongoDB password | `your_password` |
| `RESEND_API_KEY` | Resend email service API key | `re_...` |
| `RESEND_FROM_EMAIL` | Sender email address | `noreply@domain.com` |

### 4. Start Development Server

```bash
npm run dev
```

The API will start on `http://localhost:3000`.

## 📚 Usage

### Development

Start the development server with hot reloading:

```bash
npm run dev
```

### Production

Build and start in production mode:

```bash
npm run build
npm start
```

Or with production environment variables:

```bash
npm run prod
```

### API Documentation

Access the interactive Swagger documentation at:

```
http://localhost:3000/api-docs
```

### Available Routes

#### Users
- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - User login
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

#### Shipments
- `POST /api/v1/shipments` - Create shipment
- `GET /api/v1/shipments` - List shipments
- `GET /api/v1/shipments/:id` - Get shipment details
- `PUT /api/v1/shipments/:id` - Update shipment
- `DELETE /api/v1/shipments/:id` - Delete shipment

#### Admin
- `GET /api/v1/admin/shipments` - List all shipments (admin)
- `PUT /api/v1/admin/shipments/:id` - Update shipment (admin)
- `GET /api/v1/admin/analytics` - Get analytics (admin)

### WebSocket Events

The API provides real-time updates via Socket.io:

```javascript
// Connect to WebSocket
const socket = io('http://localhost:3000');

// Listen for shipment updates
socket.on('shipment:updated', (data) => {
  console.log('Shipment updated:', data);
});

// Emit tracking request
socket.emit('track:shipment', { shipmentId: '123' });
```

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Generate Coverage Report

```bash
npm test -- --coverage
```

## 🔍 Code Quality

### Linting

Check code style with ESLint:

```bash
npm run lint
```

### Type Checking

Run TypeScript type checking:

```bash
npm run typecheck
```

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

## 📁 Project Structure

```
pick-up-api/
├── controller/        # Request handlers and business logic
├── routes/           # API route definitions
├── models/           # MongoDB models and schemas
├── services/         # Business logic and utilities
├── middleware/       # Custom Express middleware
├── utils/            # Helper functions and utilities
├── events/           # Event listeners and handlers
├── SchemaTypes/      # TypeScript schema interfaces
├── tests/            # Test suites
├── constants/        # Application constants
├── socket.ts         # Socket.io configuration
├── db.ts             # Database connection
├── app.ts            # Express app setup
├── server.ts         # Server entry point
├── swagger.json      # API documentation
├── tsconfig.json     # TypeScript configuration
└── package.json      # Dependencies and scripts
```

## 🤝 Contributing

We welcome contributions from the community! Please follow these guidelines:

### Getting Started with Contributing

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/pick-up-api.git
   cd pick-up-api
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Workflow

1. **Install dependencies**: `npm install`
2. **Make your changes** and add tests for new functionality
3. **Run linting**: `npm run lint`
4. **Run type checking**: `npm run typecheck`
5. **Run tests**: `npm test`
6. **Build the project**: `npm run build`

### Before Submitting a Pull Request

- Ensure all tests pass: `npm test`
- Ensure code is properly linted: `npm run lint`
- Ensure TypeScript types are valid: `npm run typecheck`
- Add or update tests for your changes
- Update documentation if needed
- Follow the existing code style and patterns

### Pull Request Process

1. Push your feature branch to your fork
2. Create a Pull Request against the main repository
3. Provide a clear description of your changes
4. Reference any related issues
5. Wait for code review and CI checks to pass
6. Address any feedback from reviewers

### Commit Messages

Write clear, descriptive commit messages:

```bash
# Good
git commit -m "feat: add shipment status notification system"
git commit -m "fix: resolve race condition in shipment updates"
git commit -m "docs: update API documentation for tracking endpoints"

# Avoid
git commit -m "fixed stuff"
git commit -m "update"
```

### Code Style

- Follow the existing code patterns and conventions
- Use TypeScript for new code
- Add JSDoc comments for complex functions
- Keep functions focused and testable
- Use meaningful variable and function names

### Reporting Issues

If you find a bug or have a feature request:

1. Check if the issue already exists
2. Provide a clear description
3. Include steps to reproduce (for bugs)
4. Attach relevant error logs or screenshots
5. Specify your environment (Node version, OS, etc.)

## 🔒 Security

- **Helmet**: Protects against common HTTP vulnerabilities
- **CORS**: Configured for secure cross-origin requests
- **Sanitization**: MongoDB injection protection via express-mongo-sanitize
- **Rate Limiting**: Available via express-rate-limit
- **Environment Variables**: Sensitive data stored in environment, not in code
- **Validation**: All inputs validated with Joi schemas

### Security Best Practices

- Never commit `.env` files or sensitive credentials
- Always use HTTPS in production
- Keep dependencies updated: `npm audit fix`
- Validate and sanitize all user inputs
- Use environment-specific configurations

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 💡 Support

For issues, questions, or suggestions:

1. Check existing issues and discussions
2. Create a new GitHub issue with detailed information
3. Contact the development team

## 🔄 Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Configure environment
cp config.env.example config.env
# Edit config.env with your settings

# Start development server
npm run dev

# In another terminal, run tests
npm test -- --watch
```

### Making Changes

1. Create a feature branch
2. Make your changes
3. Run linting and type checking
4. Write tests for new functionality
5. Update documentation
6. Commit with clear messages

### Deployment

1. Ensure all tests pass: `npm test`
2. Build the project: `npm run build`
3. Run in production: `npm start`
4. Monitor logs and metrics

## 📞 Contact

For more information about this project, please contact the development team or open an issue on GitHub.

---

**Happy coding! 🚀**
