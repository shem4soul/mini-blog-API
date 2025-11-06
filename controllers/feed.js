const  post  = require("../routes/feed");
const { validationResult } = require("express-validator");

const Post = require("../models/post");


exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [{
        _id: '1',
        title: 'First Post',
        content: ' This is the first post!',
    imageUrl: 'images/hp.jpeg',
    creator: {
    name: 'Shem'
    }, 
    createdAt: new Date()
    }
]
    });
};


exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
      .status(422)
      .json({
      message: 'Validation failed, entered data is incorrect',
       errors: errors.array() });
    }

    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
      title: title,
      content: content,
      creator: { name: "Mr shem" },
    });
    post
       .save()
       .then(result => {
        console.log(result);
        res.status(201).json({
        message: 'Post created successfully!',
        post: result
       });
    })
    //Create post in db
    .catch(err => {
        console.log(err);
    });
};