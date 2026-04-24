# Pick-Up Logistics API

A modern, scalable logistics API built with Node.js, Express, TypeScript, and MongoDB. Manage shipments, track deliveries in real-time, handle email notifications, and support multiple user roles—all with a robust event-driven architecture.

## 📋 Overview

Pick-Up Logistics is a full-featured backend API for logistics and delivery management. It provides comprehensive shipment tracking, real-time notifications via WebSocket, role-based access control, and event-driven email processing.

**Key Features:**
- 🚚 **Shipment Management** – Create, track, and manage shipments across multiple statuses
- 🔐 **JWT Authentication** – Secure API endpoints with token-based authentication and OTP verification
- 👥 **Role-Based Access Control** – Support for customer, business, admin, and driver roles
- 📡 **Real-Time Updates** – Socket.io integration for live shipment tracking and notifications
- 📧 **Async Email Queue** – BullMQ-powered email processing with worker pool
- 📊 **Event-Driven Architecture** – Decoupled side effects using Node EventEmitter
- 📝 **Swagger Documentation** – Auto-generated API docs with swagger-ui-express
- 🧪 **Comprehensive Testing** – Jest tests with MongoDB Memory Server (no external DB needed)
- ⚡ **TypeScript Strict Mode** – Type-safe codebase with strict ESLint rules

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 20+ |
| **Language** | TypeScript 5.4+ |
| **Framework** | Express 4.19+ |
| **Database** | MongoDB 8.x (Mongoose ODM) |
| **Cache & Queue** | Redis 7+ (ioredis, BullMQ) |
| **Real-Time** | Socket.io 4.8+ |
| **Testing** | Jest 30+, MongoDB Memory Server 11+ |
| **Code Quality** | ESLint 10+, TypeScript strict mode |
| **Email** | Resend 6.9+ (transactional email API) |

## 📦 Prerequisites

- **Node.js** 20 or higher
- **npm** 10+
- **MongoDB** 5.0+ (or use MongoDB Atlas for cloud)
- **Redis** 7+ (self-hosted or cloud service)
- **Resend API Key** (for email functionality)

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd pick-up-api
npm install
```

### 2. Environment Setup

Copy the example configuration and update with your credentials:

```bash
cp config.env.example config.env
```

Configure `config.env` with your environment variables:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
DATABASE=mongodb+srv://username:password@cluster.mongodb.net/pickup-logistics
DATABASE_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=1d
JWT_COOKIE_EXPIRES_IN=10

# OTP (One-Time Password)
OTP_EXPIRES_IN=300

# Redis
REDIS_URL=redis://user:password@localhost:6379
# OR
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Email (Resend)
RESEND_API_KEY=re_your_resend_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### 3. Development

Start the development server with hot reload:

```bash
npm run dev
```

In another terminal, start the email worker:

```bash
npm run dev:worker
```

The server runs on `http://localhost:3000` by default.

### 4. View API Documentation

Open your browser to `http://localhost:3000/api-docs` for interactive Swagger documentation.

## 📖 Usage

### Build for Production

```bash
npm run build
npm start
```

Email worker (separate process):

```bash
npm run start:worker
```

### Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server with hot reload (nodemon + tsx) |
| `npm run dev:worker` | Start email worker in dev mode |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled server |
| `npm run start:worker` | Run compiled email worker |
| `npm run prod` | Start in production mode |
| `npm test` | Run all tests (in-band, in-memory DB) |
| `npm test -- --watch` | Run tests in watch mode |
| `npm test -- --testPathPattern=shipment` | Run specific test file |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |

## 🏗️ Architecture

### Request Flow

```
Request
  ↓
Routes (routes/)
  ↓
Validator Middleware (Joi schemas)
  ↓
Authentication Middleware (JWT)
  ↓
Authorization Middleware (role check)
  ↓
Controllers (business logic & HTTP handling)
  ↓
Services (domain logic)
  ↓
Models (MongoDB schemas)
```

### Core Patterns

**Controller-Service-Model Pattern:**
- **Controllers** (`controller/`) – Handle HTTP requests/responses
- **Services** (`services/`) – Contain business logic and database operations
- **Models** (`models/`) – Define Mongoose schemas

