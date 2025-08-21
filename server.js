const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',         // use your MySQL username
  password: 'root',         // use your MySQL password
  database: 'consumerDB'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to DB:', err);
  } else {
    console.log('Connected to MySQL DB');
  }
});


// Start server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});


// POST route to save consumer data
app.post('/register', (req, res) => {
  const data = req.body;

  const sql = `
    INSERT INTO consumers (
      usc_number, consumer_name, consumer_mobile, id_type, id_no,
      house_no, ero, district, state, pin, date_time,
      category, contracted_load, connection_type, meter_no, service_no
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    data.usc_number, data.consumer_name, data.consumer_mobile, data.id_type, data.id_no,
    data.house_no, data.ero, data.district, data.state, data.pin, data.date_time,
    data.category, data.contracted_load, data.connection_type, data.meter_no, data.service_no
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Insert failed:', err);
      res.status(500).send({ message: 'Database Error' });
    } else {
      res.send({ message: 'Consumer Registered Successfully!' });
    }
  });
});


// GET consumer details by USC number
app.get('/consumer/:usc_number', (req, res) => {
  const uscNumber = req.params.usc_number;

  const query = 'SELECT * FROM consumers WHERE Usc_Number = ?';

  db.query(query, [uscNumber], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Consumer not found' });
    }

    res.json(results[0]);
  });
});


// UPDATE consumer by USC number
app.put('/consumer/:usc_number', (req, res) => {
  const usc = req.params.usc_number;
  const data = req.body;

  const updateQuery = `
    UPDATE consumers SET
      Consumer_Name = ?,
      Consumer_Mobile = ?,
      ID_Type = ?,
      ID_No = ?,
      House_No = ?,
      ERO = ?,
      District = ?,
      State = ?,
      PIN = ?,
      Date_Time = ?,
      Category = ?,
      Contracted_Load = ?,
      Connection_Type = ?,
      Meter_No = ?,
      Service_No = ?
    WHERE Usc_Number = ?
  `;

  const values = [
    data.consumer_name,
    data.consumer_mobile,
    data.id_type,
    data.id_no,
    data.house_no,
    data.ero,
    data.district,
    data.state,
    data.pin,
    data.date_time,
    data.category,
    data.contracted_load,
    data.connection_type,
    data.meter_no,
    data.service_no,
    usc
  ];

  db.query(updateQuery, values, (err, result) => {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).json({ message: 'Update failed', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Consumer not found for update' });
    }

    res.json({ message: 'Consumer updated successfully' });
  });
});


// DELETE consumer by USC number
app.delete('/consumer/:usc_number', (req, res) => {
  const usc = req.params.usc_number;

  const deleteQuery = 'DELETE FROM consumers WHERE Usc_Number = ?';

  db.query(deleteQuery, [usc], (err, result) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ message: 'Delete failed', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Consumer not found for deletion' });
    }

    res.json({ message: 'Consumer deleted successfully' });
  });
});



// NEW: GET consumer by Usc_Number or Service_No
app.get('/consumer/details/:number', (req, res) => {
  const input = req.params.number;

  const query = 'SELECT Usc_Number,Consumer_Name,Category,Contracted_Load,Connection_Type,Meter_No,Service_No FROM consumers WHERE Usc_Number = ? OR Service_No = ?';

  db.query(query, [input, input], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Consumer not found' });
    }

    res.json(results[0]);
  });
});


// =========================

app.post('/bill', (req, res) => {
  const data = req.body;

  const checkQuery = `
    SELECT * FROM billdetails
    WHERE (Usc_Number = ? OR Service_No = ?) AND Year = ? AND Month = ?
  `;

  db.query(checkQuery, [data.usc_number, data.service_no, data.year, data.month], (err, results) => {
    if (err) {
      console.error("Error checking for existing bill:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      // Bill already exists for this combination
      return res.status(400).json({ message: "Bill already issued for this USC/Service number for the selected month and year." });
    }

    // Proceed to insert if no existing bill found
    const insertQuery = `
      INSERT INTO billdetails (
        Reference_Number, Usc_Number, Service_No, Year, Month, Units, Bill_Amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.reference_number,
      data.usc_number,
      data.service_no,
      data.year,
      data.month,
      data.units,
      data.billamount
    ];

    db.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error("Insert error:", err);
        return res.status(500).json({ message: "Failed to save bill" });
      }

      res.json({ message: "Bill saved successfully!" });
    });
  });
});

// GET all transaction records for a consumer (by USC or Service No)
app.get('/transactions/:number', (req, res) => {
  const input = req.params.number;

  const query = `
    SELECT * FROM billdetails 
    WHERE Usc_Number = ? OR Service_No = ?
    ORDER BY Year ASC, Month ASC
  `;

  db.query(query, [input, input], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error' });  // ✅ JSON error
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No transactions found' }); // ✅ JSON error
    }

    res.json(results); // ✅ JSON success
  });
});
