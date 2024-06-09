const Address = require("../models/addressModel");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const mongoose = require("mongoose");

const createAddress = asyncHandler(async(req,res) => {
    const id = req.user.id;
    let saveAddress;
    try{
        const user = await User.findById(id);
        if(!user) throw new Error("Pls first sign in.");
        console.log(user);
        console.log(user.address.length);
        
        if(user.address.length === 1){
            const newAddress = await Address.create(req.body);
            const new_Id =  new mongoose.Types.ObjectId(newAddress._id);
            saveAddress = await User.findByIdAndUpdate(id,
                {
                    $push: { address : new_Id},
                },
                { new: true},
            );
        }
        // let alreadyAddress = user.address.find( (id) =>  id.toString() === )
        console.log(user);
        res.json(saveAddress);
    }
    catch(err){
        return res.status(404).json({
            status:"Error in Create Address",
            message: err.message,
        });
    }
});

module.exports = {createAddress};