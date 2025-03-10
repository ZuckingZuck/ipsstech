import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';

const TeamChat = ({ teamId, team, isTeamLeader }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const { socket, sendMessage, markMessagesAsRead, sendTypingStatus, setActiveTeam, onlineUsers, fetchUnreadCounts } = useSocket();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [teamMembers, setTeamMembers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Aktif takım ID'sini ayarla
  useEffect(() => {
    if (teamId) {
      // Aktif takım ID'sini ayarla ve bildirimleri kapat
      setActiveTeam(teamId);
      
      // Okunmamış mesaj sayısını güncelle
      fetchUnreadCounts();
    }
    
    // Temizleme fonksiyonu
    return () => {
      setActiveTeam(null);
    };
  }, [teamId, setActiveTeam, fetchUnreadCounts]);

  // Takım üyelerini getir
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!teamId || !user || !user.token) return;
      
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/team/${teamId}/members`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          }
        );
        
        if (response.status === 200) {
          setTeamMembers(response.data);
        }
      } catch (err) {
        console.error('Takım üyeleri alınamadı:', err);
      }
    };
    
    fetchTeamMembers();
  }, [teamId, user]);

  // Mesajları getir
  useEffect(() => {
    const fetchMessages = async () => {
      if (!teamId || !user) return;
      
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/message/team/${teamId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          }
        );
        
        // Mesajları işle ve takım lideri bilgisini ekle
        const processedMessages = response.data.map(msg => {
          // Mesaj göndereninin takım lideri olup olmadığını kontrol et
          const senderIsLeader = team && team.leader && 
            (typeof team.leader === 'string' 
              ? team.leader === msg.sender._id 
              : team.leader._id === msg.sender._id);
          
          return {
            ...msg,
            sender: {
              ...msg.sender,
              isLeader: senderIsLeader
            }
          };
        });
        
        setMessages(processedMessages);
        
        // Okunmamış mesajları işaretle
        if (response.data && response.data.length > 0 && user && user.user) {
          const userId = user.user._id;
          const unreadMessages = response.data
            .filter(msg => msg.readBy && !msg.readBy.includes(userId) && msg.sender && msg.sender._id !== userId)
            .map(msg => msg._id);
            
          if (unreadMessages.length > 0) {
            markMessagesAsRead(unreadMessages, teamId);
          }
        }
      } catch (err) {
        console.error('Mesajlar alınamadı:', err);
        setError('Mesajlar yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [teamId, user, markMessagesAsRead, team]);

  // Mesajlar yüklendiğinde veya yeni mesaj geldiğinde otomatik kaydır ve okunmamış mesajları işaretle
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Yeni mesajları okundu olarak işaretle
    if (messages.length > 0 && user && user.user) {
      const unreadMessages = messages
        .filter(msg => msg.sender && msg.sender._id !== user.user._id && (!msg.readBy || !msg.readBy.includes(user.user._id)))
        .map(msg => msg._id);
        
      if (unreadMessages.length > 0) {
        markMessagesAsRead(unreadMessages, teamId);
      }
    }
  }, [messages, user, teamId, markMessagesAsRead]);

  // Socket.io mesaj dinleyicileri
  useEffect(() => {
    if (!socket || !user || !user.user) return;
    
    // Yeni mesaj geldiğinde
    const handleNewMessage = (data) => {
      if (data.teamId === teamId) {
        console.log("Yeni mesaj alındı:", data);
        
        // Mesajı state'e ekle
        setMessages(prev => [...prev, data]);
        
        // Mesaj benden değilse okundu olarak işaretle
        if (data.sender && data.sender._id !== user.user._id && data._id) {
          // Kısa bir gecikme ekleyerek mesajın state'e eklenmesini bekle
          setTimeout(() => {
            markMessagesAsRead([data._id], teamId);
          }, 100);
        }
      }
    };
    
    // Kullanıcı yazıyor bildirimi
    const handleTyping = (data) => {
      if (data.teamId === teamId && data.userId !== user.user._id) {
        setTypingUsers(prev => ({
          ...prev,
          [data.userId]: data.isTyping
        }));
      }
    };
    
    // Mesaj okundu bildirimi
    const handleMessageRead = (data) => {
      if (data.teamId === teamId) {
        console.log("Mesaj okundu bildirimi alındı:", data);
        
        // Mesajları güncelle
        setMessages(prev => 
          prev.map(msg => {
            if (msg._id === data.messageId) {
              // Eğer readBy dizisi yoksa oluştur
              const readBy = msg.readBy || [];
              
              // Kullanıcı zaten mesajı okumuşsa güncelleme yapma
              if (readBy.includes(data.userId)) {
                return msg;
              }
              
              // Kullanıcıyı readBy dizisine ekle
              return { 
                ...msg, 
                readBy: [...readBy, data.userId]
              };
            }
            return msg;
          })
        );
      }
    };
    
    // Önceki dinleyicileri temizle
    socket.off('new_message');
    socket.off('user_typing');
    socket.off('message_read');
    socket.off('message_read_update');
    
    // Yeni dinleyicileri ekle
    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);
    socket.on('message_read', handleMessageRead);
    socket.on('message_read_update', handleMessageRead);
    
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleTyping);
      socket.off('message_read', handleMessageRead);
      socket.off('message_read_update', handleMessageRead);
    };
  }, [socket, teamId, user, markMessagesAsRead]);

  // Yazıyor durumu değiştiğinde otomatik kaydır
  useEffect(() => {
    // Eğer birisi yazıyorsa, scrollbar'ı aşağı kaydır
    if (Object.values(typingUsers).some(isTyping => isTyping)) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [typingUsers]);

  // Mesaj gönder
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !teamId || !user || !user.user) return;
    
    // Socket.io ile mesaj gönder
    const success = sendMessage(teamId, newMessage);
    
    if (success) {
      // Mesaj gönderildikten sonra input'u temizle
      setNewMessage('');
      
      // Yazıyor durumunu kapat
      sendTypingStatus(teamId, false);
      
      // Mesaj gönderildikten sonra kısa bir süre bekleyip okunmamış mesajları kontrol et
      // Bu, yeni gönderilen mesajın görüldü ikonlarının doğru şekilde güncellenmesini sağlar
      setTimeout(() => {
        // Son mesajı bul
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage._id) {
          // Son mesajı okundu olarak işaretle (kendim için)
          markMessagesAsRead([lastMessage._id], teamId);
        }
      }, 500);
    }
  };

  // Yazıyor durumunu gönder
  const handleTyping = () => {
    if (!teamId || !user || !user.user) return;
    
    sendTypingStatus(teamId, true);
    
    // Önceki zamanlayıcıyı temizle
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // 2 saniye sonra yazıyor durumunu kapat
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(teamId, false);
    }, 2000);
  };

  // Mesaj formatla
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Yazıyor mesajını göster
  const renderTypingIndicator = () => {
    const typingUserIds = Object.keys(typingUsers).filter(id => typingUsers[id]);
    
    if (typingUserIds.length === 0) return null;
    
    // Yazıyor olan kullanıcıların isimlerini bul
    const typingUserNames = typingUserIds.map(id => {
      const member = teamMembers.find(m => m._id === id);
      return member ? `${member.name}` : 'Birisi';
    });
    
    let typingText = '';
    if (typingUserNames.length === 1) {
      typingText = `${typingUserNames[0]} yazıyor...`;
    } else if (typingUserNames.length === 2) {
      typingText = `${typingUserNames[0]} ve ${typingUserNames[1]} yazıyor...`;
    } else if (typingUserNames.length > 2) {
      typingText = `${typingUserNames.length} kişi yazıyor...`;
    }
    
    return (
      <div className="text-gray-400 text-xs italic py-2 px-4 bg-gray-800/50 rounded-full w-fit mx-auto mb-4 flex items-center shadow-md">
        <div className="flex space-x-1 mr-2">
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        {typingText}
      </div>
    );
  };

  // Gönderenin lider olup olmadığını kontrol et
  const isSenderLeader = (sender) => {
    if (!sender || !team) return false;
    
    // Doğrudan isLeader özelliği varsa kullan
    if (sender.isLeader !== undefined) return sender.isLeader;
    
    // Yoksa takım lideri ID'si ile karşılaştır
    if (typeof team.leader === 'string') {
      return sender._id === team.leader;
    } else if (team.leader && team.leader._id) {
      return sender._id === team.leader._id;
    }
    
    return false;
  };

  // Mesajı görenlerin avatarlarını göster
  const renderReadByAvatars = (message) => {
    if (!message || !message.readBy) return null;
    
    // Takım üyelerini bul
    const readByMembers = teamMembers.filter(member => message.readBy.includes(member._id));
    
    if (readByMembers.length === 0) return null;
    
    return (
      <div className="flex -space-x-1 mt-1">
        {readByMembers.map((member, index) => (
          <div 
            key={member._id} 
            className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white overflow-hidden ${
              onlineUsers && onlineUsers[member._id] 
                ? 'bg-green-600 border border-green-700' 
                : 'bg-gray-600 border border-gray-700'
            }`}
            title={`${member.name} ${member.surname} tarafından görüldü ${onlineUsers && onlineUsers[member._id] ? '(çevrimiçi)' : '(çevrimdışı)'}`}
            style={{ zIndex: readByMembers.length - index }}
          >
            {member.name ? member.name[0].toUpperCase() : '?'}
          </div>
        ))}
        {readByMembers.length > 3 && (
          <div className="w-4 h-4 rounded-full bg-gray-700 border border-gray-800 flex items-center justify-center text-[8px] text-white" style={{ zIndex: 0 }}>
            +{readByMembers.length - 3}
          </div>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
        <div className="p-6 text-center">
          <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden flex flex-col h-[70vh]">
      {/* Mesajlar Alanı */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg">Henüz mesaj yok</p>
            <p className="text-sm">İlk mesajı gönderen siz olun!</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {messages.map((message, index) => {
              const isMyMessage = user && user.user && message.sender && message.sender._id === user.user._id;
              const isLeaderMessage = isSenderLeader(message.sender);
              const isLastMessage = index === messages.length - 1;
              
              return (
                <div
                  key={message._id || index}
                  className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      isMyMessage
                        ? isLeaderMessage
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                        : isLeaderMessage
                          ? 'bg-gradient-to-r from-amber-500/20 to-orange-600/20 border border-amber-500/30 text-gray-200'
                          : 'bg-gray-800 text-gray-200'
                    }`}
                  >
                    {!isMyMessage && message.sender && (
                      <div className={`text-xs font-semibold mb-1 ${isLeaderMessage ? 'text-amber-400 flex items-center gap-1' : 'text-emerald-400'}`}>
                        {isLeaderMessage && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        )}
                        {message.sender.name} {message.sender.surname}
                        {isLeaderMessage && ' (Takım Lideri)'}
                      </div>
                    )}
                    <div className="break-words">{message.content}</div>
                    <div className="text-xs text-right mt-1 opacity-70">
                      {formatTime(message.createdAt)}
                      {isMyMessage && (
                        <span className="ml-2">
                          {message.readBy && message.readBy.length > 1 ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                            </svg>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Görüldü Avatarları - Sadece son mesajda göster */}
                  {isLastMessage && (
                    <div className={`mt-1 ${isMyMessage ? 'mr-1' : 'ml-1'}`}>
                      {renderReadByAvatars(message)}
                    </div>
                  )}
                </div>
              );
            })}
            
            <div className="mt-2">
              {renderTypingIndicator()}
            </div>
            
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Mesaj Gönderme Alanı */}
      <div className="p-4 border-t border-gray-700/50">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleTyping}
            placeholder="Mesajınızı yazın..."
            className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            disabled={loading || !team}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || loading || !team}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamChat; 