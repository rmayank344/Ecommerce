const express = require("express");
const router = new express.Router();
const {authentication, restrictTo} = require("../middleware/tokenVerify");
const {
    createCoupon,
    getAllCoupon,
    updateCoupon,
    deleteCoupon
} = require("../controller/couponCtrl");

//Create a new coupon
router.post("/create", authentication, restrictTo("admin"), createCoupon);

//Get All coupon
router.get("/all-coupon", authentication, restrictTo("admin"), getAllCoupon);

//Update a coupon
router.put("/update/:id", authentication, restrictTo("admin"), updateCoupon);

//Delete a coupon
router.delete("/delete/:id", authentication, restrictTo("admin"), deleteCoupon);


module.exports = router;