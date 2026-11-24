// REFERENCE IMPLEMENTATION ONLY -- Section 7.
//
// Drop this file into src/agent/ and mount it from app.js. Verified against
// @modelcontextprotocol/sdk 1.32.2 with a real MCP client (listTools +
// callTool round trip) -- confirm the API still matches if your installed
// version is newer, since this SDK's surface moves faster than the plain
// Express code elsewhere in this repo.
//
//   npm install @modelcontextprotocol/sdk zod
//
// app.js wiring (stateless mode -- simplest for a lab, no session store).
// app.js already calls app.use(express.json()) globally, so req.body is
// already parsed here -- don't add a second express.json() on this route,
// it will try to re-read an already-consumed request stream:
//
//   const { createMcpTransport } = require('./agent/mcpTools');
//   app.post('/mcp', (req, res) => {
//     createMcpTransport().handleRequest(req, res, req.body);
//   });
//
// Every tool handler below calls services/reservationService.js or
// clients/inventoryClient.js directly -- no capacity math here, no second
// HTTP client pointed at this same app.
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { z } = require('zod');
const inventoryClient = require('../clients/inventoryClient');
const reservationService = require('../services/reservationService');

function buildServer() {
  const server = new McpServer({ name: 'reservation-agent', version: '1.0.0' });

  server.registerTool(
    'get_property_capacity',
    {
      description: 'Read the published rooms, booked rooms and available rooms for a property and room type. Read-only.',
      inputSchema: { propertyId: z.string(), roomType: z.string() },
    },
    async ({ propertyId, roomType }) => {
      const inventory = await inventoryClient.getInventory(propertyId, roomType);
      const result = {
        publishedRooms: inventory.publishedRooms,
        bookedRooms: inventory.bookedRooms,
        available: inventory.publishedRooms - inventory.bookedRooms,
      };
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }
  );

  server.registerTool(
    'check_overbooking_availability',
    {
      description:
        'Check whether a given number of rooms can currently be booked for a property and room type, without booking them. Read-only.',
      inputSchema: { propertyId: z.string(), roomType: z.string(), rooms: z.number().int().positive() },
    },
    async ({ propertyId, roomType, rooms }) => {
      const inventory = await inventoryClient.getInventory(propertyId, roomType);
      const available = inventory.publishedRooms - inventory.bookedRooms;
      const result = { canBook: rooms <= available, available };
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    }
  );

  server.registerTool(
    'create_reservation',
    {
      description:
        'Create a reservation for a property, room type, number of rooms and guest. Books exactly the requested number of rooms, or returns the service\'s rejection reason unchanged. State-changing -- the caller must confirm with the user before invoking this.',
      inputSchema: {
        propertyId: z.string(),
        roomType: z.string(),
        rooms: z.number().int().positive(),
        guestName: z.string(),
        guestEmail: z.string(),
        checkIn: z.string(),
        checkOut: z.string(),
      },
    },
    async (input) => {
      // BookingRejectedError propagates as-is -- the tool layer never
      // soft-catches or rewords the service's rejection reason. The SDK
      // itself catches the throw and returns it as a tool result with
      // isError: true and the message as the content text (verified:
      // 1.32.2), so the agent sees the real rejection, not a transport error.
      const response = await reservationService.book(input);
      return { content: [{ type: 'text', text: JSON.stringify(response) }] };
    }
  );

  return server;
}

// Stateless Streamable HTTP: a fresh transport (and server) per request is
// the simplest correct option for a training lab with one client. A
// production deployment would instead manage sessions via the
// Mcp-Session-Id header -- see the SDK docs.
function createMcpTransport() {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  buildServer().connect(transport);
  return transport;
}

module.exports = { createMcpTransport };
