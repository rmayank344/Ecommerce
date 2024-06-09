const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validateMongoDbId } = require("../utils/validateMongodbId");
const mongoose = require("mongoose");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const uniqid = require("uniqid");

const hashedPassword = async (user) => {
    const saltRounds = 10;
    const password = await bcrypt.hash(user, saltRounds);
    return password;
};

const signToken = id => {
    return jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn: "1d" });
};

const createToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    console.log(token);

    const cookieOption = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        secure: true,
        httpOnly: true,
    };
    //send the token in cookie
    res.cookie("jwt", token, cookieOption);

    // Remove the password from Output
    user.password = undefined;

    return res.status(statusCode).json({
        status: "Login successful",
        Jwt: token,
        Data: { user },
    });
};

const filterObj = (obj, ...allowFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

const registerUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email });
    if (!findUser) {
        // var newUser = await User.create({
        //     firstname: req.body.firstname,
        //     lastname: req.body.lastname,
        //     email: req.body.email,
        //     mobile: req.body.mobile,
        //     role: req.body.role,
        //     active: req.body.active,
        //     cart: req.body.cart,
        //     address: req.body.address,
        //     wishlisht: req.body.wishlisht,
        //     password: req.body.password,
        // });
        var newUser = await User.create(req.body);
        const hashPass = await hashedPassword(newUser.password);
        newUser.password = hashPass;
        var userdata = await newUser.save();
    }
    else {
        throw new Error('Email already exists');
    }
    return res.status(201).json({
        status: "Success",
        message: "Registered successfully",
        data: { userdata },
    });
});

const loginUser = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) throw new Error("Enter email or password");
        const user = await User.findOne({ email }).select('+password');
        if (!user) throw new Error("User not found");
        const checkPassword = await bcrypt.compare(password, user.password);
        if (!checkPassword) throw new Error("Invalid email or password");
        //Create JWT Token
        const token = createToken(user, 201, res);
    }
    catch (err) {
        return res.status(500).json({
            status: "User Login Failed",
            message: err.message,
        });
    }
});

//Admin Login
const loginAdmin = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) throw new Error("Enter email or password");
        const findAdmin = await User.findOne({ email }).select('+password');
        if (!findAdmin) throw new Error("User not found");
        if (findAdmin.role !== "admin") throw new Error("You must be an admin to access this page");
        const checkPassword = await bcrypt.compare(password, findAdmin.password);
        if (!checkPassword) throw new Error("Invalid email or password");
        //Create JWT Token
        const token = createToken(findAdmin, 201, res);
    }
    catch (err) {
        return res.status(500).json({
            status: "Admin Login Failed",
            message: err.message,
        });
    }
});

const getAllUser = asyncHandler(async (req, res) => {
    try {
        const allUser = await User.find();
        return res.status(201).json({
            status: "Success",
            Data: { allUser },
        });
    }
    catch (err) {
        return res.status(404).json({
            status: "Can't get All User",
            message: err.message,
        });
    };
});

const getUser = asyncHandler(async (req, res) => {
    try {
        const allUser = await User.findById(req.params.id).populate("address");
        return res.status(201).json({
            status: "Success",
            Data: { allUser },
        });
    }
    catch (err) {
        return res.status(404).json({
            status: "Can't get All User",
            message: err.message,
        });
    };
});

const updateUser = asyncHandler(async (req, res) => {
    try {
        // 1. Create Error if user update password data
        if (req.body.password) {
            throw new Error("This route is not for passowrd update.");
        }

        // 2. Filter out unwanted fields name that are not allowed to be updated
        const filterBody = filterObj(req.body, 'firstname', 'lastname', 'email', 'mobile');

        // 3. Update user Document
        const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
            new: true,
            runValidators: true
        });
        return res.status(201).json({
            status: 'success',
            data: { updateUser },
        });
    }
    catch (err) {
        return res.status(404).json({
            status: "Can't update User",
            message: err.message,
        });
    }
});

