const dbConnection = require('../dbConnection');
const uploadInventory = require('../middleware/inventory-upload-middleware')
const path = require('path');
const fs = require('fs').promises;
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)
const multer = require("multer");


exports.addInventoryItem = async (req, res) => {
    try {
        await uploadInventory(req, res);
        let inventoryImageUrl = "";
        if (req.file) {
            inventoryImageUrl = '/resources/static/assets/uploads/inventoryImages/' + req.file.filename;
        }

        const { item_name, barcode, type, price, quantity } = req.body;

        const [checkExistence] = await dbConnection.execute(`SELECT * FROM inventory WHERE item_name = ?`, [item_name]);
        if (checkExistence.length > 0) {
            if (req.file) removeUploadedFile(req.file.path);
            return res.status(400).json({ message: "Item already exists" });
        }

        const [addInventoryItem] = await dbConnection.execute("INSERT INTO inventory (item_name, barcode,type,price,quantity,image) VALUES (?, ?, ?,?,?,?)", [item_name, barcode, type, price, quantity, inventoryImageUrl]);

        if (addInventoryItem.affectedRows === 1) {
            return res.status(200).send({
                message: "Inventory item added successfully"
            });
        } else {
            if (req.file) removeUploadedFile(req.file.path);
            return res.status(500).json({
                message: "Could not add item"
            });
        }
    } catch (err) {
        if (req.file) removeUploadedFile(req.file.path);
        res.status(500).send({
            message: err.message
        });
    }
};

exports.removeUploadedFile=(file) =>{
    if (file) {
        const filePath = path.join(__dirname, '..', file);
        if (fs.access(filePath)) {
            fs.unlink(filePath);
        }
    }
}

exports.updateInventoryItem = async (req, res) => {
    try {
        uploadInventory(req, res, async (err) => {
            if (err) {
                return res.status(500).send({
                    message: "Failed",
                    data: `Could not process the file: ${err.message}`,
                });
            }

            const { inventory_id, item_name, barcode, type, price, quantity } = req.body;
            const [checkExistence] = await dbConnection.execute(`SELECT * FROM inventory WHERE inventory_id = ?`, [inventory_id]);
            if (checkExistence.length < 1) {
                if (req.file) removeUploadedFile(req.file.path);
                return res.status(400).json({
                    message: "Inventory item does not exist"
                });
            }

            let inventoryImageUrl = checkExistence[0].image;
            if (req.file && req.file.filename) {
                inventoryImageUrl = `/resources/static/assets/uploads/inventoryImages/${Date.now().toString().slice(0, -3)}-${req.file.filename}`;

                const oldAttachmentPath = path.join(__dirname, '..', checkExistence[0].image);
                try {
                    await fs.access(oldAttachmentPath);
                    await fs.unlink(oldAttachmentPath);
                } catch (error) {
                    console.error(`Failed to delete old item image: ${error.message}`);
                }
            }

            const [updateInventoryItem] = await dbConnection.execute(
                "UPDATE inventory SET item_name = ?, barcode = ?, type = ?, price = ?, quantity = ?, image = ? WHERE inventory_id = ?",
                [item_name, barcode, type, price, quantity, inventoryImageUrl, inventory_id]
            );
            if (updateInventoryItem.affectedRows === 1) {
                return res.status(200).send({
                    message: "Inventory updated successfully"
                });
            } else {
                if (req.file) removeUploadedFile(req.file.path);
                return res.status(500).json({
                    message: "Could not update inventory"
                });
            }
        });
    } catch (err) {
        res.status(500).send({
            message: err.message
        });
    }
};

exports.deleteInventoryItem = async (req, res) => {
    try {
        const [inventory] = await dbConnection.execute(`SELECT image FROM inventory WHERE inventory_id = ?`, [req.body.inventory_id]);

        if (!inventory.length) {
            return res.status(400).send({
                message: "Item not found"
            });
        }

        const inventoryImageUrl = inventory[0].image;

        if (inventoryImageUrl) {
            const imagePath = path.join(__dirname, '..', inventoryImageUrl);
            if (fs.access(imagePath)) {
                fs.unlink(imagePath);
            }
        }
        const [deleteInventory] = await dbConnection.execute(`DELETE FROM inventory WHERE inventory_id = ?`, [req.body.inventory_id]);

        return res.status(200).json({
            message: "Inventory item deleted successfully"
        });

    } catch (err) {
        res.status(500).send({
            message: err.message
        });
    }
};

exports.getAllInventoryItems = async (req, res) => {
    try {
        const [getAllInventoryItems] = await dbConnection.execute(`SELECT * FROM inventory`);
        return res.status(200).json({
            message: "Inventory Items retrieved successfully",
            data: getAllInventoryItems
        });
    } catch (err) {
        res.status(500).send({
            message: err.message
        });
    }
};

exports.getInventoryItemById = async (req, res) => {
    try {
        const { inventory_id } = req.params;
        const [getInventoryItemById] = await dbConnection.execute(`SELECT * FROM inventory where inventory_id=?`, [inventory_id]);

        return res.status(200).json({
            message: "Inventory retrieved successfully",
            data: getInventoryItemById[0]
        });
    } catch (err) {
        res.status(500).send({
            message: err.message
        });
    }
};







