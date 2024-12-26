const router = require('express').Router();
const cors = require("cors");
const { verifyToken } = require('../middleware/auth-middleware');
const { XAPIKEYMIDDLEWARE } = require('../middleware/x-api-key-middleware');
const { isAdmin } = require('../middleware/isAdmin-middleware')
const { isInventoryManager } = require('../middleware/is-inventory-manager-middleware')

const { addSubCategory, updateSubCategory, deleteSubCategory, getAllSubCategories, getSubCategoryById, getSubCategoryByCategoryId } = require('../controllers/sub-category-controller')

router.post('/subCategory/add-sub-category', verifyToken, isInventoryManager, XAPIKEYMIDDLEWARE, addSubCategory);

router.post('/subCategory/update-sub-category', verifyToken, isInventoryManager, XAPIKEYMIDDLEWARE, updateSubCategory);

router.post('/subCategory/delete-sub-category', verifyToken, isInventoryManager, XAPIKEYMIDDLEWARE, deleteSubCategory);

router.get('/subCategory/get-all-sub-categories', verifyToken, isInventoryManager, XAPIKEYMIDDLEWARE, getAllSubCategories);

router.get('/subCategory/get-sub-category-by-Id/:sub_category_id', verifyToken, isInventoryManager, XAPIKEYMIDDLEWARE, getSubCategoryById);

router.get('/subCategory/get-sub-categories-by-category/:category_id', verifyToken, isInventoryManager, XAPIKEYMIDDLEWARE, getSubCategoryByCategoryId);


module.exports = router;