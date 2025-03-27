import mysql from 'mysql2/promise';
import axios from 'axios';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

const db = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: 'Asia/Bangkok'
});

type Employee = {
    EmpID: string;
    FirstName: string;
    SurName: string;
    PersonalEmail: string;
    Comp: string;
    BU: string;
    StartingDate: string;
    EmailSPD: string;
    EmailHRBP: string;
    ShortComp: string;
    LogStatus: number | null;
    LogNotification: Date | null;
};

async function executeStoredProcedures() {
    try {
        console.log('Executing stored procedure...');
        await db.query(`CALL ${process.env.DB_SP}`);
        console.log('Stored procedure executed successfully!');
    } catch (error) {
        console.error('Error executing stored procedure:', error);
        process.exit(1);
    };
}

async function fetchData(): Promise<Employee[]> {
    try {
        const [rows]: [Employee: [], any] = await db.query(`SELECT * FROM ${process.env.DB_TABLE} WHERE LogStatus IS NULL OR LogStatus = 0`);
        if (rows.length === 0) {
            console.log('No data to fetch. Exiting...');
            return []
        }
        return rows;
    } catch (error) {
        console.error('Error fetching data:', error);
        process.exit(1);
    };
};

// fetchData()
//     .then((rows) => {
//         console.log('Test Fetch Data:', rows);
//     })
//     .catch((error) => {
//         console.error('Error fetching data:', error);
//         process.exit(1);
//     })
//     .finally(() => {
//         db.end();
//     });

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

async function callAPI(employee: Employee) {
    const data = {
        EmpID: employee.EmpID,
        FirstName: employee.FirstName,
        SurName: employee.SurName,
        PersonalEmail: employee.PersonalEmail,
        Comp: employee.Comp,
        BU: employee.BU,
        StartingDate: employee.StartingDate,
        EmailSPD: employee.EmailSPD,
        EmailHRBP: employee.EmailHRBP ? employee.EmailHRBP.split(',') : [],
        ShortComp: employee.ShortComp,
    };

    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.API_URL,
        headers: {
            Authorization: `Basic ${process.env.AUTHORIZATION}`,
            "Content-Type": "application/json",
        },
        data: JSON.stringify(data)
    };

    let attempts = 0;
    const maxRetries = 3;
    while (attempts < maxRetries) {
    try {

        if (attempts > 0) {
            console.log(`⏳ Retrying API call for ${employee.EmpID} (Attempt ${attempts}) in 2 seconds...`);
            await delay(2000);
        } else {
            console.log(`🚀 Calling API for ${employee.EmpID}...`);
            await delay(2000);
        }

        const response = await axios.request(config);

        const { namelist: { EmpID, CreatedAt }, magiclink } = response.data;
        console.log(`✅ API called successfully for ${EmpID} at ${CreatedAt}. Magic link: ${magiclink}`);

        await db.query(`UPDATE ${process.env.DB_TABLE} SET LogStatus = 1, LogNotification = NOW() WHERE EmpID = ?`, [EmpID]);
        return;
    } catch (error) {
        const err = error as any;
        console.error(`❌ Error calling API for ${employee.EmpID} (Attempt ${attempts + 1}):`, err.response?.data || err.message);
    }

    attempts++;
    }
    console.error(`❌ Failed to call API for ${employee.EmpID} after ${maxRetries} attempts. Exiting...`);
}
/*
 (async function testAllFunctions() {
    try {
        console.log("🧪 Running test sequence...");

        // 1️⃣ Execute Stored Procedure
        console.log("🚀 Executing stored procedure...");
        await executeStoredProcedures();
        console.log("✅ Stored procedure executed successfully!");

        // 2️⃣ Fetch Employees
        console.log("🔍 Fetching employees...");
        const employees = await fetchData();
        console.log("✅ Employees fetched successfully:", employees);

        // 3️⃣ Call API (มี Retry & Delay)
        console.log("📤 Calling API for each employee...");
        for (const employee of employees) {
            await callAPI(employee);
        }

        console.log("✅ All functions tested successfully!");
        process.exit(0); // ออกจากโปรแกรมเมื่อทดสอบเสร็จ
    } catch (error) {
        console.error("❌ Test failed:", error);
        process.exit(1); // ออกจากโปรแกรมพร้อม Error Code
    }
})(); 
*/

// /*
// 🔄 Schedule งานให้รันทุกวัน 08:00 AM
cron.schedule("0 8 * * *", async () => {
    console.log("🕗 Running scheduled task...");

    // 1️⃣ Execute Stored Procedure
    await executeStoredProcedures();

    // 2️⃣ Fetch Employees
    const employees = await fetchData();

    // 3️⃣ Call API (มี Retry & Delay)
    for (const employee of employees) {
        await callAPI(employee);
    }

    console.log("✅ Task completed successfully.");
}); 
// */