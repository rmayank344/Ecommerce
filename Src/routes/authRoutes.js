const express = require('express');
const router = new express.Router();
const {authentication,restrictTo, forgotPassword, resetPassword} = require("../middleware/tokenVerify");
const {
    registerUser,
    loginUser,
    getAllUser,
    getUser,
    updateUser,
    deleteUser,
    blockuser,
    logOutUser,
    updatePassword,
    loginAdmin,
    getUserWishlist,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder
} = require("../controller/userCtrl");

//Register User
router.post("/register", registerUser);

//Login User
router.get("/login", loginUser);

//Get all users
router.get("/all-user", authentication, restrictTo('admin'), getAllUser);

//Get Single User
router.get("/get-user/:id", authentication, getUser);

//Update User
router.patch("/update/", authentication, updateUser);

//Delete User
router.delete("/delete/", authentication, deleteUser);

//Block User By Only Admin
router.put("/block-user/:id", authentication, restrictTo('admin'), blockuser);

//UnBlock User By Only Admin
router.put("/Unblock-user/:id", authentication, restrictTo('admin'), blockuser);

//Update Password
router.put("/Update-password", authentication, updatePassword);

//LogOut User
router.get("/logout",authentication, logOutUser);

//Forgor Password
router.post("/forgot-password", forgotPassword);

//Reset Password
router.patch("/reset-password/:token", resetPassword);

//Login Admin
router.get("/admin", loginAdmin);

//Get User Wishlist
router.get("/get-wishlist", authentication, getUserWishlist);

//User Cart Routes
router.get("/cart", authentication, userCart);

//Get User Cart Routes
router.get("/get-cart", authentication, getUserCart);

//Empty User Cart Routes
router.delete("/empty-cart", authentication, emptyCart);

//Apply Coupon Routes
router.post("/apply-coupon", authentication, applyCoupon);

//Create Order Routes
router.post("/create-order", authentication, createOrder);

module.exports = router;