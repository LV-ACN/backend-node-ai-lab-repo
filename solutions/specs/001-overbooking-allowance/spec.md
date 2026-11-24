# Feature Specification: Controlled Overbooking Allowance

**Status:** Ready for planning (all clarifications resolved)

## Overview

Revenue Management wants properties to accept reservations above their published
room inventory, up to a configurable overbooking allowance, to offset expected
no-shows. The allowance defaults to 20% above published rooms but may be set
differently per property. The booking flow must never confirm a reservation that
would push accepted bookings past the allowance for that property and room type.

## Why

No-shows mean rooms published as available often go unused. Allowing a bounded
overbooking allowance recovers that lost revenue, the way competitors in the
same market already do. The business risk this spec must close off is the
opposite failure: confirming a guest, then having to call them back later
because no room is actually available. That must never happen as a result of
this feature.

## User Scenarios

- A property with a 20% allowance and 10 published DELUXE rooms has a capacity
  of 12 (floor(10 × 1.2) = 12). With 11 already booked, a request for 1 more
  room is accepted; a request for 2 more rooms is rejected (11 + 2 = 13 > 12).
- A property is set to a 0% allowance. Guests can still book up to the
  published room count; no additional allowance is granted.
- Revenue Management changes a property's allowance mid-day. The new
  percentage applies to the next booking request, with no restart required.

## Functional Requirements

- **FR-1 (Scope):** The allowance is evaluated **per property and room type**,
  not pooled across a property's room types and not shared across properties.
- **FR-2 (Capacity formula):** `capacity = floor(publishedRooms * (1 +
  allowancePercentage / 100))`. The result is always rounded **down**
  (floored), never up. A property/room type never gains a seat from the
  allowance unless `publishedRooms * allowancePercentage / 100 >= 1`.
- **FR-3 (Hard ceiling):** A booking request is accepted only if `requested
  rooms <= capacity - alreadyBooked`. A request that would exceed capacity is
  rejected outright — never partially fulfilled, never confirmed-then-reversed.
- **FR-4 (0% allowance):** A 0% allowance means no overbooking above published
  rooms — it does **not** mean no bookings are accepted. Bookings up to the
  published room count are still allowed.
- **FR-5 (Per-property configurability):** The allowance percentage can be read
  and changed per property at runtime, without redeploying the service.
- **FR-6 (Observability):** Every booking decision — accepted or rejected — is
  recorded with enough detail (published rooms, booked rooms, percentage,
  capacity, requested rooms) that an operator can explain the decision from
  that record alone.

## Edge Cases

- A room type whose published count is small enough that the allowance
  percentage rounds down to zero extra rooms (see FR-2) — the guest-facing
  behavior must still be correct, just unchanged from the 0% case.
- An allowance is lowered below the number of rooms already booked (for
  example, a property drops from 20% to 0% after already selling into the
  allowance). The capacity endpoint must still return a sensible, non-negative
  number of rooms available, not an error or a negative count.
- A request for an unknown property or room type.
- A request for zero or a negative number of rooms.

## Non-Goals (explicitly out of scope)

- Blackout dates or date-specific allowances. The allowance is constant across
  all stay dates for a given property and room type.
- Any change to `inventory-service`'s published-room counts or its booking
  endpoint's own behavior — it continues to track counts only, with no limit
  enforcement of its own.
- Pooling an allowance across multiple room types or multiple properties.

## Clarifications (resolved)

1. **Scope:** per property **and** room type (not pooled). See FR-1.
2. **Rounding:** floor, never round up. See FR-2.
3. **0% meaning:** "no overbooking," not "no bookings." See FR-4.
4. **Blackout / date-specific allowances:** out of scope. See Non-Goals.
