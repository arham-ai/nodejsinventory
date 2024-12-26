const dbConnection = require('../dbConnection');


exports.addIngredient = async (req, res) => {
    try {
        const { name, barcode, unit, quantity, expiry_date, batch_no } = req.body;

        const [existingBarcode] = await dbConnection.execute("SELECT barcode FROM ingredients WHERE barcode = ?", [barcode]);

        if (existingBarcode.length > 0) {
            return res.status(400).json({ message: "Barcode must be unique" });
        }

        const [result] = await dbConnection.execute(
            "INSERT INTO ingredients (name, barcode, unit, quantity, expiry_date, batch_no) VALUES (?, ?, ?, ?, ?, ?)",
            [name, barcode, unit, quantity, expiry_date, batch_no]
        );

        if (result.affectedRows === 1) {
            return res.status(201).json({ message: "Ingredient added successfully" });
        } else {
            return res.status(500).json({ message: "Failed to add ingredient" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.updateIngredient = async (req, res) => {
    try {
        const { ingredient_id, name, barcode, unit, quantity, expiry_date, batch_no } = req.body;

        const [existingIngredient] = await dbConnection.execute(
            "SELECT * FROM ingredients WHERE ingredient_id = ?", [ingredient_id]
        );

        if (existingIngredient.length === 0) {
            return res.status(404).json({ message: "Ingredient not found" });
        }

        const [result] = await dbConnection.execute(
            "UPDATE ingredients SET name = ?, barcode = ?, unit = ?, quantity = ?, expiry_date = ?, batch_no = ? WHERE ingredient_id = ?",
            [name, barcode, unit, quantity, expiry_date, batch_no, ingredient_id]
        );

        if (result.affectedRows === 1) {
            return res.status(200).json({ message: "Ingredient updated successfully" });
        } else {
            return res.status(500).json({ message: "Failed to update ingredient" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.deleteIngredient = async (req, res) => {
    try {
        const { ingredient_id } = req.body;

        const [existingIngredient] = await dbConnection.execute(
            "SELECT * FROM ingredients WHERE ingredient_id = ?", [ingredient_id]
        );

        if (existingIngredient.length === 0) {
            return res.status(404).json({ message: "Ingredient not found" });
        }

        const [result] = await dbConnection.execute(
            "DELETE FROM ingredients WHERE ingredient_id = ?", [ingredient_id]
        );

        if (result.affectedRows === 1) {
            return res.status(200).json({ message: "Ingredient deleted successfully" });
        } else {
            return res.status(500).json({ message: "Failed to delete ingredient" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.getAllIngredients = async (req, res) => {
    try {
        const [ingredients] = await dbConnection.execute("SELECT * FROM ingredients");

        if (ingredients.length > 0) {
            return res.status(200).json({ ingredients });
        } else {
            return res.status(404).json({ message: "No ingredients found" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

exports.getIngredientById = async (req, res) => {
    try {
        const { ingredient_id } = req.params;

        const [ingredient] = await dbConnection.execute(
            "SELECT * FROM ingredients WHERE ingredient_id = ?", [ingredient_id]
        );

        if (ingredient.length > 0) {
            return res.status(200).json({ ingredient: ingredient[0] });
        } else {
            return res.status(404).json({ message: "Ingredient not found" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
