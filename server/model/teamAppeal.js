const mongoose = require("mongoose");

const TeamAppealSchema = mongoose.Schema({
    advertId: {
        type: mongoose.Schema.Types.ObjectId, // Eğer advert bir koleksiyonla ilişkiliyse bunu kullan
        ref: "adverts",
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId, // Kullanıcının ID'sini sakla
        ref: "users",
        required: true
    },
    extra: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["Waiting", "Accepted", "Rejected"], // Status için sabit değerler belirleyebilirsin
        default: "Waiting"
    }
}, { timestamps: true });

module.exports = mongoose.model("teamappeals", TeamAppealSchema);
