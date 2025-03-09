import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const location = useLocation();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [teamUnreadCounts, setTeamUnreadCounts] = useState({});
  const [currentTeamId, setCurrentTeamId] = useState(null); // Şu anda görüntülenen takım ID'si
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); // Bildirimlerin etkin olup olmadığı
  const [soundEnabled, setSoundEnabled] = useState(true); // Bildirim sesinin etkin olup olmadığı
  const [onlineUsers, setOnlineUsers] = useState({}); // Çevrimiçi kullanıcılar
  const [notifications, setNotifications] = useState([]); // Kullanıcının bildirimleri
  const [unreadNotifications, setUnreadNotifications] = useState(0); // Okunmamış bildirim sayısı
  const notificationsEnabledRef = useRef(true); // Bildirimlerin etkin olup olmadığını tutan ref
  const currentTeamIdRef = useRef(null); // Şu anda görüntülenen takım ID'sini tutan ref
  const notificationSoundRef = useRef(null); // Bildirim sesi için ref
  const soundEnabledRef = useRef(true); // Bildirim sesinin etkin olup olmadığını tutan ref
  const user = useSelector((state) => state.user.user);
  const teams = useSelector((state) => state.team.myteams) || [];
  const ledTeams = useSelector((state) => state.team.myleds) || [];

  // Bildirim sesi oluştur ve yerel depolamadan ses ayarını yükle
  useEffect(() => {
    notificationSoundRef.current = new Audio('/notification.mp3');
    notificationSoundRef.current.volume = 0.5; // Ses seviyesini ayarla
    
    // Yerel depolamadan ses ayarını yükle
    const savedSoundEnabled = localStorage.getItem('soundEnabled');
    if (savedSoundEnabled !== null) {
      const isEnabled = savedSoundEnabled === 'true';
      setSoundEnabled(isEnabled);
      soundEnabledRef.current = isEnabled;
    }
  }, []);

  // Ses ayarı değiştiğinde yerel depolamaya kaydet
  useEffect(() => {
    localStorage.setItem('soundEnabled', soundEnabled.toString());
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Okunmamış mesaj sayısını getir
  const fetchUnreadCounts = useCallback(async () => {
    if (!user || !user.token) return;

    try {
      // Eğer API isteği zaten devam ediyorsa, yeni istek yapma
      if (fetchUnreadCounts.isLoading) return;
      
      // İstek başladı
      fetchUnreadCounts.isLoading = true;
      
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/message/unread`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadMessages(data.totalUnread || 0);
        
        // Takım bazında okunmamış mesaj sayılarını ayarla
        const teamCounts = {};
        if (data.teamCounts && Array.isArray(data.teamCounts)) {
          data.teamCounts.forEach(item => {
            if (item && item.teamId) {
              teamCounts[item.teamId] = item.count || 0;
            }
          });
        }
        setTeamUnreadCounts(teamCounts);
      }
    } catch (error) {
      console.error('Okunmamış mesaj sayısı alınamadı:', error);
    } finally {
      // İstek tamamlandı
      fetchUnreadCounts.isLoading = false;
    }
  }, [user]);
  
  // İstek durumunu izlemek için özellik ekle
  fetchUnreadCounts.isLoading = false;

  // Bildirimleri getir
  const fetchNotifications = useCallback(async () => {
    if (!user || !user.token) return;

    try {
      console.log('Bildirimler getiriliyor...');
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/notification`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      console.log('Bildirimler API yanıtı:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Alınan bildirimler:', data);
        setNotifications(data);
        
        // Okunmamış bildirim sayısını hesapla
        const unreadCount = data.filter(notification => !notification.read).length;
        console.log('Okunmamış bildirim sayısı:', unreadCount);
        setUnreadNotifications(unreadCount);
        
        return data;
      } else {
        console.error('Bildirimler alınamadı. Durum kodu:', response.status);
        const errorText = await response.text();
        console.error('Hata detayı:', errorText);
        return [];
      }
    } catch (error) {
      console.error('Bildirimler alınamadı:', error);
      return [];
    }
  }, [user]);

  // Bildirimi okundu olarak işaretle
  const markNotificationAsRead = useCallback(async (notificationId) => {
    if (!user || !user.token || !notificationId) return false;

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/notification/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        // Bildirimleri güncelle
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, read: true } 
              : notification
          )
        );
        
        // Okunmamış bildirim sayısını güncelle
        setUnreadNotifications(prev => Math.max(0, prev - 1));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Bildirim işaretlenemedi:', error);
      return false;
    }
  }, [user]);

  // Tüm bildirimleri okundu olarak işaretle
  const markAllNotificationsAsRead = useCallback(async () => {
    if (!user || !user.token) return false;

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/notification/mark-all-read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Tüm bildirimler okundu olarak işaretlendi:', result);
        
        // Tüm bildirimleri okundu olarak güncelle
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        
        // Okunmamış bildirim sayısını sıfırla
        setUnreadNotifications(0);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Bildirimler işaretlenemedi:', error);
      return false;
    }
  }, [user]);
  
  // Tüm bildirimleri sil
  const deleteAllNotifications = useCallback(async () => {
    if (!user || !user.token) return false;

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/notification/delete-all`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Tüm bildirimler silindi:', result);
        
        // Bildirimleri temizle
        setNotifications([]);
        
        // Okunmamış bildirim sayısını sıfırla
        setUnreadNotifications(0);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Bildirimler silinemedi:', error);
      return false;
    }
  }, [user]);

  // Takım daveti gönder
  const sendTeamInvite = useCallback(async (userId, teamId) => {
    if (!socketRef.current || !connected || !user || !user.user) {
      console.error("Davet gönderme hatası: Socket bağlantısı yok veya kullanıcı oturum açmamış", { 
        socketExists: !!socketRef.current, 
        connected, 
        userExists: !!user, 
        userLoggedIn: user && !!user.user 
      });
      return Promise.reject(new Error("Socket bağlantısı yok veya kullanıcı oturum açmamış"));
    }

    return new Promise((resolve, reject) => {
      // Hata dinleyicisi
      const errorHandler = (error) => {
        console.error("Socket davet hatası:", error);
        socketRef.current.off('team_invite_sent', successHandler);
        socketRef.current.off('error', errorHandler);
        reject(error);
      };

      // Başarı dinleyicisi
      const successHandler = (data) => {
        console.log("Davet başarıyla gönderildi:", data);
        socketRef.current.off('team_invite_sent', successHandler);
        socketRef.current.off('error', errorHandler);
        resolve(data);
      };

      // Dinleyicileri ekle
      socketRef.current.on('team_invite_sent', successHandler);
      socketRef.current.on('error', errorHandler);

      // Daveti gönder
      console.log("Socket üzerinden davet gönderiliyor:", { userId, teamId, senderId: user.user._id });
      socketRef.current.emit('send_team_invite', {
        userId,
        teamId,
        senderId: user.user._id
      });

      // 10 saniye sonra zaman aşımı
      setTimeout(() => {
        socketRef.current.off('team_invite_sent', successHandler);
        socketRef.current.off('error', errorHandler);
        reject(new Error("Davet gönderme zaman aşımına uğradı"));
      }, 10000);
    });
  }, [user, connected]);

  // Takım davetini kabul et
  const acceptTeamInvite = useCallback(async (notificationId, teamId) => {
    if (!user || !user.token || !notificationId) {
      console.error('Davet kabul edilemedi: Eksik bilgi', { notificationId, teamId });
      return Promise.reject(new Error('Eksik bilgi'));
    }

    console.log('Takım daveti kabul ediliyor:', { notificationId, teamId });

    // Socket bağlantısı varsa socket üzerinden, yoksa HTTP üzerinden işlem yap
    if (socketRef.current && connected) {
      return new Promise((resolve, reject) => {
        // Hata dinleyicisi
        const errorHandler = (error) => {
          console.error("Socket davet kabul hatası:", error);
          socketRef.current.off('team_invite_accepted', successHandler);
          socketRef.current.off('error', errorHandler);
          reject(error);
        };

        // Başarı dinleyicisi
        const successHandler = (data) => {
          console.log("Davet başarıyla kabul edildi:", data);
          socketRef.current.off('team_invite_accepted', successHandler);
          socketRef.current.off('error', errorHandler);
          
          // Bildirimleri güncelle
          fetchNotifications();
          
          resolve(data);
        };

        // Dinleyicileri ekle
        socketRef.current.on('team_invite_accepted', successHandler);
        socketRef.current.on('error', errorHandler);

        // Daveti kabul et
        console.log("Socket üzerinden davet kabul ediliyor:", { userId: user.user._id, teamId, notificationId });
        socketRef.current.emit('accept_team_invite', {
          userId: user.user._id,
          teamId,
          notificationId
        });

        // 10 saniye sonra zaman aşımı
        setTimeout(() => {
          socketRef.current.off('team_invite_accepted', successHandler);
          socketRef.current.off('error', errorHandler);
          reject(new Error("Davet kabul etme zaman aşımına uğradı"));
        }, 10000);
      });
    } else {
      // HTTP isteği ile işlem yap
      try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/notification/team-invite/${notificationId}/accept`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify({ teamId })
        });

        console.log('Davet kabul etme yanıtı:', response.status, response.statusText);

        if (response.ok) {
          const data = await response.json();
          console.log('Davet kabul edildi:', data);
          
          // Bildirimleri güncelle
          fetchNotifications();
          
          return data;
        } else {
          const errorText = await response.text();
          console.error('Davet kabul edilemedi. Durum kodu:', response.status, errorText);
          return Promise.reject(new Error(`Davet kabul edilemedi: ${errorText}`));
        }
      } catch (error) {
        console.error('Davet kabul edilemedi:', error);
        return Promise.reject(error);
      }
    }
  }, [user, connected, fetchNotifications]);

  // Takım davetini reddet
  const rejectTeamInvite = useCallback(async (notificationId, teamId) => {
    if (!user || !user.token || !notificationId) {
      console.error('Davet reddedilemedi: Eksik bilgi', { notificationId, teamId });
      return Promise.reject(new Error('Eksik bilgi'));
    }

    console.log('Takım daveti reddediliyor:', { notificationId, teamId });

    // Socket bağlantısı varsa socket üzerinden, yoksa HTTP üzerinden işlem yap
    if (socketRef.current && connected) {
      return new Promise((resolve, reject) => {
        // Hata dinleyicisi
        const errorHandler = (error) => {
          console.error("Socket davet reddetme hatası:", error);
          socketRef.current.off('team_invite_rejected', successHandler);
          socketRef.current.off('error', errorHandler);
          reject(error);
        };

        // Başarı dinleyicisi
        const successHandler = (data) => {
          console.log("Davet başarıyla reddedildi:", data);
          socketRef.current.off('team_invite_rejected', successHandler);
          socketRef.current.off('error', errorHandler);
          
          // Bildirimleri güncelle
          fetchNotifications();
          
          resolve(data);
        };

        // Dinleyicileri ekle
        socketRef.current.on('team_invite_rejected', successHandler);
        socketRef.current.on('error', errorHandler);

        // Daveti reddet
        console.log("Socket üzerinden davet reddediliyor:", { userId: user.user._id, teamId, notificationId });
        socketRef.current.emit('reject_team_invite', {
          userId: user.user._id,
          teamId,
          notificationId
        });

        // 10 saniye sonra zaman aşımı
        setTimeout(() => {
          socketRef.current.off('team_invite_rejected', successHandler);
          socketRef.current.off('error', errorHandler);
          reject(new Error("Davet reddetme zaman aşımına uğradı"));
        }, 10000);
      });
    } else {
      // HTTP isteği ile işlem yap
      try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/notification/team-invite/${notificationId}/reject`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify({ teamId })
        });

        console.log('Davet reddetme yanıtı:', response.status, response.statusText);

        if (response.ok) {
          const data = await response.json();
          console.log('Davet reddedildi:', data);
          
          // Bildirimleri güncelle
          fetchNotifications();
          
          return data;
        } else {
          const errorText = await response.text();
          console.error('Davet reddedilemedi. Durum kodu:', response.status, errorText);
          return Promise.reject(new Error(`Davet reddedilemedi: ${errorText}`));
        }
      } catch (error) {
        console.error('Davet reddedilemedi:', error);
        return Promise.reject(error);
      }
    }
  }, [user, connected, fetchNotifications]);

  // Kullanıcı ara
  const searchUsers = useCallback(async (query) => {
    if (!user || !user.token || !query) return [];

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/notification/search-users?query=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return [];
    } catch (error) {
      console.error('Kullanıcı araması yapılamadı:', error);
      return [];
    }
  }, [user]);

  // Kullanıcı profili getir
  const getUserProfile = useCallback(async (userId) => {
    if (!user || !user.token || !userId) return null;

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/notification/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      console.error('Kullanıcı profili alınamadı:', error);
      return null;
    }
  }, [user]);

  // Socket bağlantısını oluştur - sadece bir kez
  useEffect(() => {
    // Kullanıcı yoksa işlem yapma
    if (!user || !user.user || !user.token) return;
    
    // Socket zaten varsa yeniden oluşturma
    if (socketRef.current) {
      // Socket bağlantısı varsa, bildirim durumunu güncelle
      console.log("Socket bağlantısı zaten var, bildirim durumunu güncelliyorum...");
      
      // URL'den takım ID'sini al
      const path = location.pathname;
      const match = path.match(/\/team\/([^\/]+)/);
      
      if (match && match[1]) {
        // Takım sayfasındayız, bildirimleri devre dışı bırak
        currentTeamIdRef.current = match[1];
        notificationsEnabledRef.current = false;
        console.log("Bildirimler devre dışı bırakıldı, takım sayfasındayız:", match[1]);
      } else {
        // Takım sayfasında değiliz, bildirimleri etkinleştir
        currentTeamIdRef.current = null;
        notificationsEnabledRef.current = true;
        console.log("Bildirimler etkinleştirildi, takım sayfasında değiliz");
      }
      
      return;
    }
    
    console.log("Socket bağlantısı oluşturuluyor...");
    const newSocket = io(import.meta.env.VITE_REACT_APP_API_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket.io bağlantısı kuruldu');
      setConnected(true);

      // Kullanıcı kimliğini doğrula
      if (user && user.user && user.user._id) {
        const allTeams = [...(teams || []), ...(ledTeams || [])].filter(team => team && team._id).map(team => team._id);
        console.log('Kullanıcı kimliği doğrulanıyor:', user.user._id);
        console.log('Kullanıcı takımları:', allTeams);
        
        newSocket.emit('authenticate', {
          userId: user.user._id,
          teams: allTeams
        });
      } else if (user && user.token) {
        // Kullanıcı verisi farklı bir yapıda olabilir, kontrol edelim
        console.log('Alternatif kullanıcı kimliği kontrolü yapılıyor...');
        
        try {
          // localStorage'dan kullanıcı verisini tekrar alalım
          const storedUser = JSON.parse(localStorage.getItem('user'));
          
          if (storedUser && storedUser.user && storedUser.user._id) {
            console.log('localStorage\'dan kullanıcı kimliği bulundu:', storedUser.user._id);
            
            const allTeams = [...(teams || []), ...(ledTeams || [])].filter(team => team && team._id).map(team => team._id);
            
            newSocket.emit('authenticate', {
              userId: storedUser.user._id,
              teams: allTeams
            });
          } else {
            console.error('localStorage\'da geçerli kullanıcı kimliği bulunamadı:', storedUser);
          }
        } catch (error) {
          console.error('Kullanıcı kimliği doğrulama hatası:', error);
        }
      } else {
        console.error('Kullanıcı kimliği bulunamadı:', user);
      }
      
      // URL'den takım ID'sini al
      const path = location.pathname;
      const match = path.match(/\/team\/([^\/]+)/);
      
      if (match && match[1]) {
        // Takım sayfasındayız, bildirimleri devre dışı bırak
        currentTeamIdRef.current = match[1];
        notificationsEnabledRef.current = false;
        console.log("Bildirimler devre dışı bırakıldı, takım sayfasındayız:", match[1]);
      } else {
        // Takım sayfasında değiliz, bildirimleri etkinleştir
        currentTeamIdRef.current = null;
        notificationsEnabledRef.current = true;
        console.log("Bildirimler etkinleştirildi, takım sayfasında değiliz");
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.io bağlantısı kesildi');
      setConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket hatası:', error);
    });

    socketRef.current = newSocket;

    // Temizleme fonksiyonu
    return () => {
      if (socketRef.current) {
        console.log("Socket bağlantısı kapatılıyor...");
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
    };
  }, [user?.user?._id, user?.token, teams, ledTeams, location.pathname]);

  // URL'den takım ID'sini al
  useEffect(() => {
    const path = location.pathname;
    const match = path.match(/\/team\/([^\/]+)/);
    
    if (match && match[1]) {
      // Takım sayfasındayız, bildirimleri devre dışı bırak
      setCurrentTeamId(match[1]);
      currentTeamIdRef.current = match[1];
      setNotificationsEnabled(false);
      notificationsEnabledRef.current = false;
      console.log("Bildirimler devre dışı bırakıldı, takım sayfasındayız:", match[1]);
    } else {
      // Takım sayfasında değiliz, bildirimleri etkinleştir
      setCurrentTeamId(null);
      currentTeamIdRef.current = null;
      setNotificationsEnabled(true);
      notificationsEnabledRef.current = true;
      console.log("Bildirimler etkinleştirildi, takım sayfasında değiliz");
    }
    
    // Sayfa değiştiğinde okunmamış mesaj sayısını güncelle
    if (user && user.token) {
      fetchUnreadCounts();
    }
  }, [location, user, fetchUnreadCounts]);

  // Takım listesi değiştiğinde takım odalarına katıl
  useEffect(() => {
    if (!socketRef.current || !connected || !user || !user.user) return;
    
    // Kullanıcının takımlarını güncelle
    const allTeams = [...teams, ...ledTeams].filter(team => team && team._id).map(team => team._id);
    
    // Takım odalarına katıl
    allTeams.forEach(teamId => {
      socketRef.current.emit('join_team', { teamId });
    });
    
  }, [teams, ledTeams, connected, user?.user?._id]);

  // Sayfa görünürlüğünü takip et ve çevrimiçi durumunu güncelle
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!socketRef.current || !connected || !user || !user.user) return;
      
      if (document.visibilityState === 'visible') {
        // Sayfa görünür olduğunda çevrimiçi olarak işaretle
        socketRef.current.emit('user_online', { userId: user.user._id });
        
        // Takımlar için çevrimiçi durumunu güncelle
        const allTeams = [...teams, ...ledTeams].filter(team => team && team._id).map(team => team._id);
        allTeams.forEach(teamId => {
          socketRef.current.emit('join_team', { teamId });
        });
        
        // Okunmamış mesajları güncelle
        fetchUnreadCounts();
      } else {
        // Sayfa gizli olduğunda bildirimleri etkinleştir
        setNotificationsEnabled(true);
      }
    };

    // Sayfa görünürlüğü değiştiğinde tetikle
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // İlk yükleme
    if (document.visibilityState === 'visible') {
      handleVisibilityChange();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connected, user?.user?._id, teams, ledTeams, fetchUnreadCounts]);

  // Takım adını bul
  const getTeamName = useCallback((teamId) => {
    const allTeams = [...teams, ...ledTeams];
    const team = allTeams.find(t => t._id === teamId);
    return team ? team.name : 'Takım';
  }, [teams, ledTeams]);

  // Yeni mesaj dinleyicisi
  const handleNewMessage = useCallback((message) => {
    console.log('Yeni mesaj alındı (context):', message);
    console.log('Bildirim durumu:', notificationsEnabledRef.current, 'Aktif takım:', currentTeamIdRef.current);
    
    // Mesajı gönderen ben değilsem
    if (message && message.sender && user?.user && message.sender._id !== user.user._id) {
      // Eğer şu anda bu takımın sohbet sayfasında değilsem okunmamış mesaj sayısını artır
      if (message.teamId !== currentTeamIdRef.current) {
        // Okunmamış mesaj sayısını artır
        setUnreadMessages(prev => prev + 1);
        setTeamUnreadCounts(prev => ({
          ...prev,
          [message.teamId]: (prev[message.teamId] || 0) + 1
        }));
      } else {
        // Eğer şu anda bu takımın sohbet sayfasındaysam, mesajı otomatik olarak okundu olarak işaretle
        // Not: Bu işlemi TeamChat bileşeninde yapacağız, burada yapmıyoruz
        // Böylece sonsuz döngüyü önlemiş oluyoruz
      }
      
      // Eğer bildirimler etkinse ve şu anda bu takımın sohbet sayfasında değilsem bildirim göster
      const shouldShowNotification = notificationsEnabledRef.current && message.teamId !== currentTeamIdRef.current;
      console.log('Bildirim gösterilmeli mi?', shouldShowNotification);
      
      if (shouldShowNotification) {
        const teamName = getTeamName(message.teamId);
        const senderName = message.sender ? `${message.sender.name} ${message.sender.surname}` : 'Birisi';
        const isLeader = message.sender && message.sender.isLeader;
        
        console.log("Bildirim gösteriliyor:", teamName, senderName, message.content);
        
        // Bildirim sesi çal (eğer ses etkinse)
        try {
          if (notificationSoundRef.current && soundEnabledRef.current) {
            // Ses çalma işlemini sıfırla (eğer hala çalıyorsa)
            notificationSoundRef.current.pause();
            notificationSoundRef.current.currentTime = 0;
            
            // Sesi çal
            notificationSoundRef.current.play().catch(error => {
              console.error("Bildirim sesi çalınırken hata oluştu:", error);
            });
          }
        } catch (error) {
          console.error("Bildirim sesi çalınırken hata oluştu:", error);
        }
        
        // Bildirim göster
        try {
          toast.info(
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${isLeader ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-emerald-500 to-teal-600'}`}>
                  {senderName[0]}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <strong className="text-sm">{teamName}</strong>
                  {isLeader && (
                    <span className="ml-1 text-xs text-amber-400 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Takım Lideri
                    </span>
                  )}
                </div>
                <p className="text-sm"><b>{senderName}:</b> {message.content.length > 30 ? message.content.substring(0, 30) + '...' : message.content}</p>
              </div>
            </div>, 
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              onClick: () => {
                // Bildirime tıklandığında ilgili takım sohbetine yönlendir
                window.location.href = `/team/${message.teamId}`;
              }
            }
          );
          console.log("Bildirim başarıyla gösterildi");
        } catch (error) {
          console.error("Bildirim gösterilirken hata oluştu:", error);
        }
        
        // Tarayıcı bildirimi göster (kullanıcı izin verdiyse)
        if (Notification.permission === "granted") {
          const notification = new Notification(`${teamName} - ${senderName}`, {
            body: message.content,
            icon: '/favicon.ico'
          });
          
          notification.onclick = function() {
            window.focus();
            window.location.href = `/team/${message.teamId}`;
          };
        }
        // İzin istemek için
        else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              const notification = new Notification(`${teamName} - ${senderName}`, {
                body: message.content,
                icon: '/favicon.ico'
              });
              
              notification.onclick = function() {
                window.focus();
                window.location.href = `/team/${message.teamId}`;
              };
            }
          });
        }
      }
    }
  }, [getTeamName, user]);

  // Mesaj okundu dinleyicisi
  const handleMessageRead = useCallback(({ messageId, userId, teamId }) => {
    // Mesajı okuyan ben isem, okunmamış mesaj sayısını güncelle
    if (user?.user && userId === user.user._id) {
      fetchUnreadCounts();
    }
  }, [fetchUnreadCounts, user]);

  // Kullanıcı durumu dinleyicisi
  const handleUserStatus = useCallback((data) => {
    setOnlineUsers(data);
  }, []);

  // Socket mesaj dinleyicilerini ayarla
  useEffect(() => {
    if (!socketRef.current || !connected || !user || !user.user) return;
    
    console.log("Socket dinleyicileri ayarlanıyor...");
    
    // Önceki dinleyicileri temizle
    socketRef.current.off('new_message');
    socketRef.current.off('message_read');
    socketRef.current.off('message_read_update');
    socketRef.current.off('user_status');
    socketRef.current.off('new_notification');
    socketRef.current.off('team_invite_sent');
    socketRef.current.off('team_invite_accepted');
    socketRef.current.off('team_invite_rejected');
    socketRef.current.off('team_member_joined');
    
    // Yeni bildirim dinleyicisi
    const handleNewNotification = (notification) => {
      console.log('Yeni bildirim alındı:', notification);
      
      // Bildirimi state'e ekle
      setNotifications(prev => {
        // Aynı ID'ye sahip bildirim varsa güncelle, yoksa ekle
        const exists = prev.some(n => n._id === notification._id);
        if (exists) {
          console.log('Bu bildirim zaten var, güncelleniyor:', notification._id);
          return prev.map(n => n._id === notification._id ? notification : n);
        } else {
          console.log('Yeni bildirim ekleniyor:', notification._id);
          return [notification, ...prev];
        }
      });
      
      // Okunmamış bildirim sayısını artır
      setUnreadNotifications(prev => prev + 1);
      
      // Bildirim sesi çal (eğer ses etkinse)
      try {
        if (notificationSoundRef.current && soundEnabledRef.current) {
          // Ses çalma işlemini sıfırla (eğer hala çalıyorsa)
          notificationSoundRef.current.pause();
          notificationSoundRef.current.currentTime = 0;
          
          // Sesi çal
          notificationSoundRef.current.play().catch(err => {
            console.error('Bildirim sesi çalınamadı:', err);
          });
        }
      } catch (err) {
        console.error('Bildirim sesi çalınırken hata oluştu:', err);
      }
      
      // Bildirim göster
      try {
        let notificationType, content;
        
        // Bildirim tipine göre başlık ve içerik belirle
        switch (notification.type) {
          case 'team_invite':
            notificationType = 'Takım Daveti';
            break;
          case 'advert_appeal':
            notificationType = 'İlan Başvurusu';
            break;
          default:
            notificationType = 'Bildirim';
        }
        
        // Gönderen bilgisini al
        const senderName = notification.sender ? 
          (typeof notification.sender === 'object' ? 
            `${notification.sender.name} ${notification.sender.surname}` : 
            (notification.data && notification.data.senderName ? notification.data.senderName : 
              (notification.data && notification.data.applicantName ? notification.data.applicantName : 'Birisi')
            )
          ) : 
          (notification.data && notification.data.senderName ? notification.data.senderName : 
            (notification.data && notification.data.applicantName ? notification.data.applicantName : 'Birisi')
          );
        
        // Takım bilgisini al
        const teamName = notification.teamId ? 
          (typeof notification.teamId === 'object' ? 
            notification.teamId.name : 
            (notification.data && notification.data.teamName ? notification.data.teamName : 'bir takım')
          ) : 
          (notification.data && notification.data.teamName ? notification.data.teamName : 'bir takım');
        
        // İlan bilgisini al
        const advertTitle = notification.data && notification.data.advertTitle ? notification.data.advertTitle : '';
        
        // İçerik oluştur
        if (notification.content) {
          content = notification.content;
        } else if (notification.type === 'team_invite') {
          content = `${senderName} sizi "${teamName}" takımına davet etti`;
        } else if (notification.type === 'advert_appeal') {
          content = `${senderName} "${advertTitle}" ilanınıza başvurdu`;
        } else {
          content = 'Yeni bir bildiriminiz var';
        }
        
        toast.info(
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-r from-blue-500 to-purple-500">
                {senderName[0]}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <strong className="text-sm">{notificationType}</strong>
              </div>
              <p className="text-sm">{content}</p>
            </div>
          </div>, 
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined
          }
        );
      } catch (error) {
        console.error("Bildirim gösterilirken hata oluştu:", error);
      }
    };
    
    // Takım daveti gönderildi dinleyicisi
    const handleTeamInviteSent = (data) => {
      console.log('Takım daveti gönderildi:', data);
      
      // Başarı mesajı göster
      toast.success(data.message);
    };
    
    // Takım daveti kabul edildi dinleyicisi
    const handleTeamInviteAccepted = (data) => {
      console.log('Takım daveti kabul edildi:', data);
      
      // Başarı mesajı göster
      toast.success(data.message);
      
      // Bildirimleri güncelle
      fetchNotifications();
      
      // Takımları güncelle (Redux üzerinden yapılacak)
    };
    
    // Takım daveti reddedildi dinleyicisi
    const handleTeamInviteRejected = (data) => {
      console.log('Takım daveti reddedildi:', data);
      
      // Bilgi mesajı göster
      toast.info(data.message);
      
      // Bildirimleri güncelle
      fetchNotifications();
    };
    
    // Takıma yeni üye katıldı dinleyicisi
    const handleTeamMemberJoined = (data) => {
      console.log('Takıma yeni üye katıldı:', data);
      
      // Bilgi mesajı göster
      toast.info(data.message);
      
      // Takımları güncelle (Redux üzerinden yapılacak)
    };
    
    // Dinleyicileri ekle
    socketRef.current.on('new_message', handleNewMessage);
    socketRef.current.on('message_read', handleMessageRead);
    socketRef.current.on('message_read_update', handleMessageRead);
    socketRef.current.on('user_status', handleUserStatus);
    socketRef.current.on('new_notification', handleNewNotification);
    socketRef.current.on('team_invite_sent', handleTeamInviteSent);
    socketRef.current.on('team_invite_accepted', handleTeamInviteAccepted);
    socketRef.current.on('team_invite_rejected', handleTeamInviteRejected);
    socketRef.current.on('team_member_joined', handleTeamMemberJoined);

    // İlk yükleme ve bağlantı kurulduğunda okunmamış mesaj sayısını ve bildirimleri getir
    fetchUnreadCounts();
    fetchNotifications();

    // Temizleme fonksiyonu
    return () => {
      if (socketRef.current) {
        console.log("Socket dinleyicileri temizleniyor...");
        socketRef.current.off('new_message', handleNewMessage);
        socketRef.current.off('message_read', handleMessageRead);
        socketRef.current.off('message_read_update', handleMessageRead);
        socketRef.current.off('user_status', handleUserStatus);
        socketRef.current.off('new_notification', handleNewNotification);
        socketRef.current.off('team_invite_sent', handleTeamInviteSent);
        socketRef.current.off('team_invite_accepted', handleTeamInviteAccepted);
        socketRef.current.off('team_invite_rejected', handleTeamInviteRejected);
        socketRef.current.off('team_member_joined', handleTeamMemberJoined);
      }
    };
  }, [connected, user, fetchUnreadCounts, fetchNotifications]);

  // Mesaj gönderme fonksiyonu
  const sendMessage = (teamId, content) => {
    if (!socketRef.current || !connected || !user || !user.user) return false;

    console.log('Mesaj gönderiliyor:', { teamId, content });
    
    socketRef.current.emit('team_message', {
      teamId,
      message: content,
      senderId: user.user._id
    });

    return true;
  };

  // Mesajları okundu olarak işaretle
  const markMessagesAsRead = useCallback(async (messageIds, teamId) => {
    if (!user || !user.token || !messageIds || messageIds.length === 0) return false;

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/message/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ messageIds })
      });

      if (response.ok && socketRef.current && connected) {
        // Okundu bilgisini socket üzerinden diğer kullanıcılara bildir
        messageIds.forEach(messageId => {
          socketRef.current.emit('mark_read', {
            messageId,
            userId: user.user._id,
            teamId
          });
          
          // Anlık güncelleme için ek bildirim
          socketRef.current.emit('message_read_update', {
            messageId,
            userId: user.user._id,
            teamId
          });
        });

        // Okunmamış mesaj sayısını güncelle
        fetchUnreadCounts();
        
        // Takım için okunmamış mesaj sayısını sıfırla
        if (teamId === currentTeamIdRef.current) {
          setTeamUnreadCounts(prev => ({
            ...prev,
            [teamId]: 0
          }));
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Mesajlar okundu olarak işaretlenemedi:', error);
      return false;
    }
  }, [user, connected, fetchUnreadCounts]);

  // Kullanıcı yazıyor bilgisini gönder
  const sendTypingStatus = (teamId, isTyping) => {
    if (!socketRef.current || !connected || !user || !user.user) return;

    socketRef.current.emit('typing', {
      teamId,
      userId: user.user._id,
      isTyping
    });
  };

  // Şu anda görüntülenen takım ID'sini ayarla
  const setActiveTeam = useCallback((teamId) => {
    // Eğer aynı takım ID'si zaten ayarlanmışsa, işlem yapma
    if (teamId === currentTeamIdRef.current) return;
    
    setCurrentTeamId(teamId);
    currentTeamIdRef.current = teamId;
    
    // Aktif takım ayarlandığında bildirimleri kapat
    if (teamId) {
      setNotificationsEnabled(false);
      notificationsEnabledRef.current = false;
      console.log("Bildirimler devre dışı bırakıldı, aktif takım:", teamId);
      
      // Aktif takım için okunmamış mesaj sayısını sıfırla
      setTeamUnreadCounts(prev => ({
        ...prev,
        [teamId]: 0
      }));
    } else {
      // Aktif takım temizlendiğinde bildirimleri aç
      setNotificationsEnabled(true);
      notificationsEnabledRef.current = true;
      console.log("Bildirimler etkinleştirildi, aktif takım temizlendi");
    }
    
    // Not: fetchUnreadCounts çağrısını kaldırdık çünkü sonsuz döngüye neden oluyordu
  }, []);

  const value = {
    socket: socketRef.current,
    connected,
    unreadMessages,
    teamUnreadCounts,
    onlineUsers,
    sendMessage,
    markMessagesAsRead,
    sendTypingStatus,
    fetchUnreadCounts,
    setActiveTeam,
    currentTeamId,
    soundEnabled,
    setSoundEnabled,
    notifications,
    unreadNotifications,
    fetchNotifications,
    markNotificationAsRead,
    sendTeamInvite,
    acceptTeamInvite,
    rejectTeamInvite,
    searchUsers,
    getUserProfile,
    markAllNotificationsAsRead,
    deleteAllNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider; 