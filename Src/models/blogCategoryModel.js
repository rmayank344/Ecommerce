const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var blogCategorySchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
}, { timestamps: true});

//Export the model
const BlogCategory = new mongoose.model("BlogCategory", blogCategorySchema);
module.exports =  BlogCategory;