const saveUserAddress = asyncHandler(async (req, res) => {
    const id = req.user.id;
    try {
        const user = await User.findById(id);
    }
    catch (err) {
        return res.status(404).json({
            status: "Can't Save User Address",
            message: err.message,
        });
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    try {
        const deleteUser = await User.findByIdAndUpdate(req.user.id, { active: false });
        return res.status(201).json({
            status: "User Deactivated",
            Data: { deleteUser },
        });
    }
    catch (err) {
        return res.status(404).json({
            status: "Can't delete User",
            message: err.message,
        });
    }
});

const blockuser = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user);
        console.log(user);
        if (user.isBlock === true) {
            user.isBlock = false;
            await user.save();
            return res.status(201).json({
                status: "User UnBlocked updated",
                Data: { user },
            });
        }
        else {
            user.isBlock = true;
            await user.save();
            return res.status(201).json({
                status: "User Blocked updated",
                Data: { user },
            })
        }
    }
    catch (err) {
        return res.status(404).json({
            status: "User Block not performed",
            message: err.message,
        });
    }
});

const getUserWishlist = asyncHandler(async (req, res) => {
    const id = req.user.id;
    try {
        const getUser = await User.findById(id).populate("wishlist");
        console.log(getUser.wishlist);
        res.json(getUser);
    }
    catch (err) {
        return res.status(404).json({
            status: "Error in Get User Wishlist",
            message: err.message,
        });
    }
});

const updatePassword = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+password');
        console.log(`Phle user:${user}`);
        if (!user) throw new Error("User not found for update password");
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) throw new Error("Please enter old password and new password");
        const oldPass = await bcrypt.compare(oldPassword, user.password);
        if (oldPass) {
            const hashPass = await hashedPassword(newPassword);
            user.password = hashPass;
            var userdata = await user.save();
            //Create JWT Token
            const token = createToken(userdata, 201, res);
            console.log(`Baad user:${userdata}`);
        }
        else throw new Error("Oldpassword does not match.");
    }
    catch (err) {
        return res.status(404).json({
            status: "Some error in Update Password",
            message: err.message,
        });
    }
});

const logOutUser = asyncHandler(async (req, res) => {
    try {
        // const user = await User.findById(req.user);
        const cookie = req.cookies;
        console.log(`BeforeCookie: ${cookie}`);
        if (!cookie.jwt) throw new Error("No Token in Cookies");
        const token = cookie.jwt;
        console.log(`Token: ${token}`);
        const user = await User.findOne(req.user);
        console.log(user);
        if (!user) {
            console.log("123");
            // res.clearCookie("token", {
            //     httpOnly: true,
            //     secure: true,
            // });
            return res.status(204).json("No User logged in");
        }
        console.log("456");
        const updateToken = await User.findOneAndUpdate({
            jwt: "",
        });
        console.log(`Updated token: ${updateToken}`);
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
        });
        return res.status(204).send("Pta nhi hai");
    }
    catch (err) {
        return res.status(404).json({
            status: "User logged out failed",
            message: err.message,
        });
    }
});

const userCart = asyncHandler(async (req, res) => {
    const { cart } = req.body;
    const id = req.user.id;
    try {
        let products = [];
        let newCart;
        let cartTotal = 0;
        const user = await User.findById(id);
        // console.log(`User: ${user}`);
        //Check User already have product in cart
        const alreadyCart = await Cart.findOne({ orderBy: user.id });
        // console.log(alreadyCart);
        if (alreadyCart) {
            cartTotal = alreadyCart.cartTotal;
            console.log(cartTotal);
            console.log("123");
            for (let i = 0; i < cart.length; i++) {
                let object = {};
                object.product = cart[i].id;
                object.count = cart[i].count;
                object.color = cart[i].color;
                let getPrice = await Product.findById(cart[i].id).select("+price").exec();
                object.price = getPrice.price;
                cartTotal += getPrice.price * cart[i].count;
                products.push(object);
                // const prod_Id =  new mongoose.Types.ObjectId(cart[i]);
                // console.log(alreadyCart.products[i]);
                alreadyCart.products.push(object);
                await alreadyCart.save();
            }
            const x = await Cart.updateOne({cartTotal});
            console.log(cartTotal);
            res.json(alreadyCart);
        }
        else {
            for (let i = 0; i < cart.length; i++) {
                let object = {};
                object.product = cart[i].id;
                object.count = cart[i].count;
                object.color = cart[i].color;
                let getPrice = await Product.findById(cart[i].id).select("+price").exec();
                object.price = getPrice.price;
                products.push(object);
            }
            for (let i = 0; i < products.length; i++) {
                cartTotal += products[i].price * products[i].count;
            }
            // console.log(products);
             newCart = await new Cart({
                products,
                cartTotal,
                orderBy: user.id,
            }).save();
        }
        res.json(newCart);
    }
    catch (err) {
        return res.status(404).json({
            status: "Add Product to cart failed",
            message: err.message,
        });
    }
});

