const app = require('./app');

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`reservation-service listening on http://localhost:${PORT}`);
});
