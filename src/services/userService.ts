import axios from 'axios';

export const fetchUsers = async (): Promise<any[]> => {
  const response = await axios.get(`${process.env.API_BASE_URL}/users`);
  return response.data;
};
