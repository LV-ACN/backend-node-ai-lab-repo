// REFERENCE EXAMPLE ONLY -- paired with sampleStockService.js purely so the
// integration-test reference has a real endpoint to exercise through
// supertest. Mirrors routes/reservationsRouter.js's shape: thin routing,
// errors passed to next() for the shared error handler.
const { Router } = require('express');
const { reserve } = require('./sampleStockService');
const stockClient = require('./sampleStockClient');

const router = Router();

router.post('/reserve', (req, res, next) => {
  try {
    res.json(reserve(stockClient, req.body));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
