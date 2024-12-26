const router = require('express').Router();
const cors = require("cors");
const { verifyToken } = require('../middleware/auth-middleware');
const { XAPIKEYMIDDLEWARE } = require('../middleware/x-api-key-middleware');
const { isAdmin } = require('../middleware/isAdmin-middleware')
const { isInventoryManager } = require('../middleware/is-inventory-manager-middleware')



const { addSupplier, updateSupplier, deleteSupplier, getAllSuppliers, getSupplierById } = require('../controllers/supplier-controller')

router.post('/supplier/add-supplier', verifyToken, isInventoryManager, XAPIKEYMIDDLEWARE, addSupplier);

router.post('/supplier/update-supplier', verifyToken, isInventoryManager, XAPIKEYMIDDLEWARE, updateSupplier);

router.post('/supplier/delete-supplier', verifyToken, isInventoryManager, XAPIKEYMIDDLEWARE, deleteSupplier);

router.get('/supplier/get-all-suppliers', verifyToken, XAPIKEYMIDDLEWARE, getAllSuppliers);

router.get('/supplier/get-supplier-by-Id/:supplier_id', verifyToken, XAPIKEYMIDDLEWARE, getSupplierById);

module.exports = router;