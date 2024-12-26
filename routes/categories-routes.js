const router = require('express').Router();
const cors = require("cors");
const { verifyToken } = require('../middleware/auth-middleware');
const { XAPIKEYMIDDLEWARE } = require('../middleware/x-api-key-middleware');
const { isAdmin } = require('../middleware/isAdmin-middleware')
const {isInventoryManager} = require ('../middleware/is-inventory-manager-middleware')

const { addCategory, updateCategory, deleteCategory, getAllCategories, getCategoryById } = require('../controllers/category-controller');

router.post('/categories/add-category', verifyToken, isInventoryManager , XAPIKEYMIDDLEWARE, addCategory);

router.post('/categories/update-category', verifyToken, isInventoryManager  , XAPIKEYMIDDLEWARE, updateCategory);

router.post('/categories/delete-category', verifyToken, isInventoryManager  , XAPIKEYMIDDLEWARE, deleteCategory);

router.get('/categories/get-all-categories', verifyToken, XAPIKEYMIDDLEWARE, getAllCategories);

router.get('/categories/get-category-by-Id/:category_id', verifyToken, XAPIKEYMIDDLEWARE, getCategoryById);

module.exports = router;