// REFERENCE EXAMPLE ONLY -- this targets a fictitious endpoint and does not
// run against the real reservation-service (it mirrors the shape of
// reservation-service/reference/SampleStockController.java, which also
// isn't part of the real build).
//
// It exists purely to show the conventions a generated functional spec
// should follow in this project, so they can be captured in a Cursor Skill:
//   1. Test data lives in a companion JSON file, never hardcoded inline.
//   2. The test exercises the real HTTP API end-to-end (via Playwright's
//      API request context), not a mocked collaborator -- that's what makes
//      it a functional test rather than a unit or integration test.
//   3. Each assertion maps to one field of the source scenario's expected
//      outcome, so a reviewer can trace spec <-> scenario <-> assertion.
import { test, expect } from '@playwright/test';
import sampleData from './sample-functional.data.json';

test('REFERENCE - sample scenario: reserve fictitious stock over HTTP', async ({ request }) => {
  const response = await request.post('/api/reference/sample-stock/reserve', {
    data: sampleData.request,
  });

  expect(response.status()).toBe(sampleData.expected.status);

  const body = await response.json();
  expect(body.sku).toBe(sampleData.expected.sku);
  expect(body.quantity).toBe(sampleData.expected.quantity);
});
