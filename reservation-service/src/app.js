const express = require('express');
const reservationsRouter = require('./routes/reservationsRouter');
const { errorHandler } = require('./errors');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

app.use('/api/reservations', reservationsRouter);

// Agent interfaces (MCP in section 7, A2A in extended activity E4) get
// mounted here too, alongside the REST routes above -- same app, same
// service module, no second process.

app.use(errorHandler);

module.exports = app;
