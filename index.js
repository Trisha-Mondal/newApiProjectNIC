// console.log("i am in express project")
const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
const { MailtrapClient } = require("mailtrap");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
//const errorHandler = require("./middleware/errorHandler");
//const port = process.env.PORT || 5000;

const port = process.env.PORT || 8080;



app.use(express.json());

const connectToMongo = require("./conflig/db");
connectToMongo();



app.use("/api/users", require("./routes/signRoutes"));
//app.use(errorHandler);
//app.use("/api/signin", require("./routes/signRoutes"))


const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "a09510a3146304",
        pass: "9c7de04b702b3e"
    }
});

const MailGenerator = new Mailgen({
    theme: "default",
    product: {
        name: "Test Email",
        link: 'https://mailgen.js/'
    }
})

app.post('/send-email', (req, res) => {
    // get the recipient's email address, name and message from the request body
    const { to, name, message } = req.body;
    // body of the email
    const email = {
        body: {
            name: "Trisha",
            intro: 'Welcome to Test Mail! We\'re very excited to have you on board.',
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
    const emailBody = MailGenerator.generate(email);
    // send mail with defined transport object
    const mailOptions = {
        from: "mtrisha380@gmail.com",
        to: "mtrisha580@gmail.com",
        subject: 'Test Email',
        html: "HELLO THIS IS TEST MAIL VIA MAILTRAP"
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.send('Email sent successfully');
        }
    });
});



/* const TOKEN = "dba021f9cef0d6016d497125b7601d48";
const ENDPOINT = "https://send.api.mailtrap.io/";

const client = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });

const sender = {
    email: "mailtrap@mtrisha380gmail.com",
    name: "Mailtrap Test",
};
const recipients = [{
    email: "mtrisha580@gmail.com",
}];

client
    .send({
        from: sender,
        to: recipients,
        subject: "You are awesome!",
        text: "Congrats for sending test email with Mailtrap!",
        category: "Integration Test",
    })
    .then(console.log, console.error); */



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});