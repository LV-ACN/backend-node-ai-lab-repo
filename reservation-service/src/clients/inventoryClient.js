const { PropertyNotFoundError } = require('../errors');

const BASE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:4000';

// Mirrors InventoryClient.java: a thin REST client, no business logic.
// Both methods call inventory-service over HTTP -- the "two separate HTTP
// calls" gap the lab's concurrency guard has to cover.
async function getInventory(propertyId, roomType) {
  const response = await fetch(
    `${BASE_URL}/api/properties/${encodeURIComponent(propertyId)}/inventory/${encodeURIComponent(roomType)}`
  );
  if (response.status === 404) {
    throw new PropertyNotFoundError(`Unknown property/room type: ${propertyId}/${roomType}`);
  }
  if (!response.ok) {
    throw new Error(`inventory-service returned ${response.status}`);
  }
  return response.json();
}

async function incrementBooked(propertyId, roomType, rooms) {
  const response = await fetch(
    `${BASE_URL}/api/properties/${encodeURIComponent(propertyId)}/inventory/${encodeURIComponent(roomType)}/book`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rooms }),
    }
  );
  if (!response.ok) {
    throw new Error(`inventory-service returned ${response.status}`);
  }
  return response.json();
}

module.exports = { getInventory, incrementBooked };
