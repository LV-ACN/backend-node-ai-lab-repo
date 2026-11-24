// Only run tests under test/ -- reference/ holds fictitious style-template
// tests that are excluded on purpose, the same way reservation-service's
// Java reference/ folder sits outside src/test and isn't picked up by Maven.
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.test.js'],
};
