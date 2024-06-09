const express = require('express');
const router = new express.Router();
const {
    createProduct,
    getAllProduct,
    getProduct,
    updateProduct,
    deleteProduct,
    addToWishlist,
    rating
} = require("../controller/productctrl");

const {
    authentication,
    restrictTo,
} = require("../middleware/tokenVerify");

//Create a new product
router.post("/create", createProduct);

//Get All Products
router.get("/all-product", authentication, restrictTo('admin'), getAllProduct);

//Get Single Product
router.get("/single-product/:id", authentication, getProduct);
// router.get("/single-product/:id", authentication, restrictTo('admin'), getProduct);

//Update Product
router.put("/update/:id", authentication, restrictTo('admin'), updateProduct);

//Delete product
router.delete("/delete/:id", authentication, restrictTo('admin'), deleteProduct);

//Add to Wishlist Routes
router.put("/wishlist", authentication, addToWishlist);

//Add to Wishlist Routes
router.put("/rating", authentication, rating);


module.exports= router;