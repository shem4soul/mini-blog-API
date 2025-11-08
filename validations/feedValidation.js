const { body } = require("express-validator");

exports.createPostValidation = [
  body("title")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Title must be at least 5 characters long"),
  body("content")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Content must be at least 5 characters long"),
];


exports.updatePostValidation = [
  body("title")
    .optional() // Only validate if provided
    .trim()
    .isLength({ min: 5 })
    .withMessage("Title must be at least 5 characters long"),

  body("content")
    .optional() // Only validate if provided
    .trim()
    .isLength({ min: 5 })
    .withMessage("Content must be at least 5 characters long"),
];