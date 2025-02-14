const express = require("express");
const app = express();
const router = express.Router();
const mongoose = require("mongoose");
require("dotenv").config();
const db_url = process.env.DB_URL;
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 



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
