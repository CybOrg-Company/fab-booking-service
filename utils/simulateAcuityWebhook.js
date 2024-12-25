import axios from 'axios';

export async function simulateAcuityWebhook(action, id) {
  try {
    const response = await axios.post('http://localhost:3000/webhook', {
      "action": action,
      "id": id,
    });
    console.log(`Webhook response: ${response.status} - ${response.data}`);
  } catch (error) {
    console.error('Error simulating Acuity webhook:', error.response?.data || error.message);
  }
}

// Usage example
// For convenience, we have created an actual test booking on Acuity
// Upon simulating the booking webhook, the actual Acuity API will be called.
// The booking URL.
// apptId=1388359976
simulateAcuityWebhook('create', '1388359976'); // Simulates a booking creation webhook
// simulateAcuityWebhook('canceled', '1388359976'); // Simulates a booking cancellation webhook
