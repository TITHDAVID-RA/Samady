const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const db = new sqlite3.Database('./frappe_desk.db');

app.use(cors());
app.use(express.json());

// Initialize Database
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        village TEXT,
        landNumber TEXT,
        regNumber TEXT,
        date TEXT,
        unitNumber TEXT,
        floor TEXT,
        LMap TEXT,
        oldMap TEXT,
        applicantName TEXT,
        sellerName TEXT,
        buyerName TEXT, 
        serviceType TEXT,
        documentHolder TEXT,
        aj1 TEXT,
        idNumber1 TEXT,
        signature TEXT,
        bankName TEXT,
        contractDate TEXT,
        amountUSD TEXT,
        amountKHR TEXT, 
        otherInfo TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error("❌ Error:", err.message);
        else console.log("✅ Database initialized successfully.");
    });
});

// GET Services (Search logic)
app.get('/api/services', (req, res) => {
    const search = req.query.q || '';
    
    // We use the LIKE operator with % for partial Khmer matching
    const sql = `SELECT service_name FROM khmer_services 
                 WHERE service_name LIKE ? 
                 LIMIT 10`;

    db.all(sql, [`%${search}%`], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Send back just the names as a simple array
        res.json(rows.map(row => row.service_name));
    });
});

// 1. GET ALL
app.get('/api/registrations', (req, res) => {
    db.all("SELECT * FROM registrations ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2. GET SINGLE
app.get('/api/registrations/:id', (req, res) => {
    db.get("SELECT * FROM registrations WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Record not found" });
        res.json(row);
    });
});

// 3. POST (Create)
app.post('/api/registrations', (req, res) => {
    const b = req.body;
    
    // COUNT: 21 Columns and 21 Question Marks
    const sql = `INSERT INTO registrations (
        village, landNumber, regNumber, date, unitNumber, floor, LMap, oldMap, 
        applicantName, sellerName, buyerName, serviceType, documentHolder, aj1, 
        idNumber1, signature, bankName, contractDate, 
        amountUSD, amountKHR, otherInfo
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`; 

    // COUNT: 21 Items in the array
    const params = [
        b.village, b.landNumber, b.regNumber, b.date, b.unitNumber, b.floor, b.LMap, b.oldMap,
        b.applicantName, b.sellerName, b.buyerName, b.serviceType, b.documentHolder, b.aj1, 
        b.idNumber1, b.signature, b.bankName, b.contractDate,
        b.amountUSD, b.amountKHR, b.otherInfo
    ];

    db.run(sql, params, function(err) {
        if (err) {
            console.error("Insert Error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: this.lastID });
    });
});

// 4. PUT (Update)
app.put('/api/registrations/:id', (req, res) => {
    const b = req.body;
    // Added buyerName=? to the update string
    const sql = `UPDATE registrations SET 
        village=?, landNumber=?, regNumber=?, date=?, unitNumber=?, floor=?, LMap=?, oldMap=?, 
        applicantName=?, sellerName=?, buyerName=?, serviceType=?, documentHolder=?, aj1=?, 
        idNumber1=?, signature=?, bankName=?, contractDate=?, 
        amountUSD=?, amountKHR=?, otherInfo=?, updatedAt=CURRENT_TIMESTAMP
        WHERE id = ?`;

    const params = [
        b.village, b.landNumber, b.regNumber, b.date, b.unitNumber, b.floor, b.LMap, b.oldMap,
        b.applicantName, b.sellerName, b.buyerName, b.serviceType, b.documentHolder, b.aj1,
        b.idNumber1, b.signature, b.bankName, b.contractDate,
        b.amountUSD, b.amountKHR, b.otherInfo, 
        req.params.id 
    ];

    db.run(sql, params, function(err) {
        if (err) {
            console.error("Update Error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, changes: this.changes });
    });
});

// 5. DELETE
app.delete('/api/registrations/:id', (req, res) => {
    db.run("DELETE FROM registrations WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));