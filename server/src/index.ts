// UNI-NEST API server entry point.
// Loads environment variables, sets up Express, and starts listening.
import dotenv from "dotenv";

import { createApp } from "./app";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`UNI-NEST API running on http://localhost:${PORT}`);
});
