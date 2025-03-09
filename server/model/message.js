const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "teams",
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }]
}, {timestamps: true})

module.exports = mongoose.model("messages", MessageSchema); 