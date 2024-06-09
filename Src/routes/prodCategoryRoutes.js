const express = require("express");
const router = new express.Router();
const { authentication} = require("../middleware/tokenVerify");
const {
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory
} = require("../controller/prodCategoryCtrl");


//Create Category routes
router.post("/create", authentication, createCategory);

//Create update routes
router.put("/update/:id", authentication, updateCategory);

//Create Delete routes
router.delete("/delete/:id", authentication, deleteCategory);

//Create Get All routes
router.get("/get/", authentication, getCategory);

//Create Get routes
router.get("/get/:id", authentication, getCategory);


module.exports = router;