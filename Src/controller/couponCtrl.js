const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");

const createCoupon = asyncHandler(async(req,res) => {
    try{
        const newCoupon = await Coupon.create(req.body);
        res.json(newCoupon);
    }
    catch(err){
        throw new Error(err);
    }
});

const getAllCoupon = asyncHandler(async(req,res) => {
    try{
        const getCoupon = await Coupon.find();
        res.json(getCoupon);
    }
    catch(err){
        throw new Error(err);
    }
});

const updateCoupon = asyncHandler(async(req,res) => {
    try{
        const updatedCoupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.json(updatedCoupon);
    }
    catch(err){
        throw new Error(err);
    }
});

const deleteCoupon = asyncHandler(async(req,res) => {
    try{
        const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
        res.json(deletedCoupon);
    }
    catch(err){
        throw new Error(err);
    }
});

module.exports = {createCoupon, getAllCoupon, updateCoupon, deleteCoupon};