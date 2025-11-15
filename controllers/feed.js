const { validationResult } = require("express-validator");

const io = require("../socket");
const Post = require("../models/post");
const User = require('../models/user')
const cloudinary = require('../config/cloudinary'); 

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
    .populate('creator')
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: "Fetched posts successfully.",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.createPost = async (req, res, next) => {
  try {
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

    // ✅ Upload image directly from memory buffer
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "mini-blog" }, // optional folder name
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      stream.end(req.file.buffer); // send file buffer directly
    });

    // Create post
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imageUrl: uploadResult.secure_url,
      creator: req.userId,
    });

    const savedPost = await post.save();

    // Update user
    const user = await User.findById(req.userId);
    user.posts.push(savedPost);
    await user.save();
    // io.getIO().broadcast.emit('posts', {action: 'create', post: post});
    io.getIO().currentSocket.broadcast.emit("posts", {
      action: "create",
      post: savedPost,
    });

    res.status(201).json({
      message: "Post created successfully!",
      post: savedPost,
      creator: { _id: user._id, name: user.name },
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};


exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "Post fetched.", post: post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};







exports.updatePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect.");
      error.statusCode = 422;
      throw error;
    }

    const title = req.body.title;
    const content = req.body.content;

    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
     if (post.creator.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
     }
    let imageUrl = post.imageUrl; // Default: keep old image

    // ✅ If a new image file is uploaded
    if (req.file) {
      // 1. Upload the new image to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "mini-blog" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(req.file.buffer);
      });

      // 2. Delete the old image from Cloudinary (optional but recommended)
      // Only do this if your imageUrl includes a public_id
      if (post.imageUrl && post.imageUrl.includes("res.cloudinary.com")) {
        try {
          const publicId = post.imageUrl.split("/").slice(-1)[0].split(".")[0];
          await cloudinary.uploader.destroy(`mini-blog/${publicId}`);
        } catch (error) {
          console.warn("⚠️ Could not delete old image:", error.message);
        }
      }

      // 3. Update with the new Cloudinary URL
      imageUrl = uploadResult.secure_url;
    }

    // ✅ Update post fields
    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;

    const updatedPost = await post.save();

    res.status(200).json({
      message: "Post updated successfully!",
      post: updatedPost,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};


exports.deletePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }

    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }

    // ✅ Delete image from Cloudinary if applicable
    if (post.imageUrl && post.imageUrl.includes("res.cloudinary.com")) {
      try {
        const match = post.imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
        if (match) {
          const publicId = match[1];
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (error) {
        console.warn(
          "⚠️ Could not delete image from Cloudinary:",
          error.message
        );
      }
    }

    // ✅ Delete post from MongoDB and then update the user
    await Post.findByIdAndDelete(postId)
      .then(() => {
        return User.findById(req.userId);
      })
      .then((user) => {
        user.posts.pull(postId);
        return user.save();
      });

    res.status(200).json({ message: "Post deleted successfully." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
