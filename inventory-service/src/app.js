const express = require('express');
const { findRecord, findByProperty } = require('./data');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

app.get('/api/properties/:propertyId/inventory', (req, res) => {
  const rows = findByProperty(req.params.propertyId);
  if (rows.length === 0) {
    return res.status(404).json({ error: `Unknown property: ${req.params.propertyId}` });
  }
  res.json(rows);
});

app.get('/api/properties/:propertyId/inventory/:roomType', (req, res) => {
  const row = findRecord(req.params.propertyId, req.params.roomType);
  if (!row) {
    return res.status(404).json({
      error: `Unknown property/room type: ${req.params.propertyId}/${req.params.roomType}`,
    });
  }
  res.json(row);
});

// Records a booking against published inventory. This endpoint does not
// enforce any capacity cap itself -- it only tracks counts. The capacity
// rule (including the overbooking policy built in the lab) belongs entirely
// in reservation-service, which is why this service stays untouched.
app.post('/api/properties/:propertyId/inventory/:roomType/book', (req, res) => {
  const row = findRecord(req.params.propertyId, req.params.roomType);
  if (!row) {
    return res.status(404).json({
      error: `Unknown property/room type: ${req.params.propertyId}/${req.params.roomType}`,
    });
  }

  const rooms = Number(req.body.rooms);
  if (!Number.isInteger(rooms) || rooms <= 0) {
    return res.status(400).json({ error: 'rooms must be a positive integer' });
  }

  row.bookedRooms += rooms;
  res.json(row);
});

module.exports = app;
