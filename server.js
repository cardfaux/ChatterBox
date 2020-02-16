const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect To The DataBase
connectDB();

app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
	console.log(`Application API Server Is Running On Port: ${PORT}`)
);
