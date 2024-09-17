# CCI Node API

An API built with Express.js and TypeScript.

## Table of Contents

- [Installation](#installation)
- [Scripts](#scripts)
- [API Documentation](#api-documentation)
- [Middleware](#middleware)
- [Error Handling](#error-handling)
- [Validation](#validation)

## Prerequisites
Before you start, ensure you have the following installed on your machine:
- Node.js (v20 or higher)
- npm (v6 or higher)
- Docker 
- Git

## Tech Stack
This project uses the following technologies:
- Node.js: JavaScript runtime environment.
- TypeScript: Typed superset of JavaScript.
- Express.js: Web framework for Node.js.
- Axios: Promise-based HTTP client for the browser and Node.js.
- Jest: JavaScript testing framework.
- ESLint: Linter for identifying and fixing problems in JavaScript/TypeScript code.
- Prettier: Code formatter.
- GitLab CI: Continuous Integration service provided by GitLab.
- Docker: Platform for developing, shipping, and running applications.


## Installation

1. Clone the repository:
   ```bash
   git clone https://galex.consolidated.com/ashley/cci-node-template.git
   cd cci-node-template
   ```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory and add the following environment variables:
```env
PORT=3000
API_BASE_URL=https://jsonplaceholder.typicode.com
```

4. Compile TypeScript:
```bash
npm run build
```

5. Run the application
```
npm start
```

## Scripts
`npm run build`: Compile the TypeScript code to JavaScript.
`npm start`: Run the compiled JavaScript code.
`npm run dev`: Run the application in development mode using `ts-node`

## API Documentation
The API documentation is generated using Swagger and can be accessed at http://localhost:3000/api-docs.

## Middleware
- Helmet: Secures the app by setting various HTTP headers.
- CORS: Enables Cross-Origin Resource Sharing.
- morgan: HTTP request logger.
- express-validator: Middleware for validating request bodies.

## Error Handling
A centralized error handling middleware is used to catch and respond to errors gracefully.

src/middlewares/errorHandler.ts:
```typescript
import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
};

export default errorHandler;
```

## Validation
Request Validation is implemented using `express-validator`.

src/routes/users.ts
```typescript
import { Router } from 'express';
import userController from '../controllers/userController';
import { body } from 'express-validator';

const router = Router();

router.get('/', userController.getAllUsers);

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Email is invalid')
  ],
  userController.createUser
);

export default router;
```

## Logging
Logging is implemented using Winston.

src/logger.ts:
```typescript
import winston from 'winston';

// Define the logger configuration and types
const logger: winston.Logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Add console transport if not in production environment
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Export the logger
export default logger;
```

To use the logger in your application, you can import it as follows:
```typescript
import logger from './logger';

logger.info('Application started');
logger.error('An error occurred');
```
This setup ensures that all logs are recorded in a consistent format and can be easily reviewed.