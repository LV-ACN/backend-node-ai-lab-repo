// Seeded published inventory and booked-room counts for Breezewood Hotels.
// Two properties, two room types each, so there's enough variety for a
// multi-step "largest available block" agent workflow later in the lab.
const inventory = [
  { propertyId: 'BLR-001', propertyName: 'Breezewood Residency Bengaluru', roomType: 'DELUXE', publishedRooms: 10, bookedRooms: 0 },
  { propertyId: 'BLR-001', propertyName: 'Breezewood Residency Bengaluru', roomType: 'SUITE', publishedRooms: 4, bookedRooms: 0 },
  { propertyId: 'HYD-001', propertyName: 'Breezewood Suites Hyderabad', roomType: 'DELUXE', publishedRooms: 8, bookedRooms: 0 },
  { propertyId: 'HYD-001', propertyName: 'Breezewood Suites Hyderabad', roomType: 'SUITE', publishedRooms: 2, bookedRooms: 0 },
];

function findRecord(propertyId, roomType) {
  if (!roomType) return undefined;
  return inventory.find(
    (row) => row.propertyId === propertyId && row.roomType === roomType.toUpperCase()
  );
}

function findByProperty(propertyId) {
  return inventory.filter((row) => row.propertyId === propertyId);
}

function resetAll() {
  inventory.forEach((row) => {
    row.bookedRooms = 0;
  });
}

module.exports = { inventory, findRecord, findByProperty, resetAll };
