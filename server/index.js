const express = require("express");
const app = express();
const router = express.Router();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const db_url = process.env.DB_URL;
const port = process.env.PORT || 8080;

const authRouter = require("./route/auth");
const advertRouter = require("./route/advert");
const teamRouter = require("./route/team");
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.use("/api/auth", authRouter);
app.use("/api/advert", advertRouter);
app.use("/api/team", teamRouter);


async function connectDB() {
    try {
        await mongoose.connect(db_url);
        console.log("Connected to DB");

        app.use("/", router);
        app.listen(port, () => {
            console.log("Server is running on port:", port);
        });
    } catch (error) {
        console.error("DB connection error:", error);
    }
}

connectDB();
