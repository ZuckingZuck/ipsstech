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

// Takımdan üye çıkar
const RemoveTeamMember = async (req, res) => {
    try {
        const { teamId, memberId } = req.params;
        const userId = req.user.id;
        
        // Takımı bul
        const team = await TeamDB.findById(teamId);
        
        if (!team) {
            return res.status(404).json({ error: "Takım bulunamadı" });
        }
        
        // Kullanıcının takım lideri olup olmadığını kontrol et
        if (team.leader.toString() !== userId) {
            return res.status(403).json({ error: "Bu işlemi yapmak için takım lideri olmanız gerekiyor" });
        }
        
        // Takım liderini çıkarmaya çalışıyorsa engelle
        if (team.leader.toString() === memberId) {
            return res.status(400).json({ error: "Takım lideri takımdan çıkarılamaz" });
        }
        
        // Üyenin takımda olup olmadığını kontrol et
        const memberIndex = team.members.findIndex(member => member.toString() === memberId);
        if (memberIndex === -1) {
            return res.status(404).json({ error: "Belirtilen üye takımda bulunamadı" });
        }
        
        // Üyeyi takımdan çıkar
        team.members.splice(memberIndex, 1);
        
        // Takımı güncelle
        await team.save();
        
        res.status(200).json({ 
            message: "Üye takımdan başarıyla çıkarıldı", 
            team: {
                _id: team._id,
                name: team.name,
                leader: team.leader,
                members: team.members
            } 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Üye çıkarma işlemi sırasında bir hata oluştu" });
    }
};

module.exports = { GetTeams, GetMyTeams, GetMyLeds, GetTeamById, GetTeamMembers, RemoveTeamMember }