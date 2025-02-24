const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

const app = express();

// Import routes
const userRoutes = require('./routes/userRoutes'); // Ensure correct path
const expenseRoutes = require('./routes/expenseRoutes'); // Add this line

// Middleware
app.use(cors());
app.use(express.json());

// Use routes
app.use('/api/users', userRoutes); // This will correctly mount /api/users/register
app.use('/api/expenses', expenseRoutes); // Expense routes (important)

// Test route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running!' });
});

module.exports = app;
