const inventoryClient = require('../clients/inventoryClient');
const { BookingRejectedError, ReservationNotFoundError } = require('../errors');

// Mirrors ReservationService.java: in-memory reservations, a simple
// sequence for reservation numbers, and the single place the capacity rule
// lives.
const reservations = new Map();
let sequence = 100000;

async function book(request) {
  const inventory = await inventoryClient.getInventory(request.propertyId, request.roomType);

  // NOTE: no overbooking allowance yet -- a request is only accepted if it
  // fits within the published room count exactly (capacity == publishedRooms).
  // This strict cap is the rule the lab's overbooking feature (section 4)
  // relaxes to 120% of publishedRooms, with the NFRs from section 3 layered in.
  const capacity = inventory.publishedRooms;
  const available = capacity - inventory.bookedRooms;
  if (request.rooms > available) {
    throw new BookingRejectedError(
      `Not enough available ${request.roomType} rooms at ${request.propertyId}: ${request.rooms} requested, ${available} available`
    );
  }

  await inventoryClient.incrementBooked(request.propertyId, request.roomType, request.rooms);

  const reservationNumber = `BWR-${sequence++}`;
  const response = {
    reservationNumber,
    propertyId: request.propertyId,
    roomType: request.roomType,
    rooms: request.rooms,
    guestName: request.guestName,
    checkIn: request.checkIn,
    checkOut: request.checkOut,
  };

  reservations.set(reservationNumber, response);
  return response;
}

function find(reservationNumber) {
  const response = reservations.get(reservationNumber);
  if (!response) {
    throw new ReservationNotFoundError(`No reservation found with number ${reservationNumber}`);
  }
  return response;
}

// Test-only escape hatch so Jest can reset in-memory state between cases,
// the same way restarting reservation-service does in the lab.
function _reset() {
  reservations.clear();
  sequence = 100000;
}

module.exports = { book, find, _reset };
