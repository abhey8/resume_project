const UserModel = require("../Models/User");

const getAllTransactions = async (req, res) => {
  try {
    const { _id } = req.user;
    const user = await UserModel.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }
    res.status(200).json({
      message: "Fetched user expenses successfully",
      success: true,
      data: user.expenses
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch expenses",
      success: false,
      error: err
    });
  }
}

const addTransaction = async (req, res) => {
  try {
    const { _id } = req.user;
    const transaction = req.body;
    const user = await UserModel.findByIdAndUpdate(
      _id,
      { $push: { expenses: transaction } },
      { new: true } // Return the updated document
    );
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }
    res.status(200).json({
      message: "Expense added successfully",
      success: true,
      data: user.expenses
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to add expense",
      success: false,
      error: err
    });
  }
}

const deleteTransaction = async (req, res) => {
  try {
    const { _id } = req.user;
    const { expenseId } = req.params;
    const user = await UserModel.findByIdAndUpdate(
      _id,
      { $pull: { expenses: { _id: expenseId } } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }
    res.status(200).json({
      message: "Expense deleted successfully",
      success: true,
      data: user.expenses
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete expense",
      success: false,
      error: err
    });
  }
}

module.exports = {
  getAllTransactions,
  addTransaction,
  deleteTransaction
}