const getUserCart = asyncHandler(async (req, res) => {
    const id = req.user;
    try {
        const getCart = await Cart.findOne({ orderBy: id }).populate("products.product");
        res.json(getCart);
    }
    catch (err) {
        return res.status(404).json({
            status: "Get Cart Product to failed",
            message: err.message,
        });
    }
});

const emptyCart = asyncHandler(async (req, res) => {
    const id = req.user.id;
    try {
        const user = await User.findById(id);
        console.log(user);
        const user_Id = new mongoose.Types.ObjectId(user._id);
        const cart = await Cart.findOneAndRemove({ orderBy: user_Id });
        res.json(cart);
    }
    catch (err) {
        return res.status(404).json({
            status: "Get Cart Product to failed",
            message: err.message,
        });
    }
});

const applyCoupon = asyncHandler(async (req, res) => {
    try {
        const id = req.user.id;
        const { coupon } = req.body;
        const validCoupon = await Coupon.findOne({ name: coupon });
        if (validCoupon === null) throw new Error("Invalid Coupon");
        const user = await User.findById(id);
        const user_Id = new mongoose.Types.ObjectId(user._id);
        console.log(user_Id);
        let { products, cartTotal } = await Cart.findOne({ orderBy: user_Id }).populate("products.product");
        console.log(cartTotal);
        let totalAfterDiscount = cartTotal - validCoupon.discount;
        const updatedCart = await Cart.findOneAndUpdate({ orderBy: user_Id }, { totalAfterDiscount }, { new: true });
        res.json({ updatedCart, totalAfterDiscount });
    }
    catch (err) {
        return res.status(404).json({
            status: "Apply Coupon failed",
            message: err.message,
        });
    }
});

const createOrder = asyncHandler(async (req, res) => {
    const id = req.user.id;
    try {
        const { COD, couponApplied } = req.body;
        if (!COD) throw new Error("Cash order failed");
        const user = await User.findById(id);
        const user_Id = new mongoose.Types.ObjectId(user._id);
        const userCart = await Cart.findOne({ orderBy: user_Id });
        let finalAmount = 0;
        if (couponApplied && userCart.totalAfterDiscount) {
            finalAmount = userCart.totalAfterDiscount;
        }
        else {
            finalAmount = userCart.cartTotal;
        }
        let newOrder = await new Order({
            products: userCart.products,
            paymentIntent: {
                id: uniqid(),
                method: "COD",
                amount: finalAmount,
                status: "Cash On Delivery",
                created: Date.now(),
                currency: "INR Rs",
            },
            orderBy: user_Id,
            orderStatus: "Cash On Delivery",
        }).save();
        let update = userCart.products.map((item) => {
            const product_Id = new mongoose.Types.ObjectId(item.product._id);
            return {
                updateOne: {
                    filter: { id: item.product._id },
                    update: { $inc: { quantity: -item.count, sold: +item.count } },
                }
            }
        });
        console.log(update);
        const updated = await Product.bulkWrite(update, {});
        res.json({
            status: "Success",
            Data: updated
        });
    }
    catch (err) {
        return res.status(404).json({
            status: "Create Order failed",
            message: err.message,
        });
    }
});

module.exports = {
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
};