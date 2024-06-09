const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");
const mongoose = require("mongoose");

const createBlog = asyncHandler(async (req, res) => {
    try {
        const newBlog = await Blog.create(req.body);
        return res.status(201).json({
            status: "Blog created",
            Data: { newBlog },
        });
    }
    catch (err) {
        return res.status(404).json({
            status: "Error in creating Blog",
            message: err.message,
        });
    }
});

const updateBlog = asyncHandler(async (req, res) => {
    try {
        const update = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return res.status(201).json({
            status: "success",
            Data: { update },
        });
    }
    catch (err) {
        return res.status(404).json({
            status: "Error in updating",
            message: err.message,
        });
    }
});

const getAllBlog = asyncHandler(async (req, res) => {
    try {
        const getAll = await Blog.find();
        return res.status(201).json({
            status: "success",
            Data: { getAll },
        });
    }
    catch (err) {
        return res.status(404).json({
            status: "Error in Get All Blog",
            message: err.message,
        });
    }
});

const getBlog = asyncHandler(async (req, res) => {
    try {
        const getBlog = await Blog.findById(req.params.id)
        .populate("likes")
        .populate("Dislikes");
        const ViewsGetBlog = await Blog.findByIdAndUpdate(req.params.id,
            {
                $inc: { numViews: 1 },
            },
            { new: true });
        await getBlog.save();
        return res.status(201).json({
            status: "success",
            Data: { getBlog },
        });
    }
    catch (err) {
        return res.status(404).json({
            status: "Error in Get Single Blog",
            message: err.message,
        });
    }
});

const deleteBlog = asyncHandler(async (req, res) => {
    try {
        const deleteBlog = await Blog.findByIdAndDelete(req.params.id);
        return res.status(201).json({
            status: "success",
            Data: { deleteBlog },
        });
    }
    catch (err) {
        return res.status(404).json({
            status: "Error in DeleteBlog",
            message: err.message,
        });
    }
});

const likeBlog = asyncHandler(async (req, res) => {
    try {
        const { blogId } = req.body;
        const blog = await Blog.findById(blogId);
        console.log(blog);
        if (!blog) throw new Error("Blog not found");
        const loginUserId = await User.findById(req.user.id);
        if (!loginUserId) throw new Error("Invalid User can't like/dislike blog");

        //Find if the user has liked the post
        const isLiked = blog.isLiked;
        console.log(`Isliked: ${isLiked}`);
        //Find if the user has disliked the post
            const user_Id =  new mongoose.Types.ObjectId(loginUserId);
            const alreadyDisLiked = blog.Dislikes.find(
            (userId) => userId.toString() === user_Id.toString()
        );
        console.log(`AlreadyDislikes: ${alreadyDisLiked}`);
        if (alreadyDisLiked) {
            const blog = await Blog.findByIdAndUpdate(blogId,
                {
                    $pull: { Dislikes: user_Id },
                    isDisliked: false,
                },
                { new: true },
            );
            console.log(`Before Return alreadyDisLiked in if: ${isLiked}`);
            //  res.json(blog);
        }
        
        if (isLiked) {
            // const user_Id =  new mongoose.Types.ObjectId(loginUserId);
            const blog = await Blog.findByIdAndUpdate(blogId,
                {
                    $pull: { likes: user_Id },
                    isLiked: false,
                },
                { new: true },
            );
            console.log(`Before Return Isliked in if: ${isLiked}`);
             res.json(blog);
        }
        else {
            const blog = await Blog.findByIdAndUpdate(blogId,
                {
                    $push: { likes: loginUserId },
                    isLiked: true,
                },
                { new: true },
            );
            console.log(`Before Return Isliked in else: ${isLiked}`);
             res.json(blog);
        }

    }
    catch (err) {
        return res.status(404).json({
            status: "Error in Like Blog",
            message: err.message,
        });
    }
});

const dislikeBlog = asyncHandler(async (req, res) => {
    try {
        const { blogId } = req.body;
        const blog = await Blog.findById(blogId);
        console.log(blog);
        if (!blog) throw new Error("Blog not found");
        const loginUserId = await User.findById(req.user.id);
        if (!loginUserId) throw new Error("Invalid User can't like/dislike blog");

        //Find if the user has disliked the post
        const isDisliked = blog.isDisliked;
        console.log(`IsDisliked: ${isDisliked}`);
        //Find if the user has liked the post
            const user_Id =  new mongoose.Types.ObjectId(loginUserId);
            const alreadyLiked = blog.likes.find(
            (userId) => userId.toString() === user_Id.toString()
        );
        console.log(`Alreadylikes: ${alreadyLiked}`);
        if (alreadyLiked) {
            const blog = await Blog.findByIdAndUpdate(blogId,
                {
                    $pull: { likes: user_Id },
                    isLiked: false,
                },
                { new: true },
            );
            console.log(`Before Return alreadyLiked in if: ${isDisliked}`);
            //  res.json(blog);
            //  return;
        }
        
    
        if (isDisliked) {
            const blog = await Blog.findByIdAndUpdate(blogId,
                {
                    $pull: { Dislikes: user_Id },
                    isDisliked: false,
                },
                { new: true },
            );
             res.json(blog);
        }
        
        else {
            const blog = await Blog.findByIdAndUpdate(blogId,
                {
                    $push: { Dislikes: loginUserId },
                    isDisliked: true,
                },
                { new: true },
            );
            console.log(`Before Return Isliked in else: ${isDisliked}`);
             res.json(blog);
        }

    }
    catch (err) {
        return res.status(404).json({
            status: "Error in Like Blog",
            message: err.message,
        });
    }
});

module.exports = { createBlog, updateBlog, getAllBlog, getBlog, deleteBlog, likeBlog, dislikeBlog };