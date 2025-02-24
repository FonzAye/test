const { initializeDb } = require('../config/db');

const addExpense = async (req, res) => {
  const { user_id, amount, category, date, description } = req.body;

  try {
    const pool = await initializeDb(); // Ensure we get a DB connection
    const result = await pool.query(
      'INSERT INTO Expenses (user_id, amount, category, date, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, amount, category, date, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding expense' });
  }
};

const getExpensesByUser = async (req, res) => {
    const { user_id } = req.params;
  
    try {
      const pool = await initializeDb(); // Ensure we get a DB connection
      const result = await pool.query('SELECT * FROM Expenses WHERE user_id = $1', [user_id]);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching expenses' });
    }
  };

  const deleteExpenses = async (req, res) => {
    const { expense_ids } = req.body; // Expecting an array of expense IDs
  
    if (!expense_ids || !Array.isArray(expense_ids) || expense_ids.length === 0) {
      return res.status(400).json({ message: 'Invalid request: Provide an array of expense IDs' });
    }
  
    try {
      const pool = await initializeDb(); // Ensure we get a DB connection
      const query = 'DELETE FROM Expenses WHERE id = ANY($1) RETURNING *';
      const result = await pool.query(query, [expense_ids]);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'No expenses found for deletion' });
      }
  
      res.status(200).json({ message: 'Expenses deleted successfully', deleted: result.rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting expenses' });
    }
  };
  
  module.exports = { addExpense, getExpensesByUser, deleteExpenses };