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

// Model ve controller'ları import et
const MessageDB = require("./model/message");
const TeamDB = require("./model/team");
const UserDB = require("./model/user");

const authRouter = require("./route/auth");
const advertRouter = require("./route/advert");
const teamRouter = require("./route/team");
const messageRouter = require("./route/message");

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.use("/api/auth", authRouter);
app.use("/api/advert", advertRouter);
app.use("/api/team", teamRouter);
app.use("/api/message", messageRouter);

// Socket.io bağlantı yönetimi
const connectedUsers = new Map(); // Kullanıcı ID'si -> socket.id eşleşmesi
const userTeams = new Map(); // Kullanıcı ID'si -> takım ID'leri eşleşmesi
const teamUsers = new Map(); // Takım ID'si -> kullanıcı ID'leri eşleşmesi
const userActivity = new Map(); // Kullanıcı ID'si -> son aktivite zamanı

// Kullanıcı aktivitesini kontrol et ve çevrimiçi durumunu güncelle
setInterval(() => {
    const now = Date.now();
    for (const [userId, lastActivity] of userActivity.entries()) {
        // 5 dakikadan fazla aktivite yoksa çevrimdışı olarak işaretle
        if (now - lastActivity > 5 * 60 * 1000) {
            if (connectedUsers.has(userId)) {
                // Kullanıcıyı çevrimdışı olarak işaretle
                connectedUsers.delete(userId);
                
                // Kullanıcının takımlarını al
                const teams = userTeams.get(userId) || [];
                
                // Takımdaki diğer kullanıcılara offline durumunu bildir
                teams.forEach(teamId => {
                    io.to(`team:${teamId}`).emit("user_status_change", {
                        userId,
                        status: "offline"
                    });
                });
                
                // Tüm takımlara kullanıcı durumlarını yayınla
                broadcastUserStatus();
            }
        }
    }
}, 60 * 1000); // Her dakika kontrol et

io.on("connection", (socket) => {
    console.log("Yeni bir kullanıcı bağlandı:", socket.id);
    
    // Kullanıcı kimlik doğrulama
    socket.on("authenticate", (userData) => {
        if (userData && userData.userId) {
            console.log(`Kullanıcı kimliği doğrulandı: ${userData.userId}`);
            connectedUsers.set(userData.userId, socket.id);
            userActivity.set(userData.userId, Date.now()); // Aktivite zamanını güncelle
            
            // Kullanıcıyı kendi odasına ekle (özel mesajlar için)
            socket.join(userData.userId);
            
            // Kullanıcının takımlarını kaydet
            if (userData.teams && Array.isArray(userData.teams)) {
                userTeams.set(userData.userId, userData.teams);
                
                // Kullanıcıyı takım odalarına ekle
                userData.teams.forEach(teamId => {
                    socket.join(`team:${teamId}`);
                    
                    // Takım kullanıcılarını güncelle
                    if (!teamUsers.has(teamId)) {
                        teamUsers.set(teamId, new Set());
                    }
                    teamUsers.get(teamId).add(userData.userId);
                    
                    // Takımdaki diğer kullanıcılara online durumunu bildir
                    socket.to(`team:${teamId}`).emit("user_status_change", {
                        userId: userData.userId,
                        status: "online"
                    });
                });
            }
            
            // Tüm takımlara kullanıcının online olduğunu bildir
            broadcastUserStatus();
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
            userId,
            isTyping
        });
    });
    
    // Bağlantı kesildiğinde
    socket.on("disconnect", () => {
        console.log("Kullanıcı bağlantısı kesildi:", socket.id);
        
        // Bağlantısı kesilen kullanıcıyı bul
        let disconnectedUserId = null;
        for (const [userId, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                disconnectedUserId = userId;
                connectedUsers.delete(userId);
                break;
            }
        }
        
        if (disconnectedUserId) {
            // Kullanıcının takımlarını al
            const teams = userTeams.get(disconnectedUserId) || [];
            
            // Takım listesinden kullanıcıyı çıkar
            teams.forEach(teamId => {
                const teamMembers = teamUsers.get(teamId);
                if (teamMembers) {
                    teamMembers.delete(disconnectedUserId);
                    
                    // Takımdaki diğer kullanıcılara offline durumunu bildir
                    io.to(`team:${teamId}`).emit("user_status_change", {
                        userId: disconnectedUserId,
                        status: "offline"
                    });
                }
            });
            
            // Kullanıcının takım listesini temizle
            userTeams.delete(disconnectedUserId);
            
            // Tüm takımlara kullanıcının offline olduğunu bildir
            broadcastUserStatus();
        }
    });
    
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
});

async function connectDB() {
    try {
        await mongoose.connect(db_url);
        console.log("Connected to DB");

        app.use("/", router);
        server.listen(port, () => {
            console.log("Server is running on port:", port);
        });
    } catch (error) {
        console.error("DB connection error:", error);
    }
}

connectDB();
