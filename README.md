# backend-node-ai-lab-repo

Starter repository for the **AI-Driven Backend Development: Hands-On Lab**
(Node track) — see `AI-Driven_Backend_Development-Hands-On_Lab.html` in the
parent folder (select the "Node" tab at the top).

## Services

| Service | Stack | Port | Role |
|---|---|---|---|
| `inventory-service/` | Node.js + Express | `4000` | Tracks each property's published room inventory and current booked-room counts. Stable — you don't modify it during the lab. |
| `reservation-service/` | Node.js + Express | `8080` | Handles the booking flow. Currently enforces a strict, no-overbooking capacity check — this is what you extend in sections 2–6 of the lab, and turn into the Reservation Domain Agent in section 7 / Extended activity E4. |
| `functional-tests/` | TypeScript + Playwright Test | — (calls `8080`) | API-level functional tests exercising both services together over HTTP. Empty under `tests/` to start — generated in section 5. |

## Run both services

Open two terminals from the repository root.

**Terminal 1 — inventory-service**

```bash
cd inventory-service
npm ci
npm start
```

**Terminal 2 — reservation-service**

```bash
cd reservation-service
npm ci
npm start
```

## Health checks

```bash
curl http://localhost:4000/health
curl http://localhost:8080/health
```

## Try a booking

```bash
curl -X POST http://localhost:8080/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"propertyId":"BLR-001","roomType":"DELUXE","rooms":2,"guestName":"Asha Rao","guestEmail":"asha.rao@example.com","checkIn":"2026-12-10","checkOut":"2026-12-12"}'
```

Seeded properties (see `inventory-service/src/data.js` for exact counts):

| Property | Name | Room types |
|---|---|---|
| `BLR-001` | Breezewood Residency Bengaluru | `DELUXE` (10 published), `SUITE` (4 published) |
| `HYD-001` | Breezewood Suites Hyderabad | `DELUXE` (8 published), `SUITE` (2 published) |

A booking request over the published count is currently rejected with `409
Conflict` — there's no overbooking allowance yet. That's the feature you
build in the lab.

## Run the tests

```bash
cd reservation-service
npm ci
npm test
```

`test/` has one starter test to start; section 5 has you generate more
there, each with a companion JSON fixture. `reference/` holds fictitious
"stock"-domain style templates — not part of the real app, and excluded from
`npm test` via `jest.config.js`.

## Run the functional tests

With both services running (above), in a third terminal:

```bash
cd functional-tests
npm ci
npx playwright test
```

These are API-level tests (Playwright's `request` fixture, no browser), so
there's no browser binary to install. `tests/` is empty to start — section 5
has you generate specs there, each with a companion JSON fixture under
`tests/test-data/`.

## Repository layout

```
backend-node-ai-lab-repo/
├── inventory-service/        # Node/Express -- published inventory + booked-room counts (stable)
├── reservation-service/      # Node/Express -- booking flow you extend in sections 2-6
│   ├── src/
│   │   ├── routes/            # Thin routing (Controller equivalent)
│   │   ├── services/          # Business logic
│   │   ├── clients/           # inventory-service REST client
│   │   ├── errors/            # Error types + shared error handler
│   │   └── agent/             # Empty to start -- MCP tools (section 7) + A2A interface (Extended E4)
│   ├── reference/             # Sample unit + integration test conventions (section 5 skill input)
│   └── test/                  # One starter test; generated tests land here in section 5
├── functional-tests/          # Playwright API tests exercising both services together
│   ├── reference/             # Sample functional-test conventions (section 5 skill input)
│   └── tests/                 # Empty to start -- generated specs + test-data/ land here
├── docs/
│   └── business-requirement.md   # The informal ask from Revenue Management (section 2 input)
├── solutions/                 # Reference spec/plan/tasks/SKILL/agent files -- self-check only, see solutions/README.md
└── .cursor/
    └── mcp.json               # Empty to start -- register your agent here in section 7
```
