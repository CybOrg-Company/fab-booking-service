import axios from 'axios';
import crypto from 'crypto'; // Use `import` instead of `require`

export async function simulateAcuityWebhook(action, id) {
  const payload = JSON.stringify({ action, id }); // Explicitly stringify the payload
  const secret = process.env.ACUITY_API_KEY || 'your_shared_secret'; // Replace with your actual secret for testing

  // Generate the Acuity signature
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64');

  try {
    const response = await axios.post('http://localhost:3000/webhook', payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-acuity-signature': signature,
      },
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
