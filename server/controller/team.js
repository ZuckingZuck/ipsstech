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

module.exports = { GetTeams }