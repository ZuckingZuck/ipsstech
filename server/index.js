const express = require("express");
const app = express();
const router = express.Router();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const db_url = process.env.DB_URL;
const port = process.env.PORT || 8080;
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Router'ları import et
const authRouter = require("./route/auth");
const advertRouter = require("./route/advert");
const teamRouter = require("./route/team");
const messageRouter = require("./route/message");
const notificationRouter = require("./route/notification");

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.use("/api/auth", authRouter);
app.use("/api/advert", advertRouter);
app.use("/api/team", teamRouter);
app.use("/api/message", messageRouter);
app.use("/api/notification", notificationRouter);

// Socket.io bağlantı yönetimi
const connectedUsers = new Map(); // Kullanıcı ID'si -> socket.id eşleşmesi
const userTeams = new Map(); // Kullanıcı ID'si -> takım ID'leri eşleşmesi
const teamUsers = new Map(); // Takım ID'si -> kullanıcı ID'leri eşleşmesi
const userActivity = new Map(); // Kullanıcı ID'si -> son aktivite zamanı

// io ve connectedUsers nesnelerini app nesnesine ekle
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// Tüm takımlara kullanıcı durumlarını yayınla
function broadcastUserStatus() {
    // Her takım için online kullanıcıları belirle
    for (const [teamId, members] of teamUsers.entries()) {
        const onlineUsers = {};
        
        // Her üyenin online durumunu kontrol et
        members.forEach(userId => {
            onlineUsers[userId] = connectedUsers.has(userId);
        });
        
        // Takım odasına online kullanıcıları bildir
        io.to(`team:${teamId}`).emit("user_status", onlineUsers);
    }
}

// Model değişkenlerini tanımla
let UserDB;
let TeamDB;
let MessageDB;
let NotificationDB;

// Kullanıcı aktivitesini kontrol et ve çevrimiçi durumunu güncelle
setInterval(() => {
    const now = Date.now();
    for (const [userId, lastActivity] of userActivity.entries()) {
        // 5 dakikadan fazla aktivite yoksa kullanıcıyı offline olarak işaretle
        if (now - lastActivity > 5 * 60 * 1000) {
            // Kullanıcının bağlantısını kapat
            if (connectedUsers.has(userId)) {
                const socketId = connectedUsers.get(userId);
                const socket = io.sockets.sockets.get(socketId);
                
                if (socket) {
                    socket.disconnect(true);
                }
                
                // Kullanıcıyı bağlı kullanıcılar listesinden çıkar
                connectedUsers.delete(userId);
                
                // Kullanıcının takımlarını temizle
                userTeams.delete(userId);
                
                // Tüm takımlara kullanıcı durumlarını yayınla
                broadcastUserStatus();
            }
        }
    }
}, 60 * 1000); // Her dakika kontrol et

