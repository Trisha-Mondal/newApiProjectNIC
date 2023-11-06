const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/signModel");
require('dotenv').config();


const registerUser = async(req, res) => {
    console.log(req.body);
    const { username, email, password } = req.body;
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




module.exports = { registerUser, loginUser };