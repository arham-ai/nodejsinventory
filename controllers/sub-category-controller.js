const dbConnection = require('../dbConnection');

exports.addSubCategory = async (req, res) => {
    const { sub_category_name, unit,category_id } = req.body;

    try {
        // Check if the category exists
        const [categoryExists] = await dbConnection.execute(
            `SELECT * FROM categories WHERE category_id = ?`, 
            [category_id]
        );
        if (categoryExists.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Insert the new sub-category
        const [result] = await dbConnection.execute(
            `INSERT INTO sub_category (sub_category_name,unit, category_id) VALUES (?, ?,?)`,
            [sub_category_name,unit, category_id]
        );

        res.status(201).json({ message: "Sub-category added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.updateSubCategory = async (req, res) => {
    const { sub_category_id, sub_category_name,unit, category_id } = req.body;

    try {
        // Check if the sub-category exists
        const [subcategoryExists] = await dbConnection.execute(
            `SELECT * FROM sub_category WHERE sub_category_id = ?`,
            [sub_category_id]
        );
        if (subcategoryExists.length === 0) {
            return res.status(404).json({ message: "Sub-category not found" });
        }

        // Update the sub-category
        const [result] = await dbConnection.execute(
            `UPDATE sub_category SET sub_category_name = ?,unit=?, category_id = ? WHERE sub_category_id = ?`,
            [sub_category_name,unit, category_id, sub_category_id]
        );

        res.status(200).json({ message: "Sub-category updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.deleteSubCategory = async (req, res) => {
    const { sub_category_id } = req.body;

    try {
        // Check if the sub-category exists
        const [subcategoryExists] = await dbConnection.execute(
            `SELECT * FROM sub_category WHERE sub_category_id = ?`,
            [sub_category_id]
        );
        if (subcategoryExists.length === 0) {
            return res.status(404).json({ message: "Sub-category not found" });
        }

        // Delete the sub-category
        await dbConnection.execute(
            `DELETE FROM sub_category WHERE sub_category_id = ?`,
            [sub_category_id]
        );

        res.status(200).json({ message: "Sub-category deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getAllSubCategories = async (req, res) => {
    try {
        const [subCategories] = await dbConnection.execute(
            `SELECT sc.sub_category_id, sc.sub_category_name, sc.unit,sc.category_id, c.category_name 
             FROM sub_category sc 
             JOIN categories c ON sc.category_id = c.category_id`
        );

        res.status(200).json(subCategories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getSubCategoryById = async (req, res) => {
    const { sub_category_id } = req.params;

    try {
        const [subCategory] = await dbConnection.execute(
            `SELECT sc.sub_category_id, sc.sub_category_name,sc.unit, sc.category_id, c.category_name 
             FROM sub_category sc 
             JOIN categories c ON sc.category_id = c.category_id
             WHERE sc.sub_category_id = ?`,
            [sub_category_id]
        );

        if (subCategory.length === 0) {
            return res.status(404).json({ message: "Sub-category not found" });
        }

        res.status(200).json(subCategory[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getSubCategoryByCategoryId = async (req, res) => {
    const { category_id } = req.params;

    try {
        const [subCategories] = await dbConnection.execute(
            `SELECT sub_category_id, sub_category_name,unit FROM sub_category WHERE category_id = ?`,
            [category_id]
        );

        if (subCategories.length === 0) {
            return res.status(404).json({ message: "No sub-categories found for this category" });
        }

        res.status(200).json(subCategories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
