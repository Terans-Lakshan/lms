const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();

//middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],  // your React frontend origins
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));

const PORT = process.env.PORT || 3000;

// Database connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('Connected to MongoDB');
  startServer(true);
})
.catch((err) => {
  console.log('Failed to connect to MongoDB', err);
  startServer(false);
});

function startServer(withDb = false) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}${withDb ? ' (with DB)' : ' (no DB)'}`);
  });
}

// Existing routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/degree-programs', require('./routes/degreeProgramRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
