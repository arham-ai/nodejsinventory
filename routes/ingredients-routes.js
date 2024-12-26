const router = require('express').Router();
const cors = require("cors");
const { verifyToken } = require('../middleware/auth-middleware');
const { XAPIKEYMIDDLEWARE } = require('../middleware/x-api-key-middleware');
const { isAdmin } = require('../middleware/isAdmin-middleware')

const { addIngredient, updateIngredient, deleteIngredient, getAllIngredients, getIngredientById } = require('../controllers/ingredients-controller');

router.post('/ingredients/add-ingredient', verifyToken, XAPIKEYMIDDLEWARE, addIngredient);

router.post('/ingredients/update-ingredient', verifyToken, XAPIKEYMIDDLEWARE, updateIngredient);

router.post('/ingredients/delete-ingredient', verifyToken, XAPIKEYMIDDLEWARE, deleteIngredient);

router.get('/ingredients/get-all-ingredients', verifyToken, XAPIKEYMIDDLEWARE, getAllIngredients);

router.get('/ingredients/get-ingredient-by-Id/:ingredient_id', verifyToken, XAPIKEYMIDDLEWARE, getIngredientById);

module.exports = router;