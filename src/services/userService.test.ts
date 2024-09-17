import axios from 'axios';
import { fetchUsers } from './userService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('User Service', () => {
  it('should fetch users', async () => {
    const users = [{ id: 1, name: 'John Doe', email: 'john.doe@example.com' }];
    mockedAxios.get.mockResolvedValue({ data: users });

    const result = await fetchUsers();
    expect(result).toEqual(users);
  });

  it('should handle errors', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));

    await expect(fetchUsers()).rejects.toThrow('Network Error');
  });

});
