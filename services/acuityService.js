import axios from 'axios';
import logger from '../utils/logger.js'; // Adjust the path as needed

// Helper function to generate the Acuity Basic Auth header
const getAcuityAuthHeader = () => {
  const acuityUserId = process.env.ACUITY_USER_ID;
  const acuityApiKey = process.env.ACUITY_API_KEY;

  if (!acuityUserId || !acuityApiKey) {
    throw new Error('Acuity credentials are not set in the environment variables');
  }

  const authHash = Buffer.from(`${acuityUserId}:${acuityApiKey}`).toString('base64');
  return `Basic ${authHash}`;
};

export const fetchAcuityAppointment = async (appointmentId) => {
  try {
    const acuityBaseUrl = process.env.ACUITY_BASE_URL;
    if (!acuityBaseUrl) {
      throw new Error('Acuity Base URL is not set in the environment variables');
    }

    const response = await axios.get(`${acuityBaseUrl}/appointments/${appointmentId}`, {
      headers: {
        Authorization: getAcuityAuthHeader(),
      },
    });
    logger.info(`Fetched Acuity appointment: ${JSON.stringify(response.data)}`);
    return response.data;
  } catch (error) {
    logger.error(`Error fetching Acuity appointment for id=${appointmentId}`, { error: error.message });
    throw error;
  }
};
