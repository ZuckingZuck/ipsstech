const mongoose = require("mongoose");

const TeamSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }]    
}, {timestamps: true})

module.exports = mongoose.model("teams", TeamSchema);