const express = require("express");
const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
} = require("../controllers/signController");


const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);
router.post("/forgotpassword", forgotPassword);
router.post("/reset-password", resetPassword);


module.exports = router;