**Event-Driven Architecture:**
- `events/eventBus.ts` – Central event emitter
- Events: `shipment.cancelled`, `shipment.status_changed`, `invoice.generated`
- `events/registerEventListeners.ts` – Registers listeners for side effects (audit logs, notifications)

**Async Email Queue:**
- `Queues/emailQueue.ts` – BullMQ queue configuration
- `worker/emailWorker.ts` – Separate worker process for processing emails
- `templates/` – Email templates

**Real-Time WebSocket:**
- `socket.ts` – Socket.io configuration
- Rooms: `tracking_${trackingNumber}` (shipment updates), per-user notification rooms

**Validation:**
- `SchemaTypes/` – Joi validation schemas
- `middleware/validator.ts` – Applies schemas with role context
- Supports conditional validation based on user role

**Error Handling:**
- `utils/ErrorClass.ts` – Custom error class with statusCode
- `controller/errorController.ts` – Global error handler
- `express-async-errors` – Automatic async error catching

### User Roles

- **customer** – End users tracking shipments
- **business** – Merchants creating and managing shipments
- **admin** – Administrative access and system management
- **driver** – Delivery personnel (pickup/drop-off)

Roles enforced via `middleware/restrictTo.ts` on protected routes.

### Shipment Statuses

```
PENDING → ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED
              ↓
          CANCELLED (at any stage)
```

Defined in `constants/shipmentStatus.ts`. Events triggered on status changes.

## 🧪 Testing

### Test Setup

Tests use **MongoDB Memory Server** (in-memory, no external DB needed). 

- `tests/setup.ts` – Database setup/teardown helpers
- `tests/__mocks__/` – Auto-mocked modules for testing
  - `protector.ts` – Auth bypass (injects test user)
  - `emailQueue.ts` – Email queue stub
  - `redis.ts` – Redis stub

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Single test file
npm test -- --testPathPattern=shipment.cancel
```

### Test Requirements

- Tests must set `NODE_ENV`, `RESEND_API_KEY`, and other required env vars **before imports**
- Run with `--runInBand --forceExit` (see `jest.config.cjs`)
- No external database or Redis needed—all mocked

## 🔒 Authentication & Authorization

### JWT Authentication

- Tokens sent via **Bearer header** (`Authorization: Bearer <token>`) or **HTTP-only cookie**
- Protected routes verified by `middleware/protector.ts`
- Token expiry configurable via `JWT_EXPIRES_IN`

### OTP Verification

- One-Time Passwords stored in Redis with expiry (`OTP_EXPIRES_IN`)
- Used for sensitive operations (e.g., email verification)

### Password Security

- Hashed with bcrypt (12 rounds)
- Never stored in plain text

## 📡 WebSocket Events (Socket.io)

Real-time tracking and notifications:

- **`shipment:updated`** – Broadcast when shipment status changes
- **`notification:received`** – User-specific notifications
- **Join tracking room** – `socket.join(`tracking_${trackingNumber}`)`

## 📧 Email Processing

**Async Queue Approach:**
1. Service enqueues email job with `Queues/emailQueue.ts`
2. BullMQ stores job in Redis
3. Worker (`worker/emailWorker.ts`) processes jobs independently
4. Resend API sends emails

Templates in `templates/` directory. Decoupled from main request flow—failures don't break API responses.

## 🐳 Deployment

### Environment Variables in Production

Set all required env vars (database, Redis, JWT secret, Resend API key) via:
- Environment configuration management (AWS Secrets Manager, Railway config, etc.)
- OR a secure `.env` file (not version-controlled)

### Production Checklist

- [ ] `NODE_ENV=production`
- [ ] Strong `JWT_SECRET` (min 32 chars)
- [ ] MongoDB Atlas connection (or secure MongoDB instance)
- [ ] Redis 7+ (or Redis Cloud)
- [ ] Resend account with API key
- [ ] CORS configured for your frontend domain
- [ ] Rate limiting enabled (`express-rate-limit`)
- [ ] Helmet security headers enabled
- [ ] MongoDB authentication enabled
- [ ] Run full test suite before deployment

### Database Migrations

Currently no migration system. Schema changes should be:
1. Updated in `models/`
2. Tested thoroughly
3. Deployed with code

## 🚨 Error Handling

All errors follow a consistent format:

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "User-friendly error message"
}
```

