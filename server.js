const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();

// SQLite database (Render has persistent disk)
const db = new Database('./frappe_desk.db');

app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static('HTML'));
app.use('/js', express.static('JS'));
app.use('/css', express.static('.'));

// Initialize Database
const initDb = () => {
    try {
        db.exec(`CREATE TABLE IF NOT EXISTS registrations (
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
        )`);
        console.log("✅ Database initialized successfully.");
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
};
initDb();

// GET Services (Search logic) - FIXED for SQLite
app.get('/api/services', (req, res) => {
    try {
        const search = req.query.q || '';
        const stmt = db.prepare(`SELECT service_name FROM khmer_services 
                                 WHERE service_name LIKE ? 
                                 LIMIT 10`);
        const rows = stmt.all(`%${search}%`);
        res.json(rows.map(row => row.service_name));
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET ALL
app.get('/api/registrations', (req, res) => {
    try {
        const stmt = db.prepare("SELECT * FROM registrations ORDER BY id DESC");
        const rows = stmt.all();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET SINGLE
app.get('/api/registrations/:id', (req, res) => {
    try {
        const stmt = db.prepare("SELECT * FROM registrations WHERE id = ?");
        const row = stmt.get(req.params.id);
        if (!row) return res.status(404).json({ error: "Record not found" });
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST (Create)
app.post('/api/registrations', (req, res) => {
    try {
        const b = req.body;
        
        const stmt = db.prepare(`INSERT INTO registrations (
            village, landNumber, regNumber, date, unitNumber, floor, LMap, oldMap, 
            applicantName, sellerName, buyerName, serviceType, documentHolder, aj1, 
            idNumber1, signature, bankName, contractDate, 
            amountUSD, amountKHR, otherInfo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        const result = stmt.run(
            b.village, b.landNumber, b.regNumber, b.date, b.unitNumber, b.floor, b.LMap, b.oldMap,
            b.applicantName, b.sellerName, b.buyerName, b.serviceType, b.documentHolder, b.aj1, 
            b.idNumber1, b.signature, b.bankName, b.contractDate,
            b.amountUSD, b.amountKHR, b.otherInfo
        );

        res.json({ success: true, id: result.lastInsertRowid });
    } catch (err) {
        console.error("Insert Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// PUT (Update)
app.put('/api/registrations/:id', (req, res) => {
    try {
        const b = req.body;
        
        const stmt = db.prepare(`UPDATE registrations SET 
            village = ?, landNumber = ?, regNumber = ?, date = ?, unitNumber = ?, 
            floor = ?, LMap = ?, oldMap = ?, applicantName = ?, sellerName = ?, 
            buyerName = ?, serviceType = ?, documentHolder = ?, aj1 = ?, 
            idNumber1 = ?, signature = ?, bankName = ?, contractDate = ?, 
            amountUSD = ?, amountKHR = ?, otherInfo = ?, updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?`);

        const result = stmt.run(
            b.village, b.landNumber, b.regNumber, b.date, b.unitNumber, b.floor, b.LMap, b.oldMap,
            b.applicantName, b.sellerName, b.buyerName, b.serviceType, b.documentHolder, b.aj1,
            b.idNumber1, b.signature, b.bankName, b.contractDate,
            b.amountUSD, b.amountKHR, b.otherInfo, 
            req.params.id
        );

        res.json({ success: true, changes: result.changes });
    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// DELETE
app.delete('/api/registrations/:id', (req, res) => {
    try {
        const stmt = db.prepare("DELETE FROM registrations WHERE id = ?");
        const result = stmt.run(req.params.id);
        res.json({ success: true, changes: result.changes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Default route - serve login.html FIRST
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'HTML', 'login.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});