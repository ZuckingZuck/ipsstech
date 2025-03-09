// Model importlarını kaldır ve doğrudan server/index.js'den alınan modelleri kullan
const NotificationDB = require('../model/notification');
const UserDB = require('../model/user');
const TeamDB = require('../model/team');

// Kullanıcının bildirimlerini getir
const GetUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Bildirimler isteniyor. Kullanıcı ID:', userId);
        
        // Model adlarını kontrol et
        console.log('Model adları:', {
            NotificationModel: NotificationDB.modelName,
            UserModel: UserDB.modelName,
            TeamModel: TeamDB.modelName
        });
        
        // Kullanıcının bildirimlerini getir (en yeniden en eskiye)
        const notifications = await NotificationDB.find({ recipient: userId });
        console.log('Bulunan ham bildirim sayısı:', notifications.length);
        
        // Populate işlemi ayrı yapılsın
        let populatedNotifications = [];
        try {
            populatedNotifications = await NotificationDB.find({ recipient: userId })
                .populate('sender', 'name surname')
                .populate('teamId', 'name')
                .sort({ createdAt: -1 });
            console.log('Populate edilmiş bildirim sayısı:', populatedNotifications.length);
        } catch (populateError) {
            console.error('Populate hatası:', populateError);
        }
        
        // Sonuçları gönder
        res.status(200).json(populatedNotifications);
    } catch (error) {
        console.error('Bildirimler alınamadı:', error);
        res.status(500).json({ error: 'Bildirimler alınırken bir hata oluştu' });
    }
};

// Bildirimi okundu olarak işaretle
const MarkNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;
        
        // Bildirimi bul
        const notification = await NotificationDB.findById(notificationId);
        
        if (!notification) {
            return res.status(404).json({ error: 'Bildirim bulunamadı' });
        }
        
        // Bildirimin alıcısı kullanıcı mı kontrol et
        if (notification.recipient.toString() !== userId) {
            return res.status(403).json({ error: 'Bu bildirimi işaretleme yetkiniz yok' });
        }
        
        // Bildirimi okundu olarak işaretle
        notification.read = true;
        await notification.save();
        
        res.status(200).json({ message: 'Bildirim okundu olarak işaretlendi', notification });
    } catch (error) {
        console.error('Bildirim işaretlenemedi:', error);
        res.status(500).json({ error: 'Bildirim işaretlenirken bir hata oluştu' });
    }
};

// Takım daveti gönder
const SendTeamInvite = async (req, res) => {
    try {
        const { userId, teamId } = req.body;
        const senderId = req.user.id;
        
        // Kullanıcıyı kontrol et
        const user = await UserDB.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }
        
        // Takımı kontrol et
        const team = await TeamDB.findById(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Takım bulunamadı' });
        }
        
        // Kullanıcının takım lideri olup olmadığını kontrol et
        if (team.leader.toString() !== senderId) {
            return res.status(403).json({ error: 'Bu takıma davet göndermek için takım lideri olmanız gerekiyor' });
        }
        
        // Kullanıcının zaten takımda olup olmadığını kontrol et
        if (team.members.includes(userId)) {
            return res.status(400).json({ error: 'Bu kullanıcı zaten takımın bir üyesi' });
        }
        
        // Kullanıcının zaten davet edilip edilmediğini kontrol et
        const existingInvite = await NotificationDB.findOne({
            recipient: userId,
            sender: senderId,
            teamId: teamId,
            type: 'team_invite',
            status: 'pending'
        });
        
        if (existingInvite) {
            return res.status(400).json({ error: 'Bu kullanıcıya zaten bir davet gönderilmiş' });
        }
        
        // Göndereni bul
        const sender = await UserDB.findById(senderId);
        
        // Yeni bildirim oluştur
        const notification = new NotificationDB({
            recipient: userId,
            sender: senderId,
            type: 'team_invite',
            content: `${sender.name} ${sender.surname} sizi "${team.name}" takımına davet etti`,
            teamId: teamId,
            status: 'pending',
            data: {
                teamId: team._id,
                teamName: team.name,
                senderId: sender._id,
                senderName: `${sender.name} ${sender.surname}`
            }
        });
        
        await notification.save();
        
        // Bildirimi populate et
        const populatedNotification = await NotificationDB.findById(notification._id)
            .populate('sender', 'name surname')
            .populate('teamId', 'name');
        
        res.status(201).json({ 
            message: 'Takım daveti başarıyla gönderildi', 
            notification: populatedNotification 
        });
    } catch (error) {
        console.error('Davet gönderilemedi:', error);
        res.status(500).json({ error: 'Davet gönderilirken bir hata oluştu' });
    }
};

