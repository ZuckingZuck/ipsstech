const MessageDB = require("../model/message");
const TeamDB = require("../model/team");

// Takıma ait tüm mesajları getir
const GetTeamMessages = async (req, res) => {
    try {
        const { teamId } = req.params;
        const userId = req.user.id;

        // Kullanıcının takımın üyesi olup olmadığını kontrol et
        const team = await TeamDB.findById(teamId);
        if (!team) {
            return res.status(404).json({ error: "Takım bulunamadı" });
        }

        // Kullanıcı takımın lideri veya üyesi mi kontrol et
        const isLeader = team.leader.toString() === userId;
        const isMember = team.members.some(member => member.toString() === userId);

        if (!isLeader && !isMember) {
            return res.status(403).json({ error: "Bu takımın mesajlarını görüntüleme yetkiniz yok" });
        }

        // Takıma ait mesajları getir
        const messages = await MessageDB.find({ teamId })
            .populate("sender", "name surname")
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Mesajları getirirken bir hata oluştu" });
    }
};

// Yeni mesaj gönder
const SendMessage = async (req, res) => {
    try {
        const { teamId, content } = req.body;
        const userId = req.user.id;

        if (!content || !teamId) {
            return res.status(400).json({ error: "Mesaj içeriği ve takım ID'si gereklidir" });
        }

        // Kullanıcının takımın üyesi olup olmadığını kontrol et
        const team = await TeamDB.findById(teamId);
        if (!team) {
            return res.status(404).json({ error: "Takım bulunamadı" });
        }

        // Kullanıcı takımın lideri veya üyesi mi kontrol et
        const isLeader = team.leader.toString() === userId;
        const isMember = team.members.some(member => member.toString() === userId);

        if (!isLeader && !isMember) {
            return res.status(403).json({ error: "Bu takıma mesaj gönderme yetkiniz yok" });
        }

        // Yeni mesaj oluştur
        const newMessage = new MessageDB({
            teamId,
            sender: userId,
            content,
            readBy: [userId] // Gönderen kişi mesajı okumuş sayılır
        });

        await newMessage.save();

        // Mesajı gönderen bilgisiyle birlikte döndür
        const populatedMessage = await MessageDB.findById(newMessage._id)
            .populate("sender", "name surname");

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Mesaj gönderilirken bir hata oluştu" });
    }
};

// Mesajları okundu olarak işaretle
const MarkAsRead = async (req, res) => {
    try {
        const { messageIds } = req.body;
        const userId = req.user.id;

        if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
            return res.status(400).json({ error: "Geçerli mesaj ID'leri gereklidir" });
        }

        // Mesajları bul ve okundu olarak işaretle
        const updateResults = await Promise.all(
            messageIds.map(async (messageId) => {
                const message = await MessageDB.findById(messageId);
                
                if (!message) {
                    return { messageId, success: false, error: "Mesaj bulunamadı" };
                }

                // Kullanıcının takımın üyesi olup olmadığını kontrol et
                const team = await TeamDB.findById(message.teamId);
                
                if (!team) {
                    return { messageId, success: false, error: "Takım bulunamadı" };
                }

                const isLeader = team.leader.toString() === userId;
                const isMember = team.members.some(member => member.toString() === userId);

                if (!isLeader && !isMember) {
                    return { messageId, success: false, error: "Bu mesajı okuma yetkiniz yok" };
                }

                // Kullanıcı zaten mesajı okumuşsa güncelleme yapma
                if (message.readBy.includes(userId)) {
                    return { messageId, success: true, alreadyRead: true };
                }

                // Mesajı okundu olarak işaretle
                message.readBy.push(userId);
                await message.save();
                
                return { messageId, success: true };
            })
        );

        res.status(200).json(updateResults);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Mesajlar okundu olarak işaretlenirken bir hata oluştu" });
    }
};

// Okunmamış mesaj sayısını getir
const GetUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Kullanıcının üye olduğu takımları bul
        const teams = await TeamDB.find({
            $or: [
                { leader: userId },
                { members: userId }
            ]
        });
        
        const teamIds = teams.map(team => team._id);
        
        // Her takım için okunmamış mesaj sayısını hesapla
        const unreadCounts = await Promise.all(
            teamIds.map(async (teamId) => {
                const count = await MessageDB.countDocuments({
                    teamId,
                    readBy: { $ne: userId }
                });
                
                return { teamId, count };
            })
        );
        
        // Toplam okunmamış mesaj sayısı
        const totalUnread = unreadCounts.reduce((total, item) => total + item.count, 0);
        
        res.status(200).json({
            totalUnread,
            teamCounts: unreadCounts
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Okunmamış mesaj sayısı hesaplanırken bir hata oluştu" });
    }
};

module.exports = { GetTeamMessages, SendMessage, MarkAsRead, GetUnreadCount }; 