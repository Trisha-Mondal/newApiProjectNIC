const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/signModel");
const crypto = require('crypto');
const nodemailer = require('nodemailer');

require('dotenv').config();

const generateAccessToken = (user) => {
    return jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    console.log("generateAccessToken", generateAccessToken);
};

const sendResetEmail = (user, resetToken) => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    const resetLink = `${"http://google.com"}/reset-password?token=${resetToken}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Password Reset",
        text: `Click the following link to reset your password: ${resetLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
};




const registerUser = async(req, res) => {
    console.log(req.body);
    const { username, email, password, confirmPassword } = req.body;
    if (!username || !email || !password || !confirmPassword) {
        res.status(400);
        throw new Error("All fields are mandatory!");
    }

    if (password !== confirmPassword) {
        res.status(400);
        throw new Error("Passwords do not match.");
    }





    const userAvailable = await User.findOne({ email });
    if (userAvailable) {
        res.status(401);
        throw new Error("User already registered!");
    }


    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password: ", hashedPassword);
    const user = await User.create({
        username,
        email,
        password: hashedPassword,
    });

    console.log(`User created ${user}`);
    if (user) {
        res.status(201).json({ _id: user.id, email: user.email });
    } else {
        res.status(400);
        throw new Error("User data is not valid");
    }

};


const loginUser = asyncHandler(async(req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory!");
    }
    const user = await User.findOne({ email });



    if (user && (await bcrypt.compare(password, user.password))) {
        console.log("user====", user)
        console.log("secret key === ", process.env.ACCESS_TOKEN_SECRET)
        const accessToken = jwt.sign({
                user: {
                    username: user.username,
                    email: user.email,
                    id: user.id,
                },
            },
            process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" }
        );
        res.status(200).json({ accessToken });
    } else {
        res.status(401);
        throw new Error("email or password is not valid");
    }
});

const forgotPassword = async(req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400);
        throw new Error("Email is mandatory!");
    }


    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("User not found.");
    }


    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();


    sendResetEmail(user, resetToken);

    res.status(200).json({ message: "Password reset instructions sent to your email." });
};







module.exports = { registerUser, loginUser, forgotPassword };