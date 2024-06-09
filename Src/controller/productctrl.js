const asyncHandler = require("express-async-handler");
const UserModel = require("../models/userModel");
const Product = require("../models/productModel");
const slugify = require("slugify");
const mongoose = require("mongoose");

const createProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const productCreate = await Product.create(req.body);
        return res.status(201).json({
            status: "Product created",
            Product: { productCreate },
        });
    }
    catch (err) {
        return res.status(404).json({
            status: "Can't create product",
            message: err.message,
        });
    }
});

const getAllProduct = asyncHandler(async (req, res) => {
    try {
        // 1. Filtering products
        const queryObj = { ...req.query };
        console.log(queryObj);

        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach((el) => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        // console.log(JSON.parse(queryStr));
        let query = Product.find(JSON.parse(queryStr));

        // 2. Sorting Product
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }
        else {
            query = query.sort('-createdAt');
        }

        // 3. Limiting the Fields
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        }
        else {
            query = query.select('-__v');
        }

        // 4. Pagination
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        if (req.query.page) {
            const productCount = await Product.countDocuments();
            if (skip >= productCount) throw new Error("This Page is not available");
        }
        const product = await query;
        // const regex = new  RegExp("Apple" , "i");
        // const regexProduct = Product.find({title : regex});
        // console.log("regex" , regexProduct);
        // const allProduct = await Product.find();
        return res.status(201).json({
            status: "Here All Product",
            Total_Product: product.length,
            // Product: { product },
            product,
        });
    }
    catch (err) {
        return res.status(404).json({
            status: "Can't get all products",
            message: err.message,
        });
    }
});

const getProduct = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        return res.status(201).json({
            status: "Product",
            Product: { product },
        });
    }
    catch (err) {
        return res.status(404).json({
            status: "Can't get all products",
            message: err.message,
        });
    }
});

const updateProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, }
        );
        if (!product) throw new Error("Product not found.");
        return res.status(201).json({
            status: "Product Updated",
            Product: { product },
        });
    }
    catch (err) {
        return res.status(404).json({
            status: "Can't Update products",
            message: err.message,
        });
    }
});

const deleteProduct = asyncHandler(async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) throw new Error("Product not found.");
        return res.status(201).json({
            status: "Product Deleted",
            Product: { product },
        });
    }
    catch (err) {
        return res.status(404).json({
            status: "Can't Delete products",
            message: err.message,
        });
    }
});

const addToWishlist = asyncHandler(async (req, res) => {
    const id = req.user.id;
    const {productId} = req.body;
    try {
        const user = await UserModel.findById(id);
        if(!user) throw new Error("User not found to add to wishlist");
        const prod_Id =  new mongoose.Types.ObjectId(productId);
        const alreadyAdded = user.wishlist.find( (id) => id.toString() === prod_Id.toString() );
        if(alreadyAdded){
            let user = await UserModel.findByIdAndUpdate(id,
                {
                    $pull: { wishlist: prod_Id},
                },
                { new: true },
            );
            console.log(`User in If: ${user}`);
            res.json(user);
        }
        else{
            let user = await UserModel.findByIdAndUpdate(id,
                {
                    $push: { wishlist: prod_Id},
                },
                { new: true },
            );
            console.log(`User in Else: ${user}`);
            res.json(user);
        }
    }
    catch (err) {
        return res.status(404).json({
            status: "Error in Add to cart products",
            message: err.message,
        });
    }
});

const rating = asyncHandler(async(req, res) => {
    const id = req.user.id;
    const { stars, productId, comments} = req.body;
    try{
        const user_Id =  new mongoose.Types.ObjectId(id);
        const product = await Product.findById(productId);
        let alreadyRated = product.ratings.find( (id) => id.postedBy.toString() === user_Id.toString() );
        if( alreadyRated){
            console.log("123");
            const updateRating = await Product.updateOne(
                {
                   ratings: { $elemMatch: alreadyRated},
                },
                {
                    $set: {"ratings.$.star": stars, "ratings.$.comment": comments},
                },
                { new: true},
            );
        }
        else{
            console.log("456");
            const rateProduct = await Product.findByIdAndUpdate(productId,
                {
                    $push: {
                        ratings: {
                            star: stars,
                            comment: comments,
                            postedBy: user_Id,
                        },
                    },
                },
                { new: true},
            );
        }
        const getAllRating = await Product.findById(productId);
        let totalLength = getAllRating.ratings.length;
        let sum=0;
        for( let i=0; i<totalLength; i++){
            sum += getAllRating.ratings[i].star;
        }
        let actualRating = (sum / totalLength);
        console.log(`Total Rating Sum: ${sum}`);
        let finalProduct = await Product.findByIdAndUpdate(productId,
            {
                totalratings: actualRating,
            },
            { new: true},
        );
        res.json(finalProduct);
    }
    catch(err) {
        return res.status(404).json({
            status: "Error in Rating Products",
            message: err.message,
        });
    };
});

module.exports = { createProduct, getAllProduct, getProduct, updateProduct, deleteProduct, addToWishlist, rating };