// REFERENCE EXAMPLE ONLY -- this file is not required by src/app.js and does
// not run against the real app.
//
// It exists purely to show the shape a generated service + its collaborator
// should follow when captured in a Cursor Skill, using a fictitious "stock"
// domain so it can't be mistaken for the real overbooking feature:
//   1. The service depends on an external collaborator passed in explicitly
//      (here, a stockClient module), the same shape as
//      services/reservationService.js -> clients/inventoryClient.js.
//   2. A rejection is a dedicated error type, not a null/boolean return.
//   3. Request/response data are small plain objects, not loose parameters.

class SampleOutOfStockError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SampleOutOfStockError';
    this.status = 409;
  }
}

function reserve(stockClient, request) {
  const stock = stockClient.getStock(request.sku);

  if (request.quantity > stock.availableUnits) {
    throw new SampleOutOfStockError(
      `Not enough stock for ${request.sku}: ${request.quantity} requested, ${stock.availableUnits} available`
    );
  }

  return { sku: request.sku, quantity: request.quantity };
}

module.exports = { reserve, SampleOutOfStockError };
