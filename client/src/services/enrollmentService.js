import axios from 'axios';

const API_URL = '/api/notifications';

export const createEnrollmentRequest = async (degreeProgramId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/enrollment-request`,
      { degreeProgramId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error creating enrollment request' };
  }
};

export default {
  createEnrollmentRequest
};