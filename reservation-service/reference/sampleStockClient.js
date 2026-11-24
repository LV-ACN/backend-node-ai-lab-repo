// REFERENCE EXAMPLE ONLY -- a fictitious external collaborator, mirroring
// clients/inventoryClient.js's role. The unit test mocks this module
// entirely; the integration test mocks it at the module level too (jest.mock),
// matching how the real app's tests replace clients/inventoryClient.js.
function getStock(sku) {
  throw new Error('sampleStockClient.getStock is a reference stub -- tests must mock this module');
}

module.exports = { getStock };
