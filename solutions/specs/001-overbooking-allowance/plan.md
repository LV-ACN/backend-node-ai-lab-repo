# Technical Plan: Controlled Overbooking Allowance (Node track)

## Technical Context

`reservation-service` is the existing Node 20 / Express app to extend
(`routes/reservationsRouter.js` → `services/reservationService.js` →
`clients/inventoryClient.js`). `inventory-service` is a stable Express service
and **must not be modified**; its `POST
/api/properties/{propertyId}/inventory/{roomType}/book` endpoint increments
the booked count without checking any limit — that enforcement is this
feature's job, and it lives in `reservation-service` only.

A booking decision requires two separate HTTP calls to `inventory-service` — a
read (`GET .../inventory/{roomType}`) then, if accepted, an increment (`POST
.../book`) — with no transaction spanning the two. That gap is the source of
this plan's concurrency requirement.

## API Contract

- Keep `POST /api/reservations` (201 on success, unchanged request/response
  shape) and `GET /api/reservations/:reservationNumber`.
- On over-capacity, return **409** with `{"error": "<message>"}` (see spec
  FR-3); on unknown property/room type, **404**; both via the existing shared
  error-handler pattern (a new error class with a `.status`, same as
  `BookingRejectedError`).
- Add `GET /api/properties/:propertyId/rooms/:roomType/capacity` →
  `{"publishedRooms", "bookedRooms", "percentage", "capacity", "available"}`.
- Add `GET|PUT /api/admin/properties/:propertyId/overbooking-percentage` →
  `GET` returns `{"percentage": number}`; `PUT` takes `{"percentage": number}`
  and applies it immediately to the next request for that property. Reject a
  negative or absurd (for example, >100 without an explicit business sign-off)
  percentage with 400.

## NFRs, made measurable

| NFR | Testable constraint |
|---|---|
| Performance | The capacity check adds one in-memory policy lookup and no extra network calls beyond the existing inventory read. |
| Concurrency & consistency | N concurrent requests for the same `(propertyId, roomType)` never leave `bookedRooms` above `capacity`, even though the counter lives in another process reached over HTTP. |
| Observability | Every accepted or rejected decision is logged with `publishedRooms`, `bookedRooms`, `percentage`, `capacity` and `requestedRooms`. |
| Configurability | The admin `PUT` takes effect on the very next request for that property — no restart, no redeploy. |

## The interleaving that oversells (why a guard is needed at all)

```
Capacity 12, booked 11. Two requests for 1 room each, both awaiting the
same `await inventoryClient.getInventory(...)` call:
  Request A: await getInventory -> 11  (11 < 12, OK)
  Request B: await getInventory -> 11  (11 < 12, OK)   <-- interleaves here,
                                                             between A's await
                                                             and A's increment
  Request A: await incrementBooked -> 12
  Request B: await incrementBooked -> 13   <-- oversold
```

Node is single-threaded, but `await` is exactly where control yields back to
the event loop — two concurrent requests for the same key can still both pass
the check before either increments, because the check and the increment are
two separate awaited network calls, not one atomic step.

## Concurrency guard and its assumption

An in-process **async mutex keyed by `propertyId + '|' + roomType`** (for
example, a small `Map` of pending promise chains — one per key, each request
`await`s the previous one before running its own read-check-increment
sequence) wraps the **whole** sequence, so two requests for the same key can
never both pass the check before either increments.

**Deployment assumption this relies on:** exactly one `reservation-service`
process, and nothing else increments `inventory-service`'s counter for that
key. This is a single point of failure for the guard, by design, for the core
lab — Extended activity E1 tests this assumption directly by running a second
instance and shows it break. (Node's single-threadedness does **not** protect
you here once there are two separate processes — the guard is per-process, not
per-machine.)

## Data model

- An `overbookingPolicy` module: an in-memory `Map` of `propertyId` →
  percentage override, defaulting to 20 when a property has no override.
  Validates input (0–100, or a documented wider range if the business
  explicitly allows it) before accepting a `PUT`.
- A `bookingAuditLogger` module: one structured log line per decision
  (accepted or rejected), carrying the fields in the Observability row above.

## Core logic (shape to implement against)

```js
await withLock(`${propertyId}|${roomType}`, async () => {
  const inventory   = await inventoryClient.getInventory(propertyId, roomType);
  const percentage  = policy.getPercentage(propertyId);
  const capacity    = Math.floor(inventory.publishedRooms * (1 + percentage / 100));
  const available   = capacity - inventory.bookedRooms;
  if (rooms > available) {
    auditLogger.rejected({ propertyId, roomType, inventory, percentage, capacity, rooms });
    throw new BookingRejectedError(...);              // -> 409, no increment
  }
  await inventoryClient.incrementBooked(propertyId, roomType, rooms);
  auditLogger.accepted({ propertyId, roomType, inventory, percentage, capacity, rooms, reservationNumber });
  return response;                                     // -> 201
});
```

## Assumptions and limits

- The lock is an in-process key→promise-chain map — it protects nothing across
  multiple instances or restarts (see the deployment assumption above).
- Runtime percentage overrides are in-memory only; they reset to the default
  (20%) on restart. That's acceptable for this lab and called out explicitly
  rather than silently assumed.
- No idempotency handling yet — a retried request is treated as a brand-new
  booking. Extended activity E2 adds this.
