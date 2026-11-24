---
name: backend-test-generator
description: Use when given a list of scenario ids for the overbooking
  feature and asked to generate unit, integration and/or functional tests
  for the Breezewood Hotels reservation-service. Do not use for any other
  kind of test, and never delete or weaken an existing test.
---

## Inputs
- A list of scenario ids (e.g. "within cap", "exactly at capacity", "one
  room over", "concurrent requests that together exceed the cap", "a
  property at 0%", "unknown property or room type", "a runtime policy
  change").
- Conventions in reservation-service/reference/ (unit + integration style)
  and functional-tests/reference/ (functional style).

## Outputs
- Unit tests under reservation-service/test/ (Jest), each with its
  scenario data in a companion JSON fixture, not hardcoded in the test
  body.
- Integration tests under the same tree, using Supertest against a small
  Express app built the same way src/app.js is, with
  clients/inventoryClient.js replaced via jest.mock.
- Functional tests under functional-tests/tests/ (Playwright TypeScript),
  each with a companion JSON fixture under functional-tests/tests/test-data/.

## Rules
1. Expected values always come from spec.md (the capacity formula, the
   rejection message shape), never reverse-engineered from whatever the
   implementation currently does.
2. One behaviour asserted per test; a test name carries its scenario id.
3. Concurrency scenarios ("concurrent requests that together exceed the
   cap") use a deterministic start gate (e.g. all requests built up front
   and fired together with Promise.all, or an explicit release signal) so
   every request is released together — never a setTimeout-based
   approximation of concurrency.
4. Functional tests reset inventory-service state
   (POST /api/admin/reset) before each test, never relying on leftover
   state from a previous test or run.
5. Never delete or weaken an existing test to make a new one pass. If a
   starter test's expected values are genuinely outdated by the feature
   (see spec.md), update only the asserted values, not the test's intent.
6. Never add a new test dependency (a new package in package.json) without
   asking first.
7. If a scenario id is ambiguous (for example, which room type or
   property it should use), ask — don't guess at test data.
