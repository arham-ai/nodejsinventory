const express = require('express');
const router = express.Router();
const authController = require('../controllers/std_accounts');
const { verifyToken } = require('../middleware/auth-middleware');

router.post('/user/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOtp);
router.post('/upload', authController.uploadfile);
router.put('/update', authController.update);




module.exports = router;
    