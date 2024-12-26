const dbConnection = require('../dbConnection');

exports.addCategory = async (req, res) => {
    try {
        const { category_name,category_type, description } = req.body;

        const [result] = await dbConnection.execute(
                "INSERT INTO categories (category_name, category_type,description) VALUES (?,?, ?)",
            [category_name,category_type, description || '']
        );

        if (result.affectedRows === 1) {
            res.status(201).json({ message: "Category added successfully!" });
        } else {
            res.status(500).json({ message: "Failed to add category" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { category_id,category_name, category_type,description } = req.body;

        const [result] = await dbConnection.execute(
            "UPDATE categories SET category_name = ?,category_type = ?, description = ? WHERE category_id = ?",
            [category_name,category_type, description, category_id]
        );

        if (result.affectedRows === 1) {
            res.status(200).json({ message: "Category updated successfully!" });
        } else {
            res.status(404).json({ message: "Category not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { category_id } = req.body;
        if (!category_id) {
            return res.status(400).json({ message: "Category ID is required" });
        }

        // Delete the category from the database
        const [result] = await dbConnection.execute(
            "DELETE FROM categories WHERE category_id = ?",
            [category_id]
        );

        if (result.affectedRows === 1) {
            res.status(200).json({ message: "Category deleted successfully!" });
        } else {
            res.status(404).json({ message: "Category not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const [rows] = await dbConnection.execute("SELECT * FROM categories");

        return res.status(200).send({
            message: "Categories retrived successfully",
            data : rows
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const { category_id } = req.params;

        if (!category_id) {
            return res.status(400).json({ message: "Category ID is required" });
        }

        const [rows] = await dbConnection.execute(
            "SELECT * FROM categories WHERE category_id = ?",
            [category_id]
        );
        
        return res.status(200).send({
            message: "Category retrived successfully",
            data: rows[0]
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
