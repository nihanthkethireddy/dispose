import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import indexRouter from './routes/index';
import usersRouter from './routes/users';
import errorHandler from './middlewares/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger';
import logger from './logger';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

// Middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) }}));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/ping', (req, res) => {
  res.send("pong")
});
// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Swagger API documentation
// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`App listening on port: ${port}`);
});
