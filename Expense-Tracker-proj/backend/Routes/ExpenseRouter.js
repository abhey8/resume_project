const express = require('express');
const router = express.Router();

const {
  getAllTransactions,
  addTransaction,
  deleteTransaction
} = require('../Controllers/ExpenseController');

const ensureAuthenticated = require('../Middlewares/Auth');

router.get('/', ensureAuthenticated, getAllTransactions);
router.post('/', ensureAuthenticated, addTransaction);
router.delete('/:expenseId', ensureAuthenticated, deleteTransaction);

module.exports = router;
