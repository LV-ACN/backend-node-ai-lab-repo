// REFERENCE EXAMPLE ONLY -- demonstrates integration-test conventions:
// supertest against a small standalone Express app wired the same way
// src/app.js is, with the external collaborator replaced via jest.mock at
// the module level instead of a real HTTP dependency, and a rejection
// asserted as the mapped HTTP status (via the shared error handler) -- the
// same pattern src/errors/index.js uses for BookingRejectedError.
jest.mock('./sampleStockClient');

const express = require('express');
const request = require('supertest');
const stockClient = require('./sampleStockClient');
const sampleStockRouter = require('./sampleStockRouter');
const { errorHandler } = require('../src/errors');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/reference/sample-stock', sampleStockRouter);
  app.use(errorHandler);
  return app;
}

describe('sample-stock reference API', () => {
  test('reserve within stock returns confirmation', async () => {
    stockClient.getStock.mockReturnValue({ sku: 'SAMPLE-SKU-1', availableUnits: 5 });

    const response = await request(buildApp())
      .post('/api/reference/sample-stock/reserve')
      .send({ sku: 'SAMPLE-SKU-1', quantity: 3 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ sku: 'SAMPLE-SKU-1', quantity: 3 });
  });

  test('reserve over stock returns conflict', async () => {
    stockClient.getStock.mockReturnValue({ sku: 'SAMPLE-SKU-1', availableUnits: 5 });

    const response = await request(buildApp())
      .post('/api/reference/sample-stock/reserve')
      .send({ sku: 'SAMPLE-SKU-1', quantity: 6 });

    expect(response.status).toBe(409);
    expect(response.body.error).toBeDefined();
  });
});
