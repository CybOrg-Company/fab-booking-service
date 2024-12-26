import request from 'supertest';
import app from '../app.js';

describe('Health Check Endpoint', () => {
  it('should return 200 and healthy message', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('healthy');
  });
});
