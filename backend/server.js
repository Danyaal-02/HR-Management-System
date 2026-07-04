import dotenv from "dotenv";
import app from "./app.js";
import { testConnection } from "./config/db.connection.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};
startServer();