// REFERENCE EXAMPLE ONLY -- demonstrates unit-test conventions: mock the
// external collaborator, load scenarios from a companion JSON fixture
// instead of hardcoding them, and assert one outcome per scenario.
const { reserve, SampleOutOfStockError } = require('./sampleStockService');
const scenarios = require('./sample-stock-scenarios.json');

describe.each(scenarios)('reserve: $name', (scenario) => {
  test('matches expected outcome', () => {
    const stockClient = {
      getStock: jest.fn().mockReturnValue({
        sku: scenario.sku,
        availableUnits: scenario.availableUnits,
      }),
    };
    const request = { sku: scenario.sku, quantity: scenario.requestedQuantity };

    if (scenario.expectRejected) {
      expect(() => reserve(stockClient, request)).toThrow(SampleOutOfStockError);
    } else {
      const confirmation = reserve(stockClient, request);
      expect(confirmation.sku).toBe(scenario.sku);
      expect(confirmation.quantity).toBe(scenario.requestedQuantity);
    }
  });
});
