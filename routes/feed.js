const express = require('express');

const feedController = require('../controllers/feed');

const isAuth = require('../middlewares/is-auth');

const { createPostValidation, updatePostValidation } = require("../validations/feedValidation");

const upload = require("../middlewares/multer");

const router = express.Router();

//GET/ feed/posts
router.get('/posts', isAuth, feedController.getPosts);

//Post/ feed/post
router.post('/post', upload.single('image'), isAuth,createPostValidation, feedController.createPost);

router.get('/post/:postId', isAuth, feedController.getPost);

router.put("/post/:postId", upload.single("image"), isAuth,updatePostValidation, feedController.updatePost);

router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;