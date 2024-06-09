const mongoose = require('mongoose'); // Erase if already required
const crypto = require("crypto");

// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:true,
        unique:true,
    },
    isBlock: {
        type:Boolean,
        default: false,
    },
    role:{
        type: String,
        enum: ["admin","user"],
        default: "user",
    },
    cart:{
        type: Array,
        default: [],
    },
    address: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address"}],
    wishlist:[{ type: mongoose.Schema.Types.ObjectId, ref: "Product"}],
    password:{
        type:String,
        required:true,
        select: false,
    },
    refreshToken: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true,
        //Select means user is active will not shown in terminal
        select: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
}, {timestamps: true});

//Query Middleware for those are active user (true) will shown on postman or terminal as OUTPT
userSchema.pre(/^find/, function(next) {
    // This points to the current query
    this.find({ active: true});
    next();
});

//Changed passwordCreatedAt time when user reset their password or update their password
userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

//Function to check the user has changed their password after the token issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changeTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(changeTimestamp, JWTTimestamp);
        console.log(JWTTimestamp < changeTimestamp);
        return JWTTimestamp < changeTimestamp;
    }
    //False means password not changed
    return false;
};

// Generate ResetToken
userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // console.log({resetToken}, this.passwordResetToken);
    console.log(`Reset:${resetToken} and PasswordResetToken:${this.passwordResetToken}`);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

//Export the model
const User = new mongoose.model("User",userSchema);
module.exports = User;