The global error controller (`controller/errorController.ts`) handles:
- Operational errors (custom `ErrorClass`)
- MongoDB validation errors
- JWT errors
- Unhandled promise rejections

## 📊 Code Quality

### Linting & Type Checking

```bash
npm run lint        # Check code style
npm run typecheck   # Check type safety
npm run build       # Compile (catches TS errors)
```

### TypeScript Strictness

- Strict mode enabled
- `exactOptionalPropertyTypes` – Strict optional property handling
- `noUncheckedIndexedAccess` – Safe object indexing
- `verbatimModuleSyntax` – Explicit import/export syntax
- ES Modules (`"type": "module"` in package.json)
- All local imports use `.js` extensions (even for `.ts` files)

## 🔄 CI/CD Pipeline

GitHub Actions (`.github/workflows/ci.yml`) runs on every push:

1. **Lint** – ESLint checks
2. **Type Check** – TypeScript validation
3. **Build** – Compile to JavaScript
4. **Test** – Jest tests with Redis 7 service
5. **Audit** – npm security audit

Runs on Node 20 with Redis 7 service container.

## 📝 Project Structure

```
.
├── app.ts                    # Express app setup
├── server.ts                 # Entry point
├── socket.ts                 # Socket.io configuration
├── db.ts                     # MongoDB connection
├── config.env.example        # Environment template
├── constants/                # App constants (shipment statuses, etc.)
├── controller/               # HTTP controllers
├── middleware/               # Express middlewares (auth, validation, etc.)
├── models/                   # Mongoose schemas
├── routes/                   # API route definitions
├── services/                 # Business logic
├── types/                    # TypeScript type definitions
├── utils/                    # Utility functions
├── events/                   # Event emitter & listeners
├── Queues/                   # BullMQ queue setup
├── worker/                   # Email worker process
├── templates/                # Email templates
├── SchemaTypes/              # Joi validation schemas
├── tests/                    # Jest test files
├── dist/                     # Compiled JavaScript (generated)
├── node_modules/             # Dependencies (generated)
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript config
├── jest.config.cjs           # Jest config
├── eslint.config.js          # ESLint config
└── swagger.json              # API documentation
```

## 🤝 Contributing

We welcome contributions! Follow these guidelines:

### Setup Development Environment

```bash
git clone <repository-url>
cd pick-up-api
npm install
cp config.env.example config.env
# Configure config.env with test credentials
npm run dev
```

### Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test:**
   ```bash
   npm run lint         # Fix linting issues
   npm run typecheck    # Check types
   npm test             # Run tests
   npm run build        # Verify build
   ```

3. **Commit with clear messages:**
   ```bash
   git commit -m "feat: add shipment cancellation feature"
   ```

4. **Push and create a pull request:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Standards

- **Language:** TypeScript with strict mode
- **Style:** Follow ESLint rules (run `npm run lint`)
- **Testing:** Add tests for new features
- **Commits:** Use conventional commits (feat:, fix:, docs:, etc.)
- **Types:** Avoid `any`; use explicit types

### Commit Convention

```
feat: add new feature
fix: bug fix
docs: documentation updates
refactor: code refactoring
test: test updates
chore: dependency updates, config changes
```

### Pull Request Checklist

- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Types pass (`npm run typecheck`)
- [ ] Build succeeds (`npm run build`)
- [ ] Meaningful commit messages
- [ ] Documentation updated (if needed)
- [ ] No console.log or debug code

## 📄 License

ISC

## 🆘 Support & Issues

For bugs, feature requests, or questions:

1. Check existing [GitHub Issues](https://github.com/yourusername/pick-up-api/issues)
2. Open a new issue with:
   - Clear description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Environment details (Node version, OS, etc.)

## 📞 Contact

For questions or collaboration:
- GitHub Issues – For bugs and features
- Email – [Your contact email]

---

**Happy shipping! 🚀**
