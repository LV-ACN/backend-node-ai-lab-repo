const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`inventory-service listening on http://localhost:${PORT}`);
});
