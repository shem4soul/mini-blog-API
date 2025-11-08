const { validationResult } = require("express-validator");

const Post = require("../models/post");
const cloudinary = require('../config/cloudinary'); 

exports.getPosts = (req, res, next) => {
  Post.find()
    .then((posts) => {
      res
        .status(200)
        .json({ message: "Fetched posts successfully.", posts: posts });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }

  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "mini-blog", // optional folder
    });

    const title = req.body.title;
    const content = req.body.content;

    const post = new Post({
      title,
      content,
      imageUrl: result.secure_url, // Cloudinary URL
      creator: { name: "shem" },
    });

    const savedPost = await post.save();

    res.status(201).json({
      message: "Post created successfully!",
      post: savedPost,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Post fetched.", post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
