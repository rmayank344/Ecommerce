const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        unique:true,
        trim: true,
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
    },
    description:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    category:{
        type: String,
        // ref: "category",
        required:true,
    },
    brand: {
        type: String,
        // enum: ["Apple", "Amazon", "Google", "Microsoft", "Facebook", "Flipkart"],
        required: true
    },
    quantity:{
        type:Number,
        required:true,
        // select:false,
    },
    sold:{
        type:Number,
        default:0,
        // select:false,
    },
    images:{
        type: Array
    },
    color:{
        type: String,
        // enum:["Black", "Brown", "White"],
        required:true,
    },
    ratings:[
        {
            star: Number,
            comment: {types: String},
            postedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref:"User",
            },
        }
    ],
    totalratings: {
        type: String,
        default: 0,
    },
}, { timestamps: true });

//Export the model
const Product = new mongoose.model("Product", productSchema);

// const regexProduct =  Product.findOne({ title : { $regex: "Apple"}});
        // console.log(`Regex: ${regexProduct}`);
module.exports = Product;