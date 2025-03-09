const AdvertDB = require("../model/advert");
const TeamDB = require("../model/team");
const TeamAppealDB = require("../model/teamAppeal");
const UserDB = require("../model/user");
const NotificationDB = require("../model/notification");

const AddAdvert = async (req, res) => {
    console.log("istek geldi");
    try {
        const user = req.user;
        const advert = req.body;
        
        let teamId;
        
        // Eğer teamId gönderilmişse, bu takımı kullan
        if (advert.teamId) {
            // Takımın var olup olmadığını kontrol et
            const team = await TeamDB.findById(advert.teamId);
            if (!team) {
                return res.status(404).json({ error: "Takım bulunamadı" });
            }
            
            // Kullanıcının takım lideri olup olmadığını kontrol et
            if (team.leader.toString() !== user._id.toString()) {
                return res.status(403).json({ error: "Bu takım için ilan oluşturma yetkiniz yok" });
            }
            
            teamId = team._id;
        } else {
            // Yeni bir takım oluştur
            const newTeam = new TeamDB({ 
                name: `${user.name}'s Team`, 
                leader: user._id,
                members: [user._id] // Lideri üye olarak da ekle
            });
            await newTeam.save();
            teamId = newTeam._id;
        }

        // Yeni bir ilan oluştur
        const newAdvert = new AdvertDB({
            title: advert.title,
            description: advert.description,
            fields: advert.fields,
            skills: advert.skills,
            owner: user._id,
            teamId: teamId,
        });

        await newAdvert.save();

        res.status(200).json(newAdvert);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
};


const GetAdverts = async (req, res) => {
    try {
        const adverts = await AdvertDB.find().populate("owner", "name surname").populate("teamId", "name");
        res.status(200).json(adverts);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

const GetAdvertDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const advert = await AdvertDB.findOne({_id: id}).populate("owner", "name surname").populate("teamId", "name");
        res.status(200).json(advert);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

const GetMyAdvertDetail = async (req, res) => {
    try {
        const id = req.params.id;
        console.log("İlan detayı isteniyor:", id);
        
        const advert = await AdvertDB.findOne({_id: id}).populate("owner", "name surname").populate("teamId", "name members");
        if (!advert) {
            return res.status(404).json({ error: "İlan bulunamadı" });
        }
        
        console.log("İlan bulundu:", advert._id);
        console.log("Takım üyeleri:", advert.teamId.members);
        
        const appeals = await TeamAppealDB.find({advertId: advert._id}).populate("applicant", "name surname email");
        
        console.log("Başvurular:", appeals.map(a => ({
            id: a._id,
            applicant: a.applicant._id,
            status: a.status
        })));
        
        res.status(200).json({advert, appeals});
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

const AppealtoAdvert = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;
        const { extra } = req.body;

        // İlanı bul
        const advert = await AdvertDB.findById(id).populate('teamId', 'name leader members');
        if (!advert) {
            return res.status(404).json({ error: "İlan bulunamadı." });
        }

        // Kullanıcının takım lideri olup olmadığını kontrol et
        if (advert.teamId.leader.toString() === user._id.toString()) {
            return res.status(409).json({ error: "Kendi takımınıza başvuru yapamazsınız." });
        }

        // Kullanıcının zaten takım üyesi olup olmadığını kontrol et
        if (advert.teamId.members && advert.teamId.members.some(member => member.toString() === user._id.toString())) {
            return res.status(409).json({ error: "Zaten bu takımın üyesisiniz." });
        }

        // Kullanıcının zaten başvurup başvurmadığını kontrol et
        const checkAppeal = await TeamAppealDB.findOne({ advertId: advert._id, applicant: user._id });
        if (checkAppeal) {
            return res.status(409).json({ error: "Zaten başvuru yapmışsınız." });
        }

        // Yeni başvuru oluştur
        const newAppeal = new TeamAppealDB({
            advertId: advert._id,
            applicant: user._id,
            extra: extra
        });

        await newAppeal.save();
        
        // Takım liderine bildirim gönder
        try {
            const teamLeaderId = advert.teamId.leader;
            
            // Kullanıcı bilgilerini al
            const applicant = await UserDB.findById(user._id);
            
            // Bildirim oluştur
            const notification = new NotificationDB({
                recipient: teamLeaderId,
                sender: user._id,
                type: 'advert_appeal',
                content: `${applicant.name} ${applicant.surname} "${advert.title}" ilanınıza başvurdu`,
                teamId: advert.teamId._id,
                data: {
                    advertId: advert._id,
                    advertTitle: advert.title,
                    teamId: advert.teamId._id,
                    teamName: advert.teamId.name,
                    appealId: newAppeal._id,
                    applicantId: user._id,
                    applicantName: `${applicant.name} ${applicant.surname}`
                }
            });
            
            await notification.save();
            
            // Eğer takım lideri çevrimiçiyse, bildirim gönder
            const io = req.app.get('io');
            const connectedUsers = req.app.get('connectedUsers');
            
            if (connectedUsers.has(teamLeaderId.toString())) {
                const socketId = connectedUsers.get(teamLeaderId.toString());
                
                // Bildirimi populate et
                const populatedNotification = await NotificationDB.findById(notification._id)
                    .populate('sender', 'name surname')
                    .populate('teamId', 'name');
                
                io.to(socketId).emit('new_notification', populatedNotification);
            }
        } catch (notificationError) {
            console.error('Bildirim gönderme hatası:', notificationError);
            // Bildirim gönderme hatası başvuruyu etkilemesin
        }
        
        res.status(200).json({ message: "Başvurunuz başarıyla tamamlandı." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Sunucu hatası." });
    }
};


const ApproveAppeal = async (req, res) => {
    console.log("approve istegigeldi")
    try {
        const id = req.params.id;
        const user = req.user;

        console.log("Başvuru ID:", id);

        const appeal = await TeamAppealDB.findById(id).populate("applicant", "name surname");
        if (!appeal) {
            return res.status(404).json({ message: "Başvuru bulunamadı." });
        }

        console.log("Başvuru bulundu:", appeal);
        console.log("Başvuru sahibi:", appeal.applicant);
        console.log("Başvuru sahibi ID:", appeal.applicant._id);

        const advert = await AdvertDB.findById(appeal.advertId).populate("teamId", "name");
        if (!advert) {
            return res.status(404).json({ message: "İlan bulunamadı." });
        }

        console.log("İlan bulundu:", advert._id);
        console.log("İlan sahibi takım:", advert.teamId);

        if (user._id.toString() !== advert.owner.toString()) {
            return res.status(403).json({ message: "Bu takıma üye eklemek için yetkiniz yok." });
        }

        const team = await TeamDB.findById(advert.teamId);
        if (!team) {
            return res.status(404).json({ message: "Takım bulunamadı." });
        }

        console.log("Takım bulundu:", team._id);
        console.log("Takım üyeleri:", team.members);
        console.log("Başvuru sahibi takımda mı:", team.members.includes(appeal.applicant._id));
        
        // Başvuru sahibinin ID'sini string'e çevirip kontrol edelim
        const applicantIdStr = appeal.applicant._id.toString();
        const isAlreadyMember = team.members.some(memberId => memberId.toString() === applicantIdStr);
        
        console.log("Başvuru sahibi ID (string):", applicantIdStr);
        console.log("Başvuru sahibi zaten üye mi:", isAlreadyMember);

        if (!isAlreadyMember) {
            // Üye eklemeden önce takımı tekrar kontrol edelim
            console.log("Takım üyeleri (ekleme öncesi):", team.members);
            
            // Üyeyi ekleyelim (addMember metodunu kullanarak)
            const memberAdded = team.addMember(appeal.applicant._id);
            appeal.status = "Accepted";

            console.log("Takıma üye eklendi mi:", memberAdded);
            console.log("Güncellenmiş takım üyeleri:", team.members);

            // Değişiklikleri kaydedelim
            await appeal.save();
            await team.save();
            
            console.log("Başvuru ve takım güncellendi");

            // Başvurusu kabul edilen kullanıcıya bildirim gönder
            try {
                // Bildirim oluştur
                const notification = new NotificationDB({
                    recipient: appeal.applicant._id,
                    sender: user._id,
                    type: 'appeal_approved',
                    content: `"${advert.title}" ilanına yaptığınız başvuru kabul edildi. "${team.name}" takımına katıldınız!`,
                    teamId: team._id,
                    status: 'accepted',
                    data: {
                        teamId: team._id,
                        teamName: team.name,
                        advertId: advert._id,
                        advertTitle: advert.title,
                        senderId: user._id,
                        senderName: `${user.name} ${user.surname}`
                    }
                });
                
                await notification.save();
                
                // Eğer kullanıcı çevrimiçiyse, bildirim gönder
                const io = req.app.get('io');
                const connectedUsers = req.app.get('connectedUsers');
                
                if (connectedUsers.has(appeal.applicant._id.toString())) {
                    const socketId = connectedUsers.get(appeal.applicant._id.toString());
                    
                    // Bildirimi populate et
                    const populatedNotification = await NotificationDB.findById(notification._id)
                        .populate('sender', 'name surname')
                        .populate('teamId', 'name');
                    
                    io.to(socketId).emit('new_notification', populatedNotification);
                    io.to(socketId).emit('team_invite_accepted', {
                        teamId: team._id,
                        teamName: team.name
                    });
                }
            } catch (notificationError) {
                console.error('Bildirim gönderme hatası:', notificationError);
                // Bildirim gönderme hatası başvuru kabulünü etkilemesin
            }

            return res.status(200).json({ message: "Kullanıcının başvurusu kabul edildi." });
        } else {
            return res.status(409).json({ message: "Kullanıcı zaten takıma üye." });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Sunucu hatası", error });
    }
};


const RejectAppeal = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;

        console.log("Başvuru reddetme isteği:", id);

        const appeal = await TeamAppealDB.findById(id).populate("applicant", "name surname");
        if (!appeal) {
            return res.status(404).json({ message: "Başvuru bulunamadı." });
        }

        console.log("Reddedilecek başvuru:", appeal);

        const advert = await AdvertDB.findById(appeal.advertId).populate("teamId", "name");
        if (!advert) {
            return res.status(404).json({ message: "İlan bulunamadı." });
        }

        console.log("İlan bulundu:", advert._id);

        if (user._id.toString() !== advert.owner.toString()) {
            return res.status(403).json({ message: "Bunun için yetkiniz yok." });
        }

        appeal.status = "Rejected";
        await appeal.save();
        
        console.log("Başvuru reddedildi:", appeal._id);

        // Başvurusu reddedilen kullanıcıya bildirim gönder
        try {
            // Bildirim oluştur
            const notification = new NotificationDB({
                recipient: appeal.applicant._id,
                sender: user._id,
                type: 'appeal_rejected',
                content: `"${advert.title}" ilanına yaptığınız başvuru reddedildi.`,
                teamId: advert.teamId._id,
                status: 'rejected',
                data: {
                    teamId: advert.teamId._id,
                    teamName: advert.teamId.name,
                    advertId: advert._id,
                    advertTitle: advert.title,
                    senderId: user._id,
                    senderName: `${user.name} ${user.surname}`
                }
            });
            
            await notification.save();
            
            // Eğer kullanıcı çevrimiçiyse, bildirim gönder
            const io = req.app.get('io');
            const connectedUsers = req.app.get('connectedUsers');
            
            if (connectedUsers.has(appeal.applicant._id.toString())) {
                const socketId = connectedUsers.get(appeal.applicant._id.toString());
                
                // Bildirimi populate et
                const populatedNotification = await NotificationDB.findById(notification._id)
                    .populate('sender', 'name surname')
                    .populate('teamId', 'name');
                
                io.to(socketId).emit('new_notification', populatedNotification);
                io.to(socketId).emit('team_invite_rejected', {
                    teamId: advert.teamId._id,
                    teamName: advert.teamId.name
                });
            }
        } catch (notificationError) {
            console.error('Bildirim gönderme hatası:', notificationError);
            // Bildirim gönderme hatası başvuru reddini etkilemesin
        }

        res.status(200).json({message: "Başvuru reddedildi."})
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Sunucu hatası", error });
    }
};

const DeleteAdvert = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;

        // İlanı bul
        const advert = await AdvertDB.findById(id);
        if (!advert) {
            return res.status(404).json({ message: "İlan bulunamadı." });
        }

        // Kullanıcının ilan sahibi olup olmadığını kontrol et
        if (advert.owner.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Bu ilanı silmek için yetkiniz yok." });
        }

        // İlana ait başvuruları sil
        await TeamAppealDB.deleteMany({ advertId: advert._id });

        // İlanı sil
        await AdvertDB.findByIdAndDelete(id);

        res.status(200).json({ message: "İlan başarıyla silindi." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Sunucu hatası", error });
    }
};

module.exports = { AddAdvert, GetAdverts, GetAdvertDetail, GetMyAdvertDetail, AppealtoAdvert, ApproveAppeal, RejectAppeal, DeleteAdvert };