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

// Üye eklemeden önce kontrol et
TeamSchema.methods.addMember = function(userId) {
    const userIdStr = userId.toString();
    const isMember = this.members.some(memberId => memberId.toString() === userIdStr);
    
    if (!isMember) {
        this.members.push(userId);
        return true;
    }
    
    return false;
};

module.exports = mongoose.model("teams", TeamSchema);