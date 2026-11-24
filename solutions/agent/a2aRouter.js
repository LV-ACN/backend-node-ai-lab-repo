// REFERENCE IMPLEMENTATION ONLY -- Extended activity E4.
//
// Drop this file into src/agent/ and mount it from app.js:
//
//   const agentA2ARouter = require('./agent/a2aRouter');
//   app.use(agentA2ARouter);
//
// A task that fails for a business reason (capacity exceeded, missing
// confirmation) is still a successfully *handled* task: it comes back as
// HTTP 200 with {"status":"failed", "error": "..."}, not a raw 409. That's
// the A2A task-result convention, distinct from the REST router's HTTP
// status mapping in src/errors/index.js -- the same business rule, reported
// two different ways depending on which interface asked.
const { Router } = require('express');
const inventoryClient = require('../clients/inventoryClient');
const reservationService = require('../services/reservationService');
const { BookingRejectedError } = require('../errors');

const router = Router();

router.get('/.well-known/agent-card.json', (req, res) => {
  res.json({
    name: 'reservation-agent',
    description:
      'Reservation Domain Agent for Breezewood Hotels -- read capacity, check availability, create a reservation, all within the published overbooking policy.',
    skills: ['get_capacity', 'check_availability', 'create_reservation'],
  });
});

router.post('/a2a/tasks', async (req, res) => {
  const { skill, input } = req.body;
  try {
    let output;
    switch (skill) {
      case 'get_capacity':
        output = await getCapacity(input);
        break;
      case 'check_availability':
        output = await checkAvailability(input);
        break;
      case 'create_reservation':
        output = await createReservation(input);
        break;
      default:
        return res.status(400).json({ status: 'failed', output: null, error: `Unknown skill: ${skill}` });
    }
    res.json({ status: 'completed', output, error: null });
  } catch (err) {
    if (err instanceof BookingRejectedError) {
      return res.json({ status: 'failed', output: null, error: err.message });
    }
    res.status(400).json({ status: 'failed', output: null, error: err.message });
  }
});

// Read-only -- no capacity math here, just translating the task input into
// the same inventoryClient call the REST path and the MCP tools use.
async function getCapacity(input) {
  const inventory = await inventoryClient.getInventory(input.propertyId, input.roomType);
  return {
    publishedRooms: inventory.publishedRooms,
    bookedRooms: inventory.bookedRooms,
    available: inventory.publishedRooms - inventory.bookedRooms,
  };
}

async function checkAvailability(input) {
  const inventory = await inventoryClient.getInventory(input.propertyId, input.roomType);
  const available = inventory.publishedRooms - inventory.bookedRooms;
  return { canBook: input.rooms <= available, available };
}

// State-changing -- requires the caller to have already confirmed with a
// human, the same rule Section 7's hardening applies to the MCP tool.
async function createReservation(input) {
  if (input.confirmed !== true) {
    throw new Error('create_reservation requires "confirmed": true in the task input');
  }
  return reservationService.book(input);
}

module.exports = router;
