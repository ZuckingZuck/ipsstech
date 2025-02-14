const mongoose = require("mongoose");

const AdvertSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    fields: {
        type: [String], // Array yerine doğrudan String dizisi olarak tanımladık
        required: true
    },
    skills: {
        type: [String], // Array yerine doğrudan String dizisi olarak tanımladık
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId, // Kullanıcının ID'sini sakla
        ref: "users",
        required: true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId, // Takımın ID'sini sakla
        ref: "teams",
        required: true
    },
    visible: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("adverts", AdvertSchema);