io.on("connection", (socket) => {
    console.log("Yeni bir kullanıcı bağlandı:", socket.id);
    
    // Kullanıcı kimliği doğrulama
    socket.on("authenticate", async (data) => {
        try {
            const { userId, teams } = data;
            
            if (!userId) {
                return socket.emit("error", { message: "Kullanıcı kimliği gerekli" });
            }
            
            // Kullanıcıyı bağlı kullanıcılar listesine ekle
            connectedUsers.set(userId, socket.id);
            
            // Kullanıcının aktivite zamanını güncelle
            userActivity.set(userId, Date.now());
            
            console.log("Kullanıcı kimliği doğrulandı:", userId);
            
            // Kullanıcının takımlarını kaydet
            if (teams && Array.isArray(teams)) {
                userTeams.set(userId, teams);
                
                // Her takım için kullanıcıyı ekle
                teams.forEach(teamId => {
                    if (!teamId) return;
                    
                    // Takım odasına katıl
                    socket.join(`team:${teamId}`);
                    
                    // Takım üyelerini güncelle
                    const teamMembers = teamUsers.get(teamId) || new Set();
                    teamMembers.add(userId);
                    teamUsers.set(teamId, teamMembers);
                });
            }
            
            // Tüm takımlara kullanıcı durumlarını yayınla
            broadcastUserStatus();
        } catch (error) {
            console.error("Kimlik doğrulama hatası:", error);
            socket.emit("error", { message: "Kimlik doğrulama hatası" });
        }
    });
    
    // Kullanıcı çevrimiçi durumu
    socket.on("user_online", (data) => {
        if (data && data.userId) {
            // Kullanıcıyı çevrimiçi olarak işaretle
            connectedUsers.set(data.userId, socket.id);
            userActivity.set(data.userId, Date.now()); // Aktivite zamanını güncelle
            
            // Kullanıcının takımlarını al
            const teams = userTeams.get(data.userId) || [];
            
            // Takımdaki diğer kullanıcılara online durumunu bildir
            teams.forEach(teamId => {
                io.to(`team:${teamId}`).emit("user_status_change", {
                    userId: data.userId,
                    status: "online"
                });
            });
            
            // Tüm takımlara kullanıcı durumlarını yayınla
            broadcastUserStatus();
        }
    });
    
    // Takım odasına katılma
    socket.on("join_team", (data) => {
        if (data && data.teamId) {
            socket.join(`team:${data.teamId}`);
            
            // Takımdaki kullanıcılara online durumlarını gönder
            const onlineUsers = {};
            const teamMemberIds = teamUsers.get(data.teamId) || new Set();
            
            teamMemberIds.forEach(userId => {
                onlineUsers[userId] = connectedUsers.has(userId);
            });
            
            socket.emit("user_status", onlineUsers);
        }
    });
    
    // Takım odasından ayrılma
    socket.on("leave_team", (data) => {
        if (data && data.teamId) {
            socket.leave(`team:${data.teamId}`);
        }
    });
    
    // Online kullanıcıları isteme
    socket.on("get_online_users", (data) => {
        if (data && data.teamId) {
            const onlineUsers = {};
            
            // Takımdaki kullanıcıları al
            const teamMemberIds = teamUsers.get(data.teamId) || new Set();
            
            // Her kullanıcının online durumunu kontrol et
            teamMemberIds.forEach(userId => {
                onlineUsers[userId] = connectedUsers.has(userId);
            });
            
            // İsteyen kullanıcıya online durumlarını gönder
            socket.emit("user_status", onlineUsers);
        }
    });
    
    // Takım mesajı gönderme
    socket.on("team_message", async (messageData) => {
        try {
            const { teamId, message, senderId } = messageData;
            
            if (!teamId || !message || !senderId) {
                return socket.emit("error", { message: "Eksik bilgi" });
            }
            
            // Aktivite zamanını güncelle
            userActivity.set(senderId, Date.now());
            
            // Kullanıcı ve takım bilgilerini kontrol et
            const team = await TeamDB.findById(teamId);
            const user = await UserDB.findById(senderId);
            
            if (!team || !user) {
                return socket.emit("error", { message: "Takım veya kullanıcı bulunamadı" });
            }
            
            // Kullanıcının takımın üyesi olup olmadığını kontrol et
            const isLeader = team.leader.toString() === senderId;
            const isMember = team.members.some(member => member.toString() === senderId);
            
            if (!isLeader && !isMember) {
                return socket.emit("error", { message: "Bu takıma mesaj gönderme yetkiniz yok" });
            }
            
            // Mesajı veritabanına kaydet
            const newMessage = new MessageDB({
                teamId,
                sender: senderId,
                content: message,
                readBy: [senderId] // Gönderen kişi mesajı okumuş sayılır
            });
            
            await newMessage.save();
            
            // Mesajı gönderen bilgisiyle birlikte al
            const populatedMessage = await MessageDB.findById(newMessage._id)
                .populate("sender", "name surname");
            
            // Mesajı takım odasına yayınla
            io.to(`team:${teamId}`).emit("new_message", {
                _id: populatedMessage._id,
                teamId,
                content: message,
                sender: {
                    _id: user._id,
                    name: user.name,
                    surname: user.surname,
                    isLeader: isLeader
                },
                readBy: [senderId],
                createdAt: populatedMessage.createdAt
            });
        } catch (error) {
            console.error("Mesaj gönderme hatası:", error);
            socket.emit("error", { message: "Mesaj gönderilemedi" });
        }
    });
    
    // Mesaj okundu bildirimi
    socket.on("mark_read", async (data) => {
        const { messageId, userId, teamId } = data;
        
        if (!messageId || !userId || !teamId) {
            return socket.emit("error", { message: "Eksik bilgi" });
        }
        
        // Aktivite zamanını güncelle
        userActivity.set(userId, Date.now());
        
        try {
            // Mesajı veritabanından bul
            const message = await MessageDB.findById(messageId);
            
            if (!message) {
                return socket.emit("error", { message: "Mesaj bulunamadı" });
            }
            
            // Kullanıcı zaten mesajı okumuşsa güncelleme yapma
            if (message.readBy.includes(userId)) {
                return;
            }
            
            // Mesajı okundu olarak işaretle
            message.readBy.push(userId);
            await message.save();
            
            // Takım odasına mesajın okunduğunu bildir
            io.to(`team:${teamId}`).emit("message_read", {
                messageId,
                userId,
                teamId
            });
        } catch (error) {
            console.error("Mesaj okundu işaretleme hatası:", error);
            socket.emit("error", { message: "Mesaj okundu olarak işaretlenemedi" });
        }
    });
    
    // Kullanıcı yazıyor bildirimi
    socket.on("typing", (data) => {
        const { teamId, userId, isTyping } = data;
        
        // Aktivite zamanını güncelle
        if (userId) {
            userActivity.set(userId, Date.now());
        }
        
        // Takım odasına kullanıcının yazdığını bildir
        socket.to(`team:${teamId}`).emit("user_typing", {
            teamId,
            userId,
            isTyping
        });
    });
    
    // Takım daveti gönderme
    socket.on("send_team_invite", async (data) => {
        try {
            console.log("Takım daveti isteği alındı:", data);
            const { userId, teamId, senderId } = data;
            
            if (!userId || !teamId || !senderId) {
                console.error("Takım daveti hatası: Eksik bilgi", data);
                return socket.emit("error", { message: "Eksik bilgi" });
            }
            
            // Aktivite zamanını güncelle
            userActivity.set(senderId, Date.now());
            
            // Kullanıcıyı kontrol et
            const user = await UserDB.findById(userId);
            if (!user) {
                console.error("Takım daveti hatası: Kullanıcı bulunamadı", { userId });
                return socket.emit("error", { message: "Kullanıcı bulunamadı" });
            }
            
            // Takımı kontrol et
            const team = await TeamDB.findById(teamId);
            if (!team) {
                console.error("Takım daveti hatası: Takım bulunamadı", { teamId });
                return socket.emit("error", { message: "Takım bulunamadı" });
            }
            
            // Kullanıcının takım lideri olup olmadığını kontrol et
            if (team.leader.toString() !== senderId) {
                console.error("Takım daveti hatası: Kullanıcı takım lideri değil", { 
                    teamLeader: team.leader.toString(), 
                    senderId 
                });
                return socket.emit("error", { message: "Bu takıma davet göndermek için takım lideri olmanız gerekiyor" });
            }
            
            // Kullanıcının zaten takımda olup olmadığını kontrol et
            if (team.members.includes(userId)) {
                console.error("Takım daveti hatası: Kullanıcı zaten takımın üyesi", { userId, teamId });
                return socket.emit("error", { message: "Bu kullanıcı zaten takımın bir üyesi" });
            }
            
            // Kullanıcının başka takımlara üyeliğini kontrol et
            const userTeams = await TeamDB.find({ members: userId });
            if (userTeams && userTeams.length > 0) {
                console.error("Takım daveti hatası: Kullanıcı zaten başka bir takımın üyesi", { 
                    userId, 
                    teams: userTeams.map(t => t._id) 
                });
                return socket.emit("error", { message: "Bu kullanıcı zaten başka bir takımın üyesi" });
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
                console.error("Takım daveti hatası: Kullanıcıya zaten davet gönderilmiş", { 
                    userId, 
                    teamId, 
                    inviteId: existingInvite._id 
                });
                return socket.emit("error", { message: "Bu kullanıcıya zaten bir davet gönderilmiş" });
            }
            
            // Göndereni bul
            const sender = await UserDB.findById(senderId);
            if (!sender) {
                console.error("Takım daveti hatası: Gönderen bulunamadı", { senderId });
                return socket.emit("error", { message: "Gönderen kullanıcı bulunamadı" });
            }
            
            // Model adlarını kontrol et
            console.log('Model adları:', {
                NotificationModel: NotificationDB.modelName,
                UserModel: UserDB.modelName,
                TeamModel: TeamDB.modelName
            });
            
            // Yeni bildirim oluştur
            const notificationData = {
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
            };
            
            console.log("Oluşturulacak bildirim:", notificationData);
            
            const notification = new NotificationDB(notificationData);
            const savedNotification = await notification.save();
            console.log("Takım daveti bildirimi oluşturuldu:", savedNotification._id);
            
            // Bildirimi populate et
            let populatedNotification;
            try {
                populatedNotification = await NotificationDB.findById(savedNotification._id)
                    .populate('sender', 'name surname')
                    .populate('teamId', 'name');
                console.log("Populate edilmiş bildirim:", populatedNotification);
            } catch (populateError) {
                console.error("Bildirim populate hatası:", populateError);
                populatedNotification = savedNotification;
            }
            
            // Daveti gönderen kullanıcıya başarı mesajı gönder
            socket.emit("team_invite_sent", { 
                message: "Takım daveti başarıyla gönderildi", 
                notification: populatedNotification 
            });
            console.log("Takım daveti başarı mesajı gönderildi:", socket.id);
            
            // Davet edilen kullanıcıya bildirim gönder
            if (connectedUsers.has(userId)) {
                const userSocketId = connectedUsers.get(userId);
                io.to(userSocketId).emit("new_notification", populatedNotification);
                console.log("Davet edilen kullanıcıya bildirim gönderildi:", userSocketId);
            } else {
                console.log("Davet edilen kullanıcı çevrimiçi değil:", userId);
            }
        } catch (error) {
            console.error("Davet gönderme hatası:", error);
            socket.emit("error", { message: "Davet gönderilemedi: " + error.message });
        }
    });
    
    // Takım daveti kabul edildi
    socket.on("accept_team_invite", async (data) => {
        try {
            console.log("Takım daveti kabul edildi isteği alındı:", data);
            const { userId, teamId, notificationId } = data;
            
            if (!userId || !teamId || !notificationId) {
                console.error("Takım daveti kabul hatası: Eksik bilgi", data);
                return socket.emit("error", { message: "Eksik bilgi" });
            }
            
            // Aktivite zamanını güncelle
            userActivity.set(userId, Date.now());
            
            // Bildirimi bul
            const notification = await NotificationDB.findById(notificationId);
            if (!notification) {
                console.error("Takım daveti kabul hatası: Bildirim bulunamadı", { notificationId });
                return socket.emit("error", { message: "Bildirim bulunamadı" });
            }
            
            // Bildirimin alıcısı kullanıcı mı kontrol et
            if (notification.recipient.toString() !== userId) {
                console.error("Takım daveti kabul hatası: Yetki hatası", { 
                    recipient: notification.recipient.toString(), 
                    userId 
                });
                return socket.emit("error", { message: "Bu daveti kabul etme yetkiniz yok" });
            }
            
            // Bildirimin durumunu kontrol et
            if (notification.status !== 'pending') {
                console.error("Takım daveti kabul hatası: Bildirim durumu hatası", notification.status);
                return socket.emit("error", { message: "Bu davet zaten işlenmiş" });
            }
            
            // Takımı bul
            const team = await TeamDB.findById(teamId);
            if (!team) {
                console.error("Takım daveti kabul hatası: Takım bulunamadı", { teamId });
                return socket.emit("error", { message: "Takım bulunamadı" });
            }
            
            // Kullanıcıyı bul
            const user = await UserDB.findById(userId);
            if (!user) {
                console.error("Takım daveti kabul hatası: Kullanıcı bulunamadı", { userId });
                return socket.emit("error", { message: "Kullanıcı bulunamadı" });
            }
            
            // Kullanıcının zaten takımda olup olmadığını kontrol et
            if (team.members.includes(userId)) {
                // Bildirimi güncelle
                notification.status = 'accepted';
                notification.read = true;
                await notification.save();
                
                console.log("Takım daveti kabul hatası: Kullanıcı zaten takımın üyesi", { userId, teamId });
                return socket.emit("error", { message: "Zaten bu takımın bir üyesisiniz" });
            }
            
            // Kullanıcıyı takıma ekle
            team.members.push(userId);
            await team.save();
            console.log("Kullanıcı takıma eklendi:", { userId, teamId });
            
            // Bildirimi güncelle
            notification.status = 'accepted';
            notification.read = true;
            await notification.save();
            console.log("Bildirim güncellendi:", notification._id);
            
            // Takım liderine bildirim gönder
            const teamLeaderId = team.leader.toString();
            const userName = `${user.name} ${user.surname}`;
            const message = `${userName} "${team.name}" takımına katıldı`;
            
            // Daveti kabul eden kullanıcıya başarı mesajı gönder
            socket.emit("team_invite_accepted", { 
                message: "Takım daveti başarıyla kabul edildi", 
                team,
                notification 
            });
            
            // Takım liderine bildirim gönder
            if (connectedUsers.has(teamLeaderId)) {
                io.to(connectedUsers.get(teamLeaderId)).emit("team_member_joined", { 
                    message, 
                    teamId,
                    userId,
                    userName
                });
            }
        } catch (error) {
            console.error("Takım daveti kabul hatası:", error);
            socket.emit("error", { message: "Davet kabul edilemedi: " + error.message });
        }
    });
    
    // Takım daveti reddedildi
    socket.on("reject_team_invite", async (data) => {
        try {
            console.log("Takım daveti reddedildi isteği alındı:", data);
            const { userId, teamId, notificationId } = data;
            
            if (!userId || !teamId || !notificationId) {
                console.error("Takım daveti red hatası: Eksik bilgi", data);
                return socket.emit("error", { message: "Eksik bilgi" });
            }
            
            // Aktivite zamanını güncelle
            userActivity.set(userId, Date.now());
            
            // Bildirimi bul
            const notification = await NotificationDB.findById(notificationId);
            if (!notification) {
                console.error("Takım daveti red hatası: Bildirim bulunamadı", { notificationId });
                return socket.emit("error", { message: "Bildirim bulunamadı" });
            }
            
            // Bildirimin alıcısı kullanıcı mı kontrol et
            if (notification.recipient.toString() !== userId) {
                console.error("Takım daveti red hatası: Yetki hatası", { 
                    recipient: notification.recipient.toString(), 
                    userId 
                });
                return socket.emit("error", { message: "Bu daveti reddetme yetkiniz yok" });
            }
            
            // Bildirimin durumunu kontrol et
            if (notification.status !== 'pending') {
                console.error("Takım daveti red hatası: Bildirim durumu hatası", notification.status);
                return socket.emit("error", { message: "Bu davet zaten işlenmiş" });
            }
            
            // Kullanıcıyı bul
            const user = await UserDB.findById(userId);
            if (!user) {
                console.error("Takım daveti red hatası: Kullanıcı bulunamadı", { userId });
                return socket.emit("error", { message: "Kullanıcı bulunamadı" });
            }
            
            // Bildirimi güncelle
            notification.status = 'rejected';
            notification.read = true;
            await notification.save();
            console.log("Bildirim güncellendi:", notification._id);
            
            // Daveti reddeden kullanıcıya başarı mesajı gönder
            socket.emit("team_invite_rejected", { 
                message: "Takım daveti reddedildi", 
                notification 
            });
            
            // Takım liderine bildirim gönder
            const teamLeaderId = notification.sender.toString();
            const userName = `${user.name} ${user.surname}`;
            const teamName = notification.data && notification.data.teamName ? notification.data.teamName : 'takım';
            
            if (connectedUsers.has(teamLeaderId)) {
                io.to(connectedUsers.get(teamLeaderId)).emit("team_invite_rejected", { 
                    message: `${userName} "${teamName}" takımına katılma davetini reddetti`, 
                    teamId,
                    userId,
                    userName
                });
            }
        } catch (error) {
            console.error("Takım daveti red hatası:", error);
            socket.emit("error", { message: "Davet reddedilemedi: " + error.message });
        }
    });
    
    // Bağlantı kesildiğinde
    socket.on("disconnect", () => {
        console.log("Kullanıcı bağlantısı kesildi:", socket.id);
        
        // Kullanıcı ID'sini bul
        let disconnectedUserId = null;
        for (const [userId, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                disconnectedUserId = userId;
                break;
            }
        }
        
        if (disconnectedUserId) {
            // Kullanıcıyı bağlı kullanıcılar listesinden çıkar
            connectedUsers.delete(disconnectedUserId);
            
            // Kullanıcının takımlarını temizle
            userTeams.delete(disconnectedUserId);
            
            // Tüm takımlara kullanıcının offline olduğunu bildir
            broadcastUserStatus();
        }
    });
});

async function connectDB() {
    try {
        await mongoose.connect(db_url);
        console.log("Connected to DB");

        // Model tanımlamalarını yap - sıralama önemli
        UserDB = require("./model/user");
        TeamDB = require("./model/team");
        MessageDB = require("./model/message");
        NotificationDB = require("./model/notification");

        console.log("Modeller yüklendi:", {
            UserModel: UserDB.modelName,
            TeamModel: TeamDB.modelName,
            MessageModel: MessageDB.modelName,
            NotificationModel: NotificationDB.modelName
        });

        app.use("/", router);
        server.listen(port, () => {
            console.log("Server is running on port:", port);
        });
    } catch (error) {
        console.error("DB connection error:", error);
    }
}

connectDB();
