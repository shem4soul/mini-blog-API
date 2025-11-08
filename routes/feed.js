const express = require('express');

const feedController = require('../controllers/feed');

const { createPostValidation } = require("../validations/feedValidation");

const router = express.Router();

//GET/ feed/posts
router.get('/posts', feedController.getPosts);

//Post/ feed/post
router.post('/post', createPostValidation, feedController.createPost);

router.get('/post/:postId', feedController.getPost);

module.exports = router;