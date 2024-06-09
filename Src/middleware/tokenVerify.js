const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const signToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn: "1d" });
};

const createToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOption = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        secure: true,
        httpOnly: true,
    };
    //send the token in cookie
    res.cookie("jwt", token, cookieOption);

    //Remove the passwords from the Output
    user.password = undefined;
    return res.status(statusCode).json({
        status: "Login successful",
        Jwt: token,
        Data: { user },
    });
};

const authentication = asyncHandler(async (req, res, next) => {
    try {
        let token;
        let verifyUser;

        // 1. Getting Token and Check it's there
        if (req.headers.token && req.headers.token.startsWith("Bearer")) {
            token = req.headers.token.split(' ')[1];

            // 2. Verify Token     
            verifyUser = await jwt.verify(token, process.env.SECRET_KEY);
            console.log(verifyUser);
        }
        if (!token) throw new Error("Please enter a token to access.");

        //3. Check if the user still exists
        const currentUser = await User.findById(verifyUser.id);
        if (!currentUser) throw new Error(" User Belonging to this token no longer exists");

        //4. Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter(verifyUser.iat)) {
            throw new Error("You updated your password! Please login again");
        }
        req.user = currentUser;
        next();
    }
    catch (err) {
        return res.status(404).json({
            status: "Authentication Fail",
            message: err.message,
        });
    }
});

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new Error("You do not have permission to perform this action.");
        }
        next();
    };
};

const forgotPassword = asyncHandler(async (req, res, next) => {
    let user;
    try {
        console.log("1234");
        // 1. Get user based on posted email
        user = await User.findOne({ email: req.body.email });
        if (!user) throw new Error("User not found");

        //2. Generate the random reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        //3. Send it to user's email
        const resetURL = `${req.protocol}://${req.get('host')}/api/user/reset-password/${resetToken}`;
        const message = `Forgot your password? Submit a PATCH request with your new password: ${resetURL}.\nIf you didn't forgot your password. Please ignore this email`;

        return res.status(201).json({
            status: "Token Created successfully",
            Url: { resetURL, message },
        });
        // next();
    }
    catch (err) {
        // user.passwordResetToken = undefined;
        // user.passwordResetExpires = undefined;
        // await user.save({ validateBeforeSave: false });
        throw new Error("There was an error sending token on the email.");
    }
});

const resetPassword = asyncHandler(async (req, res, next) => {
    try {
        const { passX } = req.body;

        // 1. Get User based on the token
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        console.log(`Req.params.token:${req.params.token}`);
        console.log(`hashedToken:${hashedToken}`);
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });
        console.log(`UserYe: ${user}`);
        // 2. If token not expired and there is user, set the new password
        if (!user) throw new Error("Token is expired.");
        console.log(`UserReset: ${user}`);
        if (passX) {
            const hashedPassword = await bcrypt.hash(passX, 10);
            user.password = hashedPassword;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
        }
        else throw new Error("Enter new password.");

        // 3. Log the user in, Send JWT
        const token = createToken(user, 201, res);
    }
    catch (err) {
        return res.status(404).json({
            status: "Fail HashedToken",
            message: err.message,
        });
    };
});

module.exports = { authentication, restrictTo, forgotPassword, resetPassword };