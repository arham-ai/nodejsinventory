const router = require('express').Router();
const cors = require("cors");
const { verifyToken } = require('../middleware/auth-middleware');
const { XAPIKEYMIDDLEWARE } = require('../middleware/x-api-key-middleware');
const { isAdmin } = require('../middleware/isAdmin-middleware')
const { isInventoryManager } = require('../middleware/is-inventory-manager-middleware')


const {addInventoryOrder,updateInventoryOrder,getAllInventoryOrders} = require ('../controllers/inventory-orders-controller')

router.post('/inventoryOrder/add-inventory-order', verifyToken, isInventoryManager, XAPIKEYMIDDLEWARE, addInventoryOrder);

router.post('/inventoryOrder/update-all-inventory-orders', verifyToken,isInventoryManager, XAPIKEYMIDDLEWARE, updateInventoryOrder);

router.get('/inventoryOrder/get-all-inventory-orders', verifyToken,isInventoryManager, XAPIKEYMIDDLEWARE, getAllInventoryOrders);


module.exports = router;
