# 🚀 FleetCard Registration API Automation

A Bun + TypeScript service that automates onboarding by fetching employee data from MySQL, calling an external API to generate magic links for registration, and updating log statuses in the database. Designed to run as a scheduled task with retry logic.

![Bun](https://img.shields.io/badge/Runtime-Bun-yellow?logo=bun)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?logo=typescript)
![MySQL](https://img.shields.io/badge/Database-MySQL-blue?logo=mysql)
![API](https://img.shields.io/badge/API-Integration-orange)

---

## ✨ Key Features

- Execute stored procedures to prepare onboarding data.
- Fetch employee records pending registration.
- Call external API to generate registration magic links.
- Retry mechanism with delays for failed API calls.
- Update MySQL records with notification statuses.

---

## 🗂 Technologies Used

- [Bun](https://bun.sh/) (Runtime + Package Manager)
- [TypeScript](https://www.typescriptlang.org/)
- [mysql2/promise](https://www.npmjs.com/package/mysql2)
- [axios](https://www.npmjs.com/package/axios)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [node-cron](https://www.npmjs.com/package/node-cron)

---

## ⚙️ Environment Variables

Create a `.env` file in your project root with:
```env
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
DB_SP=your-stored-procedure-name
DB_TABLE=your-table-name
API_URL=https://your-api-endpoint
AUTHORIZATION=base64-encoded-credentials
```

---

## 🚀 Running the Script

Install dependencies with Bun:
```bash
bun install
```
Run the script:
```bash
bun run index.ts
```

## 📌 Notes
- This script is designed to exit automatically once tasks complete.
- Always test in a staging environment before using in production.
- Make sure your database user can execute the stored procedure and update records.

