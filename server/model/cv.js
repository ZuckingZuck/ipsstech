const mongoose = require("mongoose");

const CvSchema = mongoose.Schema({
    ownerId: {
        type: String,
        required: true
    },
    fields: {
        type: Array,
        default: []
    },
    skills: {
        type: Array,
        default: []
    },
    extra: {
        type: String,
        default: ""
    } 
}, {timestamps: true})

module.exports = mongoose.model("cvs", CvSchema);