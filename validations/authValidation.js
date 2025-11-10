const { body } = require("express-validator");
const User = require("../models/user");

exports.signupValidation = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .custom(async (value) => {
      const userDoc = await User.findOne({ email: value });
      if (userDoc) {
        throw new Error("E-mail address already exists!");
      }
      return true;
    })
    .normalizeEmail(),

  body("password")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long."),

  body("name").trim().not().isEmpty().withMessage("Name is required."),
];
