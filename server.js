const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./frappe_desk.db');

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static('HTML'));
app.use('/js', express.static('JS'));
app.use('/css', express.static('.'));

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
    
    const sql = `SELECT service_name FROM khmer_services 
                 WHERE service_name LIKE ? 
                 LIMIT 10`;

    db.all(sql, [`%${search}%`], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows.map(row => row.service_name));
    });
});

// GET ALL
app.get('/api/registrations', (req, res) => {
    db.all("SELECT * FROM registrations ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET SINGLE
app.get('/api/registrations/:id', (req, res) => {
    db.get("SELECT * FROM registrations WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Record not found" });
        res.json(row);
    });
});

// POST (Create)
app.post('/api/registrations', (req, res) => {
    const b = req.body;
    
    const sql = `INSERT INTO registrations (
        village, landNumber, regNumber, date, unitNumber, floor, LMap, oldMap, 
        applicantName, sellerName, buyerName, serviceType, documentHolder, aj1, 
        idNumber1, signature, bankName, contractDate, 
        amountUSD, amountKHR, otherInfo
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`; 

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

// PUT (Update)
app.put('/api/registrations/:id', (req, res) => {
    const b = req.body;
    
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

// DELETE
app.delete('/api/registrations/:id', (req, res) => {
    db.run("DELETE FROM registrations WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// 🔥 CHANGED: Default route now serves LOGIN.html first
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'HTML', 'login.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});