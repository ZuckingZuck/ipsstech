const router = require("express").Router();
const { GetTeamMessages, SendMessage, MarkAsRead, GetUnreadCount } = require("../controller/message");
const { addUsertoRequest, requireAuth } = require("../middleware/authControl");

// Tüm mesaj route'ları için kimlik doğrulama gerekli
router.use(addUsertoRequest);
router.use(requireAuth);

// Takıma ait mesajları getir
router.get("/team/:teamId", GetTeamMessages);

// Yeni mesaj gönder
router.post("/", SendMessage);

// Mesajları okundu olarak işaretle
router.post("/read", MarkAsRead);

// Okunmamış mesaj sayısını getir
router.get("/unread", GetUnreadCount);

module.exports = router; 