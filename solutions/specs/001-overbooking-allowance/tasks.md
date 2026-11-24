# Tasks: Controlled Overbooking Allowance (Node track)

Each task is independently reviewable and should be its own small, scoped diff.

1. **Default allowance config.** Add a `DEFAULT_OVERBOOKING_PERCENTAGE = 20`
   constant (or an env var with that default) alongside the existing
   `INVENTORY_SERVICE_URL` convention.
2. **`services/overbookingPolicy.js`**: a per-property runtime override map
   (plain `Map`), falling back to the configured default; validates a
   percentage before accepting it (reject negative, reject implausibly large
   values with a clear message).
3. **Admin routes** (`routes/adminRouter.js`): `GET|PUT
   /api/admin/properties/:propertyId/overbooking-percentage`, delegating to
   `overbookingPolicy`.
4. **Capacity route** (new route on `reservationsRouter.js` or a small new
   `capacityRouter.js`): `GET
   /api/properties/:propertyId/rooms/:roomType/capacity`, computing
   `publishedRooms`, `bookedRooms`, `percentage`, `capacity`, `available` from
   `inventoryClient` + `overbookingPolicy` — read-only, no booking side
   effects.
5. **`services/bookingAuditLogger.js`**: `accepted(...)` and `rejected(...)`
   functions, each logging the fields the plan's Observability row requires.
6. **`services/reservationService.js` `book()`**: apply `capacity =
   Math.floor(publishedRooms * (1 + percentage / 100))` inside an async
   mutex keyed by `` `${propertyId}|${roomType}` ``, replacing the strict
   `capacity === publishedRooms` check. Reject over-capacity requests with
   `BookingRejectedError` (409); accepted requests still call
   `inventoryClient.incrementBooked` exactly as before.
7. **Wire the audit logger into both branches** of `book()` — accepted and
   rejected — so every decision is recorded, not just failures.
8. **Update the starter test.** `test/app.test.js` (and any new tests) need to
   assert the new allowance-aware behavior, not the old strict-capacity
   behavior (see spec FR-2/FR-3 for the exact numbers).

## Review gates (answer from the diff before committing)

| Gate | Question |
|---|---|
| Scope | Is `inventory-service/` untouched? (`git status` should show nothing there.) |
| Rule fidelity | Does the capacity calculation round exactly as `spec.md` FR-2 says — floor, never up? |
| Concurrency | Does the guard cover the **whole** read-then-increment sequence, or just one `await`? |
| Rejection path | On rejection, is the increment skipped and the audit entry still written? |
| Contract | Do paths, fields and status codes match `plan.md`'s API Contract exactly? |
| Security hygiene | Are admin inputs validated (no negative or absurd percentages)? No secrets or personal data in logs? |
| Dependencies | Were any new packages added to `package.json`? Are they necessary and well maintained? |
