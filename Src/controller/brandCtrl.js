const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");


const createCategory = asyncHandler(async(req, res) => {
    try{
        const newCategory = await Brand.create(req.body);
        return res.status(201).json({
            status:"Creating category",
            Data: {newCategory},
        }); 
    }
    catch(err){
        return res.status(404).json({
            status:"Error in creating category",
            message: err.message
        });
    }
});

const updateCategory = asyncHandler(async(req, res) => {
    try{
        const updatedCategory = await Brand.findByIdAndUpdate(req.params.id, req.body, {new : true});
        return res.status(201).json({
            status:"Updating category",
            Data: {updatedCategory},
        }); 
    }
    catch(err){
        return res.status(404).json({
            status:"Error in Updating category",
            message: err.message
        });
    }
});

const deleteCategory = asyncHandler(async(req, res) => {
    try{
        const deletedCategory = await Brand.findByIdAndDelete(req.params.id);
        return res.status(201).json({
            status:"Deleting category",
            Data: {deletedCategory},
        }); 
    }
    catch(err){
        return res.status(404).json({
            status:"Error in Deleting category",
            message: err.message
        });
    }
});

const getCategory = asyncHandler(async(req, res) => {
    try{
        const getAllCategory = await Brand.find({});
        const getCategory = await Brand.findById(req.params.id);
        return res.status(201).json({
            status:"Get  category",
            Data: {getAllCategory, getCategory},
        }); 
    }
    catch(err){
       status:"Error in Get category";
       throw new Error(err);
    }
});


module.exports = {createCategory, updateCategory, deleteCategory, getCategory};