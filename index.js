// console.log("i am in express project")
const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
//const errorHandler = require("./middleware/errorHandler");
const port = process.env.PORT || 5000;
app.use(express.json());

const connectToMongo = require("./conflig/db");
connectToMongo();



app.use("/api/users", require("./routes/signRoutes"));
//app.use(errorHandler);
//app.use("/api/signin", require("./routes/signRoutes"))



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});