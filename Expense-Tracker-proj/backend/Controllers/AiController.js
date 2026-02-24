const { GoogleGenerativeAI } = require("@google/generative-ai");
const UserModel = require("../Models/User");

const getAiInsights = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await UserModel.findById(userId);

        if (!user || !user.expenses || user.expenses.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No expenses found to analyze. Add some transactions first!"
            });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "GEMINI_API_KEY is missing in backend .env file. Please add it to use AI features!"
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const recentExpenses = user.expenses.slice(-50); // Get last 50 expenses
        const promptParams = recentExpenses.map(e => `${e.title}: ₹${e.amount} (${e.category || 'Other'})`).join("\n");
        const prompt = `Here is a list of my recent transactions (positive amounts are income, negative amounts are expenses):\n${promptParams}\n\nBased on these transactions, please provide a short, helpful financial insight or tip in about 3-4 sentences. Be encouraging and concise.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return res.status(200).json({
            success: true,
            data: responseText
        });

    } catch (err) {
        console.error("AI Error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to generate AI insights. Check the server logs."
        });
    }
}

module.exports = {
    getAiInsights
}
