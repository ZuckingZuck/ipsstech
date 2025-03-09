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

// Belirli bir takımın detaylarını getir
const GetTeamById = async (req, res) => {
    try {
        const { teamId } = req.params;
        const userId = req.user.id;
        
        const team = await TeamDB.findById(teamId)
            .populate("leader", "name surname email")
            .populate("members", "name surname email");
        
        if (!team) {
            return res.status(404).json({ error: "Takım bulunamadı" });
        }
        
        // Kullanıcının takımın üyesi olup olmadığını kontrol et
        const isLeader = team.leader._id.toString() === userId;
        const isMember = team.members.some(member => member._id.toString() === userId);
        
        if (!isLeader && !isMember) {
            return res.status(403).json({ error: "Bu takımın bilgilerini görüntüleme yetkiniz yok" });
        }
        
        res.status(200).json(team);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Takım bilgilerini getirirken hata oluştu" });
    }
};

// Takım üyelerini getir
const GetTeamMembers = async (req, res) => {
    try {
        const { teamId } = req.params;
        const userId = req.user.id;
        
        const team = await TeamDB.findById(teamId)
            .populate("leader", "name surname email")
            .populate("members", "name surname email");
        
        if (!team) {
            return res.status(404).json({ error: "Takım bulunamadı" });
        }
        
        // Kullanıcının takımın üyesi olup olmadığını kontrol et
        const isLeader = team.leader._id.toString() === userId;
        const isMember = team.members.some(member => member._id.toString() === userId);
        
        if (!isLeader && !isMember) {
            return res.status(403).json({ error: "Bu takımın üyelerini görüntüleme yetkiniz yok" });
        }
        
        // Tüm üyeleri birleştir (lider + üyeler)
        const allMembers = [team.leader, ...team.members];
        
        // Tekrarlanan üyeleri kaldır
        const uniqueMembers = Array.from(new Map(allMembers.map(member => [member._id.toString(), member])).values());
        
        res.status(200).json(uniqueMembers);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Takım üyelerini getirirken hata oluştu" });
    }
};

module.exports = { GetTeams, GetMyTeams, GetMyLeds, GetTeamById, GetTeamMembers }