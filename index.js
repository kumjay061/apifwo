const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Body-parser middleware
app.use(bodyParser.json());

// SQLite Database Initialization
let db = new sqlite3.Database(':memory:');

// Create table to store forward number and SMS data
db.serialize(() => {
    db.run("CREATE TABLE forwarder (id INTEGER PRIMARY KEY, number TEXT)");
    db.run("CREATE TABLE sms (id INTEGER PRIMARY KEY, sender TEXT, message TEXT)");

    // Insert default forwarder number (initial value)
    db.run("INSERT INTO forwarder (number) VALUES ('+919876543210')");
});

// Route to get current forwarder number
app.get('/forward-number', (req, res) => {
    db.get("SELECT number FROM forwarder WHERE id = 1", (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ forwardNumber: row.number });
    });
});

// Route to set a new forwarder number
app.post('/set-forward-number', (req, res) => {
    const { number } = req.body;
    if (!number) {
        return res.status(400).json({ error: 'Forward number is required' });
    }

    db.run("UPDATE forwarder SET number = ? WHERE id = 1", [number], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Forwarder number updated successfully' });
    });
});

// Route to forward SMS (POST from Android app)
app.post('/forward-sms', (req, res) => {
    const { sender, message } = req.body;

    if (!sender || !message) {
        return res.status(400).json({ error: 'Sender and message are required' });
    }

    // Store the received SMS in the database
    db.run("INSERT INTO sms (sender, message) VALUES (?, ?)", [sender, message], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Get the current forwarder number
        db.get("SELECT number FROM forwarder WHERE id = 1", (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Simulate forwarding the SMS (in a real app, use an SMS gateway)
            console.log(`Forwarding SMS from ${sender}: "${message}" to ${row.number}`);

            res.json({ message: `SMS forwarded to ${row.number}` });
        });
    });
});

// Route to get all received SMS
app.get('/read-sms', (req, res) => {
    db.all("SELECT * FROM sms", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ smsList: rows });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`API server running at http://localhost:${port}`);
});
