const { Pool } = require('pg');
require('dotenv').config(); // Ensure environment variables are loaded

console.log("DB_HOST:", process.env.DB_HOST); // Debugging log

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Function to create tables if they don't exist
const createTables = async () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS Users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL
    );
  `;

  const createExpensesTable = `
    CREATE TABLE IF NOT EXISTS Expenses (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES Users(id) ON DELETE CASCADE,
      amount DECIMAL(10, 2) NOT NULL,
      category VARCHAR(50) NOT NULL,
      date DATE NOT NULL,
      description TEXT
    );
  `;

  try {
    await pool.query(createUsersTable);
    await pool.query(createExpensesTable);
    console.log("Tables created successfully (if they did not exist).");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
};

// Function to add a new user
const addUser = async (username, email, passwordHash) => {
  const insertUserQuery = `
    INSERT INTO Users (username, email, password_hash)
    VALUES ($1, $2, $3) RETURNING *;
  `;

  try {
    const res = await pool.query(insertUserQuery, [username, email, passwordHash]);
    console.log("User added:", res.rows[0]);
    return res.rows[0]; // Return the newly created user
  } catch (err) {
    console.error("Error adding user:", err);
  }
};

// Function to add an expense for a user
const addExpense = async (userId, amount, category, date, description) => {
  const insertExpenseQuery = `
    INSERT INTO Expenses (user_id, amount, category, date, description)
    VALUES ($1, $2, $3, $4, $5) RETURNING *;
  `;

  try {
    const res = await pool.query(insertExpenseQuery, [userId, amount, category, date, description]);
    console.log("Expense added:", res.rows[0]);
    return res.rows[0]; // Return the newly created expense
  } catch (err) {
    console.error("Error adding expense:", err);
  }
};

// Test DB connection and create tables
pool.query('SELECT NOW()', async (err, res) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Database connected successfully at:", res.rows[0].now);
    await createTables(); // Call table creation after successful connection

    // Example usage (for testing)
    const newUser = await addUser("john_doe", "john@example.com", "hashedpassword123");
    if (newUser) {
      await addExpense(newUser.id, 100.50, "Food", "2025-02-20", "Dinner at a restaurant");
    }
  }
});

module.exports = { pool, addUser, addExpense };
