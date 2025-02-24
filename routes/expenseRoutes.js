const express = require('express');
const expenseController = require('../controllers/expenseController');

const router = express.Router();

router.post('/', expenseController.addExpense);
router.get('/user/:user_id', expenseController.getExpensesByUser);
router.delete('/delete', expenseController.deleteExpenses);

module.exports = router;