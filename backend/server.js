import dotenv from "dotenv";
import app from "./app.js";
import { testConnection } from "./config/db.connection.js";
import { createUserTable } from "./db/user.js";
import { createCompanyTable } from "./db/company.js";
import { createProfileTables } from "./db/profile.js";
import { createAttendanceTable } from "./db/attendance.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await testConnection();
  await createUserTable();
  await createCompanyTable();
  await createProfileTables();
  await createAttendanceTable();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};
startServer();