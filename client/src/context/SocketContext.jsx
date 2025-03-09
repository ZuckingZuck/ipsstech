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
  const [onlineUsers, setOnlineUsers] = useState({}); // Çevrimiçi kullanıcılar
  const user = useSelector((state) => state.user.user);
  const teams = useSelector((state) => state.team.myteams) || [];
  const ledTeams = useSelector((state) => state.team.myleds) || [];

  // Okunmamış mesaj sayısını getir
  const fetchUnreadCounts = useCallback(async () => {
    if (!user || !user.token) return;

    try {
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
    }
  }, [user]);

  // URL'den takım ID'sini al
  useEffect(() => {
    const path = location.pathname;
    const match = path.match(/\/team\/([^\/]+)/);
    
    if (match && match[1]) {
      // Takım sayfasındayız, bildirimleri devre dışı bırak
      setCurrentTeamId(match[1]);
      setNotificationsEnabled(false);
    } else {
      // Takım sayfasında değiliz, bildirimleri etkinleştir
      setNotificationsEnabled(true);
    }
  }, [location]);

  // Socket bağlantısını oluştur - sadece bir kez
  useEffect(() => {
    // Kullanıcı yoksa işlem yapma
    if (!user || !user.user || !user.token) return;
    
    // Socket zaten varsa yeniden oluşturma
    if (socketRef.current) return;
    
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
  }, [user?.user?._id, user?.token]); // Sadece kullanıcı ID'si ve token değiştiğinde yeniden bağlan

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
        // Sayfa gizli olduğunda çevrimdışı olarak işaretleme (kullanıcı hala sitede)
        // Sadece bildirim ayarlarını güncelle
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

  // Socket mesaj dinleyicilerini ayarla
  useEffect(() => {
    if (!socketRef.current || !connected || !user || !user.user) return;
    
    console.log("Socket dinleyicileri ayarlanıyor...");
    
    // Önceki dinleyicileri temizle
    socketRef.current.off('new_message');
    socketRef.current.off('message_read');
    socketRef.current.off('user_status');
    
    // Yeni mesaj dinleyicisi
    const handleNewMessage = (message) => {
      console.log('Yeni mesaj alındı (context):', message);
      
      // Mesajı gönderen ben değilsem
      if (message && message.sender && message.sender._id !== user.user._id) {
        // Okunmamış mesaj sayısını artır
        setUnreadMessages(prev => prev + 1);
        setTeamUnreadCounts(prev => ({
          ...prev,
          [message.teamId]: (prev[message.teamId] || 0) + 1
        }));
        
        // Eğer bildirimler etkinse ve şu anda bu takımın sohbet sayfasında değilsem bildirim göster
        if (notificationsEnabled && message.teamId !== currentTeamId) {
          const teamName = getTeamName(message.teamId);
          const senderName = message.sender ? `${message.sender.name} ${message.sender.surname}` : 'Birisi';
          const isLeader = message.sender && message.sender.isLeader;
          
          // Bildirim göster
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
    };

    // Mesaj okundu dinleyicisi
    const handleMessageRead = ({ messageId, userId, teamId }) => {
      // Mesajı okuyan ben isem, okunmamış mesaj sayısını güncelle
      if (userId === user.user._id) {
        fetchUnreadCounts();
      }
    };
    
    // Kullanıcı durumu dinleyicisi
    const handleUserStatus = (data) => {
      setOnlineUsers(data);
    };

    // Dinleyicileri ekle
    socketRef.current.on('new_message', handleNewMessage);
    socketRef.current.on('message_read', handleMessageRead);
    socketRef.current.on('user_status', handleUserStatus);

    // İlk yükleme ve bağlantı kurulduğunda okunmamış mesaj sayısını getir
    fetchUnreadCounts();

    // Temizleme fonksiyonu
    return () => {
      if (socketRef.current) {
        console.log("Socket dinleyicileri temizleniyor...");
        socketRef.current.off('new_message', handleNewMessage);
        socketRef.current.off('message_read', handleMessageRead);
        socketRef.current.off('user_status', handleUserStatus);
      }
    };
  }, [connected, user?.user?._id, fetchUnreadCounts, currentTeamId, getTeamName, notificationsEnabled]);

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
        });

        // Okunmamış mesaj sayısını güncelle
        fetchUnreadCounts();
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
  const setActiveTeam = (teamId) => {
    setCurrentTeamId(teamId);
    // Aktif takım ayarlandığında bildirimleri kapat
    setNotificationsEnabled(false);
  };

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
    currentTeamId
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider; 