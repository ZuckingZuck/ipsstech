const router = require('express').Router();
const { 
    GetUserNotifications, 
    MarkNotificationAsRead, 
    SendTeamInvite, 
    AcceptTeamInvite, 
    RejectTeamInvite,
    SearchUsers,
    GetUserProfile,
    MarkAllNotificationsAsRead,
    DeleteAllNotifications
} = require('../controller/notification');
const { addUsertoRequest, requireAuth } = require('../middleware/authControl');

// Tüm route'lar için kimlik doğrulama gerekli
router.use(addUsertoRequest);
router.use(requireAuth);

// Bildirim route'ları
router.get('/', GetUserNotifications);
router.put('/:notificationId/read', MarkNotificationAsRead);
router.put('/mark-all-read', MarkAllNotificationsAsRead);
router.delete('/delete-all', DeleteAllNotifications);
router.post('/team-invite', SendTeamInvite);
router.put('/team-invite/:notificationId/accept', AcceptTeamInvite);
router.put('/team-invite/:notificationId/reject', RejectTeamInvite);

// Kullanıcı arama ve profil route'ları
router.get('/search-users', SearchUsers);
router.get('/user/:userId', GetUserProfile);

module.exports = router; 