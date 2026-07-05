import "dotenv/config";
import app from "./app.js";
import { testConnection } from "./config/db.connection.js";
import { createUserTable } from "./db/user.js";
import { createCompanyTable } from "./db/company.js";
import { createProfileTables } from "./db/profile.js";
import { createAttendanceTable } from "./db/attendance.js";
import { createLeaveTable } from "./db/leave.js";
import { createPayrollTable } from "./db/payroll.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();
    await createUserTable();
    await createCompanyTable();
    await createProfileTables();
    await createAttendanceTable();
    await createLeaveTable();
    await createPayrollTable();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};
startServer();