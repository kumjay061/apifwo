const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const FORWARDING_NUMBER_FILE = './forwarding_number.json';

// फ़ॉरवर्डिंग नंबर को पढ़ने की API (अब सीधे `/get-forward-number` पर उपलब्ध)
app.get('/get-forward-number', (req, res) => {
    fs.readFile(FORWARDING_NUMBER_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to read forwarding number' });
        }
        res.json({ number: JSON.parse(data).number });
    });
});

// फ़ॉरवर्डिंग नंबर को सेट करने की API (अब सीधे `/set-forward-number` पर उपलब्ध)
app.post('/set-forward-number', (req, res) => {
    const { number } = req.body;

    if (!number || !/^\+?\d+$/.test(number)) {
        return res.status(400).json({ error: 'Invalid phone number' });
    }

    fs.writeFile(FORWARDING_NUMBER_FILE, JSON.stringify({ number }), (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save forwarding number' });
        }
        res.json({ message: 'Forwarding number updated successfully' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
