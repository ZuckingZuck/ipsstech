const TeamDB = require("../model/team");

const GetTeams = async (req, res) => {
    try {
        const teams = await TeamDB.find().populate("leader", "name surname email").populate("members", "name surname email");
        res.status(200).json(teams);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

const GetMyLeds = async (req, res) => {
    try {
        const userId = req.user.id;
        const myLeds = await TeamDB.find({leader: userId});
        res.status(200).json(myLeds);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

const GetMyTeams = async (req, res) => {
    try {
        const userId = req.user.id;
        const myTeams = await TeamDB.find({ members: { $in: [userId] } });
        res.status(200).json(myTeams);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Takımları getirirken hata oluştu" });
    }
};


module.exports = { GetTeams, GetMyTeams, GetMyLeds }