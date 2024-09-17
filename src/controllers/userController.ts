import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { fetchUsers } from '../services/userService';

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await fetchUsers();
    const transformedUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name.toUpperCase(),
      email: user.email,
      city: user.address.city,
      company: user.company.name,
    }));
    res.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    next(error); // Ensure errors are passed to the error handling middleware
  }
};

const createUser = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  res.send('Create a new user');
};

export default { getAllUsers, createUser };
