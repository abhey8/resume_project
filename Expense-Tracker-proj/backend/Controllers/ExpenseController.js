const getAllTransactions = async (req, res) => {
  res.status(200).json({ message: "Get all transactions" });
};

const addTransaction = async (req, res) => {
  res.status(200).json({ message: "Add transaction" });
};

const deleteTransaction = async (req, res) => {
  res.status(200).json({ message: "Delete transaction" });
};

module.exports = {
  getAllTransactions,
  addTransaction,
  deleteTransaction
};
