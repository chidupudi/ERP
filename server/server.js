const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const app = express();
const facultyRoutes = require('./admin/FacultyList');
const studentsRoutes = require('./admin/StudentList');

// Configuration
const MONGO_URI = 'mongodb://localhost:27017/erpdb';
const PORT = 5000;

// Database Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('ERP Local Server Running'));
app.use('/api/faculty', facultyRoutes);
app.use('/api/students', studentsRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));