const { validationResult } = require("express-validator");

const Post = require("../models/post");
const User = require('../models/user')
const cloudinary = require('../config/cloudinary'); 

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res.status(200).json({
        message: "Fetched posts successfully.",
        posts: posts,
        totalItems: totalItems,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
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

    // Create post after Cloudinary upload
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imageUrl: uploadResult.secure_url, // Cloudinary hosted image URL
      creator: req.userId,
    });
    post
      .save()
      .then(result => {
        return User.findById(req.userId);
      })
      .then( user => {
        creator = user;
        user.posts.push(post);
        return user.save();
      })
       .then(result => {
         res.status(201).json({
      message: "Post created successfully!",
      post: post,
      creator: { _id: creator._id, name: creator.name}
    });
    })
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
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
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
     }
  
    // ✅ Delete the image from Cloudinary (if it’s a Cloudinary URL)
    if (post.imageUrl && post.imageUrl.includes("res.cloudinary.com")) {
      try {
        // Extract public_id from Cloudinary URL
        const publicId = post.imageUrl.split("/").slice(-1)[0].split(".")[0]; // e.g. "abcd1234"
        await cloudinary.uploader.destroy(`mini-blog/${publicId}`);
      } catch (error) {
        console.warn(
          "⚠️ Could not delete image from Cloudinary:",
          error.message
        );
      }
    }

    // ✅ Delete the post from MongoDB
    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
