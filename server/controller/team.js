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

// Yeni takım oluştur
const CreateTeam = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user.id;
        
        // Takım adı kontrolü
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: "Takım adı gereklidir" });
        }
        
        // Yeni takım oluştur
        const newTeam = new TeamDB({
            name,
            description: description || '',
            leader: userId,
            members: [userId] // Lider aynı zamanda üye olarak da eklenir
        });
        
        // Takımı kaydet
        const savedTeam = await newTeam.save();
        
        res.status(201).json(savedTeam);
    } catch (error) {
        console.error("Takım oluşturma hatası:", error);
        res.status(500).json({ error: "Takım oluşturulurken bir hata oluştu" });
    }
};

// Takımı sil
const DeleteTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
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
        
        // İlgili tüm verileri silmek için diğer modelleri import et
        const MessageDB = require("../model/message");
        const AdvertDB = require("../model/advert");
        const NotificationDB = require("../model/notification");
        const TeamAppealDB = require("../model/teamAppeal");
        
        // Takıma ait tüm mesajları sil
        await MessageDB.deleteMany({ teamId });
        
        // Takıma ait tüm ilanları bul
        const adverts = await AdvertDB.find({ teamId });
        const advertIds = adverts.map(advert => advert._id);
        
        // İlanlara ait tüm başvuruları sil
        await TeamAppealDB.deleteMany({ advertId: { $in: advertIds } });
        
        // Takıma ait tüm ilanları sil
        await AdvertDB.deleteMany({ teamId });
        
        // Takıma ait tüm bildirimleri sil
        await NotificationDB.deleteMany({ teamId });
        
        // Takımı sil
        await TeamDB.findByIdAndDelete(teamId);
        
        res.status(200).json({ message: "Takım ve ilgili tüm veriler başarıyla silindi" });
    } catch (error) {
        console.error("Takım silme hatası:", error);
        res.status(500).json({ error: "Takım silinirken bir hata oluştu" });
    }
};

module.exports = { GetTeams, GetMyTeams, GetMyLeds, GetTeamById, GetTeamMembers, RemoveTeamMember, CreateTeam, DeleteTeam };