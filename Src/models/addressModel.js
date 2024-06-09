const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
const addressSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    Pincode:{
        type:Number,
        required:true,
    },
    Mobile:{
        type:String,
        required:true,
        unique:true,
    },
    State:{
        type:String,
        required:true,
    },
    City: {
        type: String,
        require: true,
    },
    House_No: {
        type: String,
        require: true,
    },
    Area_Colony:{
        type: String,
        required:true,
    },
    Type_of_Address:{
        type: String,
        enum: ["Home", "Work"],
    }
});

//Export the model
const Address = new mongoose.model("Address",addressSchema);
module.exports = Address;