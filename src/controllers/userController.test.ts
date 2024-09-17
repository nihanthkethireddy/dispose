import request from 'supertest';
import express, {NextFunction, Request, Response} from 'express';
import userController from './userController';
import { body, validationResult } from 'express-validator';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const app = express();
app.use(express.json());
app.get('/users', userController.getAllUsers);
app.post(
  '/users',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Email is invalid'),
  ],
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  userController.createUser
);

describe('User Controller', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // Reset mocks before each test
  });

  it('should return all users', async () => {
    const users = [{ id: 1, name: 'John Doe', email: 'john.doe@example.com', address: { city: 'New York' }, company: { name: 'Acme Corp' } }];
    mockedAxios.get.mockResolvedValue({ data: users });

    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('should create a new user', async () => {
    const newUser = { name: 'John Doe', email: 'john.doe@example.com' };
    const response = await request(app).post('/users').send(newUser);
    expect(response.status).toBe(200);
    expect(response.text).toBe('Create a new user');
  });

  it('should fail to create a user with invalid data', async () => {
    const newUser = { name: '', email: 'invalid-email' };
    const response = await request(app).post('/users').send(newUser);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });
});