// Takım davetini kabul et
const AcceptTeamInvite = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { teamId } = req.body;
        const userId = req.user.id;
        
        console.log('Takım daveti kabul ediliyor:', { notificationId, teamId, userId });
        
        if (!teamId) {
            console.error('Takım ID eksik:', req.body);
            return res.status(400).json({ error: 'Takım ID gerekli' });
        }
        
        // Bildirimi bul
        const notification = await NotificationDB.findById(notificationId);
        
        if (!notification) {
            console.error('Davet bulunamadı:', notificationId);
            return res.status(404).json({ error: 'Davet bulunamadı' });
        }
        
        // Bildirimin alıcısı kullanıcı mı kontrol et
        if (notification.recipient.toString() !== userId) {
            console.error('Yetki hatası:', { 
                recipient: notification.recipient.toString(), 
                userId 
            });
            return res.status(403).json({ error: 'Bu daveti kabul etme yetkiniz yok' });
        }
        
        // Bildirimin türünü kontrol et
        if (notification.type !== 'team_invite') {
            console.error('Bildirim türü hatası:', notification.type);
            return res.status(400).json({ error: 'Bu bir takım daveti değil' });
        }
        
        // Bildirimin durumunu kontrol et
        if (notification.status !== 'pending') {
            console.error('Bildirim durumu hatası:', notification.status);
            return res.status(400).json({ error: 'Bu davet zaten işlenmiş' });
        }
        
        // Takımı bul
        const team = await TeamDB.findById(teamId);
        
        if (!team) {
            console.error('Takım bulunamadı:', teamId);
            return res.status(404).json({ error: 'Takım bulunamadı' });
        }
        
        // Kullanıcının zaten takımda olup olmadığını kontrol et
        if (team.members.includes(userId)) {
            // Bildirimi güncelle
            notification.status = 'accepted';
            await notification.save();
            
            console.log('Kullanıcı zaten takımın üyesi:', { userId, teamId });
            return res.status(400).json({ 
                error: 'Zaten bu takımın bir üyesisiniz',
                notification
            });
        }
        
        // Kullanıcıyı takıma ekle
        team.members.push(userId);
        await team.save();
        console.log('Kullanıcı takıma eklendi:', { userId, teamId });
        
        // Bildirimi güncelle
        notification.status = 'accepted';
        notification.read = true;
        await notification.save();
        console.log('Bildirim güncellendi:', notification._id);
        
        res.status(200).json({ 
            message: 'Takım daveti başarıyla kabul edildi', 
            team,
            notification 
        });
    } catch (error) {
        console.error('Davet kabul edilemedi:', error);
        res.status(500).json({ error: 'Davet kabul edilirken bir hata oluştu' });
    }
};

