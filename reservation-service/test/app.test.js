const request = require('supertest');
const app = require('../src/app');

// Confirms the app wires up (router -> service -> client) and the health
// route responds, before you start layering the overbooking feature on top
// in section 4.
describe('reservation-service', () => {
  test('health check responds UP', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'UP' });
  });
});
