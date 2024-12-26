import axios from 'axios';

const testRateLimiter = async () => {
  const url = 'http://localhost:3000/';

  for (let i = 0; i < 100; i++) {
    try {
      const response = await axios.get(url);
      console.log(`Request ${i + 1}: ${response.status}`);
    } catch (error) {
      console.error(`Request ${i + 1} failed: ${error.response?.data}`);
    }
  }
};

testRateLimiter();
