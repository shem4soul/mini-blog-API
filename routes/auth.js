const express = require('express');

const router = express.Router();
const authController = require("../controllers/auth");

const { signupValidation } = require("../validations/authValidation");




router.post("/signup", signupValidation, authController.signup);

module.exports = router;