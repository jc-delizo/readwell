require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/db');
const { getJwtSecret } = require('./middleware/auth');

const port = Number(process.env.PORT) || 5020;
let server;

const start = async () => {
  getJwtSecret();
  await connectDB();
  server = app.listen(port, () => {
    console.log(`ReadWell is running on http://localhost:${port}`);
  });
};

const shutdown = async (signal) => {
  console.log(`${signal} received; shutting down.`);
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.disconnect();
};

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    shutdown(signal)
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  });
}

start().catch((error) => {
  console.error(`Unable to start ReadWell: ${error.message}`);
  process.exit(1);
});
