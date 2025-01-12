const db = require('../config/db');

// Controller to get all categories
const getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query("SELECT * FROM Categories");
        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { getAllCategories };
