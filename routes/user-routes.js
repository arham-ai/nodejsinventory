const router = require('express').Router();
const cors = require("cors");
const { XAPIKEYMIDDLEWARE } = require('../middleware/x-api-key-middleware');
const { verifyToken } = require('../middleware/auth-middleware');


const { signUp, loginUser, getAllUsers } = require('../controllers/users-controller');

router.post('/users/signUp-user', XAPIKEYMIDDLEWARE, signUp);

router.post('/users/login-user', XAPIKEYMIDDLEWARE, loginUser);

router.get('/users/get-all-users', verifyToken, XAPIKEYMIDDLEWARE, getAllUsers);

module.exports = router;
