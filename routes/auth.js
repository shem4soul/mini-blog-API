const express = require('express');

const router = express.Router();
const authController = require("../controllers/auth");

const { signupValidation, loginValidation } = require("../validations/authValidation");




router.post("/signup", signupValidation, authController.signup);


router.post("/login", loginValidation, authController.login);

module.exports = router;