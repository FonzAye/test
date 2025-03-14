const { initializeDb } = require('../config/db');

const registerUser = async (req, res) => {
  const { username, email, password_hash } = req.body;
  console.log("Received data:", { username, email, password_hash });

  try {
    const pool = await initializeDb(); // Ensure we get a DB connection
    const result = await pool.query(
      'INSERT INTO Users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [username, email, password_hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const pool = await initializeDb(); // Ensure we get a DB connection
    const result = await pool.query('SELECT * FROM Users');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

const deleteAllUsers = async (req, res) => {
  try {
    const pool = await initializeDb(); // Ensure we get a DB connection
    await pool.query('DELETE FROM Users'); // Delete all users
    res.status(200).json({ message: 'All users deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting users' });
  }
};

module.exports = { registerUser, getAllUsers, deleteAllUsers };