const express = require('express');

const feedController = require('../controllers/feed');

const { createPostValidation } = require("../validations/feedValidation");

const upload = require("../middlewares/multer");

const router = express.Router();

//GET/ feed/posts
router.get('/posts', feedController.getPosts);

//Post/ feed/post
router.post('/post', upload.single('image'), createPostValidation, feedController.createPost);

router.get('/post/:postId', feedController.getPost);

module.exports = router;