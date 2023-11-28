const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/signModel");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { MailtrapClient } = require("mailtrap");

require('dotenv').config();







/* const mailtrapConfig = {
    service: 'live.smtp.mailtrap.io',
    port: 2525,
    secure: true,
    auth: {
        user: 'mtrisha380@gmail.com',
        pass: 'maruti@$555',
    },
}; */





//const transporter = nodemailer.createTransport(mailtrapConfig);



/* (async() => {
    try {
        const info = await transporter.sendMail({
            from: "mtrisha380@gmail.com",
            to: "mtrisha580@gmail.com",
            subject: "Password Reset",
            text: "check this.."
        });
        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending test email:", error);
    }
})();
 */
const generateAccessToken = (user) => {
    console.log("generateAccessToken", generateAccessToken);
    return jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};

const sendResetEmail = (user, resetToken) => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const resetLink = `${"process.env.http://localhost:8080"}/reset-password?token=${resetToken}`;
    console.log("resetToken", resetToken)

    const mailOptions = {
        from: '"Trisha   <mtrisha380@gmail.com>"',
        to: "mtrisha580@gmail.com",
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
    //console.log("resetToken", resetToken)
    const resetTokenExpiry = Date.now() + 3600000;
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();


    sendResetEmail(user, resetToken);
    //console.log("resetToken", resetToken);
    res.status(200).json({ message: "Password reset instructions sent to your email." });
};


//reset-password

const resetPassword = async(req, res) => {
    const { email, resetToken, newPassword } = req.body;
    console.log("resetToken", resetToken);

    try {
        const user = await User.findOne({
            email,
            resetToken,
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token." });
        }


        console.log("newPassword:", newPassword);


        const hashedPassword = await bcrypt.hash(newPassword, 10);


        user.password = hashedPassword;
        user.resetToken = 1;
        user.resetTokenExpiry = 1;

        await user.save();

        res.status(200).json({ message: "Password reset successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};








module.exports = { registerUser, loginUser, forgotPassword, resetPassword };