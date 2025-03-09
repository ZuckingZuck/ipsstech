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
      const allTeams = [...teams, ...ledTeams].filter(team => team && team._id).map(team => team._id);
      newSocket.emit('authenticate', {
        userId: user.user._id,
        teams: allTeams
      });
      
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
    
    // Dinleyicileri ekle
    socketRef.current.on('new_message', handleNewMessage);
    socketRef.current.on('message_read', handleMessageRead);
    socketRef.current.on('message_read_update', handleMessageRead);
    socketRef.current.on('user_status', handleUserStatus);

    // İlk yükleme ve bağlantı kurulduğunda okunmamış mesaj sayısını getir
    fetchUnreadCounts();

    // Temizleme fonksiyonu
    return () => {
      if (socketRef.current) {
        console.log("Socket dinleyicileri temizleniyor...");
        socketRef.current.off('new_message', handleNewMessage);
        socketRef.current.off('message_read', handleMessageRead);
        socketRef.current.off('message_read_update', handleMessageRead);
        socketRef.current.off('user_status', handleUserStatus);
      }
    };
  }, [connected, user, fetchUnreadCounts, handleNewMessage, handleMessageRead, handleUserStatus]);

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
    setSoundEnabled
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider; 