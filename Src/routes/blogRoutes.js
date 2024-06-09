const express = require('express');
const router = new express.Router();
const {authentication, restrictTo} = require("../middleware/tokenVerify");
const {
    createBlog,
    updateBlog,
    getAllBlog,
    getBlog,
    deleteBlog,
    likeBlog,
    dislikeBlog
} = require("../controller/blogCtrl");

// Create blog routes
router.post("/create", createBlog);

//Update blog routes
router.put("/update/:id", authentication, restrictTo('admin'), updateBlog);

//Get All Blog routes
router.get("/get-all", getAllBlog);

//Get Single Blog routes
router.get("/get-single/:id", getBlog);

//Get Delet Blog routes
router.delete("/delete/:id", authentication, restrictTo('admin'), deleteBlog);

//Likes Blog routes
router.put("/likes", authentication, likeBlog);

//DisLikes Blog routes
router.put("/dislikes", authentication, dislikeBlog);

module.exports = router;