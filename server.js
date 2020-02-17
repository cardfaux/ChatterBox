const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect To The DataBase
connectDB();

// Init Middleware For BodyParser To Parse The req.body
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/posts', require('./routes/posts'));

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
	const io = require('socket.io')(server);
	io.on('connection', (socket) => {
		console.log('Client Connected');
	});
	console.log(`Application API Server Is Running On Port: ${PORT}.....!`);
});
