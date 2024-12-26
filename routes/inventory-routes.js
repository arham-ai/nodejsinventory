const router = require('express').Router();
const cors = require("cors");
const { verifyToken } = require('../middleware/auth-middleware');
const { XAPIKEYMIDDLEWARE } = require('../middleware/x-api-key-middleware');
const { isAdmin } = require('../middleware/isAdmin-middleware')
const { isInventoryManager } = require('../middleware/is-inventory-manager-middleware')

const { addInventoryItem, updateInventoryItem, deleteInventoryItem, getAllInventoryItems, getInventoryItemById } = require('../controllers/inventory-controller')

router.post('/inventory/add-inventory', verifyToken, isInventoryManager, XAPIKEYMIDDLEWARE, addInventoryItem);

router.post('/inventory/update-inventory', verifyToken, isInventoryManager, XAPIKEYMIDDLEWARE, updateInventoryItem);

router.post('/inventory/delete-inventory', verifyToken, isInventoryManager, XAPIKEYMIDDLEWARE, deleteInventoryItem);

router.get('/inventory/get-all-inventory-items', verifyToken, XAPIKEYMIDDLEWARE, getAllInventoryItems);

router.get('/inventory/get-inventory-by-Id/:inventory_id', verifyToken, XAPIKEYMIDDLEWARE, getInventoryItemById);

module.exports = router;