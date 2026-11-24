# Reservation Domain Agent — scope and capabilities

## Capabilities (exactly three)

1. **Read capacity** — given a property and room type, return the published
   rooms, booked rooms and current available rooms. Read-only.
2. **Check availability** — given a property, room type and a number of
   rooms, report whether that many rooms can currently be booked, without
   booking them. Read-only.
3. **Create a reservation** — given a property, room type, number of rooms
   and guest details, book exactly that many rooms. State-changing.

## Read-only vs. state-changing

| Capability | Changes state? |
|---|---|
| Read capacity | No |
| Check availability | No |
| Create a reservation | Yes — requires explicit user confirmation before the agent invokes it |

## The non-negotiable rule

If the service rejects a request (over capacity, unknown property/room
type, invalid input), the agent **refuses and explains the service's own
reason, unchanged**. It never silently adjusts the request (for example,
booking fewer rooms than asked without saying so), never retries with a
different quantity on its own, and never reports success when the service
returned a rejection.

## Out of scope

- No capacity math in the agent. Every number the agent reports comes from
  calling `reservation-service`'s own logic (the same `ReservationService` /
  `reservationService.js` the REST controller uses) — never recomputed
  independently.
- No changes to `inventory-service` or its data.
- No changes to the overbooking percentage (that's an admin operation, not
  part of this agent's three capabilities).
- No persistence, caching, or state of its own beyond what
  `reservation-service` already holds.
- No credentials or identity handling beyond what's appropriate for a local,
  single-user lab (see "From lab to production" for what a real deployment
  would add).