// Takım davetini reddet
const RejectTeamInvite = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { teamId } = req.body;
        const userId = req.user.id;
        
        console.log('Takım daveti reddediliyor:', { notificationId, teamId, userId });
        
        if (!teamId) {
            console.error('Takım ID eksik:', req.body);
            return res.status(400).json({ error: 'Takım ID gerekli' });
        }
        
        // Bildirimi bul
        const notification = await NotificationDB.findById(notificationId);
        
        if (!notification) {
            console.error('Davet bulunamadı:', notificationId);
            return res.status(404).json({ error: 'Davet bulunamadı' });
        }
        
        // Bildirimin alıcısı kullanıcı mı kontrol et
        if (notification.recipient.toString() !== userId) {
            console.error('Yetki hatası:', { 
                recipient: notification.recipient.toString(), 
                userId 
            });
            return res.status(403).json({ error: 'Bu daveti reddetme yetkiniz yok' });
        }
        
        // Bildirimin türünü kontrol et
        if (notification.type !== 'team_invite') {
            console.error('Bildirim türü hatası:', notification.type);
            return res.status(400).json({ error: 'Bu bir takım daveti değil' });
        }
        
        // Bildirimin durumunu kontrol et
        if (notification.status !== 'pending') {
            console.error('Bildirim durumu hatası:', notification.status);
            return res.status(400).json({ error: 'Bu davet zaten işlenmiş' });
        }
        
        // Bildirimi güncelle
        notification.status = 'rejected';
        notification.read = true;
        await notification.save();
        console.log('Bildirim güncellendi:', notification._id);
        
        res.status(200).json({ 
            message: 'Takım daveti reddedildi', 
            notification 
        });
    } catch (error) {
        console.error('Davet reddedilemedi:', error);
        res.status(500).json({ error: 'Davet reddedilirken bir hata oluştu' });
    }
};

// Kullanıcı ara
const SearchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.user.id;
        
        if (!query || query.length < 2) {
            return res.status(400).json({ error: 'Arama sorgusu en az 2 karakter olmalıdır' });
        }
        
        // Kullanıcıları ara (kendisi hariç)
        const users = await UserDB.find({
            $and: [
                { _id: { $ne: userId } }, // Kendisi hariç
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { surname: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } }
                    ]
                }
            ]
        })
        .select('name surname email') // Sadece gerekli alanları seç
        .limit(10); // Sonuç sayısını sınırla
        
        res.status(200).json(users);
    } catch (error) {
        console.error('Kullanıcı araması yapılamadı:', error);
        res.status(500).json({ error: 'Kullanıcı araması yapılırken bir hata oluştu' });
    }
};

// Kullanıcı profili getir
const GetUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Kullanıcıyı bul
        const user = await UserDB.findById(userId)
            .select('name surname email createdAt'); // Hassas bilgileri hariç tut
        
        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }
        
        res.status(200).json(user);
    } catch (error) {
        console.error('Kullanıcı profili alınamadı:', error);
        res.status(500).json({ error: 'Kullanıcı profili alınırken bir hata oluştu' });
    }
};

// Kullanıcının tüm bildirimlerini okundu olarak işaretle
const MarkAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log('Tüm bildirimler okundu olarak işaretleniyor. Kullanıcı ID:', userId);
        
        // Kullanıcının okunmamış tüm bildirimlerini bul ve güncelle
        const result = await NotificationDB.updateMany(
            { recipient: userId, read: false },
            { $set: { read: true } }
        );
        
        console.log('Okundu olarak işaretlenen bildirim sayısı:', result.modifiedCount);
        
        res.status(200).json({ 
            message: 'Tüm bildirimler okundu olarak işaretlendi',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Bildirimler işaretlenemedi:', error);
        res.status(500).json({ error: 'Bildirimler işaretlenirken bir hata oluştu' });
    }
};

// Kullanıcının tüm bildirimlerini sil
const DeleteAllNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log('Tüm bildirimler siliniyor. Kullanıcı ID:', userId);
        
        // Kullanıcının tüm bildirimlerini sil
        const result = await NotificationDB.deleteMany({ recipient: userId });
        
        console.log('Silinen bildirim sayısı:', result.deletedCount);
        
        res.status(200).json({ 
            message: 'Tüm bildirimler silindi',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Bildirimler silinemedi:', error);
        res.status(500).json({ error: 'Bildirimler silinirken bir hata oluştu' });
    }
};

module.exports = {
    GetUserNotifications,
    MarkNotificationAsRead,
    SendTeamInvite,
    AcceptTeamInvite,
    RejectTeamInvite,
    SearchUsers,
    GetUserProfile,
    MarkAllNotificationsAsRead,
    DeleteAllNotifications
}; 