import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Menu from '../components/Profile/Menu';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';

const Notifications = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const { fetchNotifications, markNotificationAsRead, acceptTeamInvite, rejectTeamInvite, markAllNotificationsAsRead, deleteAllNotifications } = useSocket();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingIds, setProcessingIds] = useState([]);
  const [processingAll, setProcessingAll] = useState(false);
  
  // Bildirimleri getir
  useEffect(() => {
    const getNotifications = async () => {
      if (!user || !user.token) return;
      
      try {
        setLoading(true);
        console.log('Bildirimler getiriliyor...');
        const data = await fetchNotifications();
        console.log('Alınan bildirimler:', data);
        
        if (data) {
          setNotifications(data);
          console.log('Bildirimler state güncellendi:', data.length);
        } else {
          console.log('Bildirim verisi alınamadı');
        }
      } catch (err) {
        console.error('Bildirimler alınamadı:', err);
        setError('Bildirimler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    getNotifications();
  }, [user, fetchNotifications]);
  
  // Bildirimi okundu olarak işaretle
  const handleMarkAsRead = async (notificationId) => {
    if (processingIds.includes(notificationId)) return;
    
    setProcessingIds((prev) => [...prev, notificationId]);
    
    try {
      const success = await markNotificationAsRead(notificationId);
      
      if (success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification._id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
      } else {
        toast.error('Bildirim işaretlenemedi');
      }
    } catch (err) {
      console.error('Bildirim işaretlenemedi:', err);
      toast.error('Bildirim işaretlenirken bir hata oluştu');
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== notificationId));
    }
  };
  
  // Tüm bildirimleri okundu olarak işaretle
  const handleMarkAllAsRead = async () => {
    if (processingAll) return;
    
    setProcessingAll(true);
    
    try {
      const success = await markAllNotificationsAsRead();
      
      if (success) {
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, read: true }))
        );
        toast.success('Tüm bildirimler okundu olarak işaretlendi');
      } else {
        toast.error('Bildirimler işaretlenemedi');
      }
    } catch (err) {
      console.error('Bildirimler işaretlenemedi:', err);
      toast.error('Bildirimler işaretlenirken bir hata oluştu');
    } finally {
      setProcessingAll(false);
    }
  };
  
  // Tüm bildirimleri sil
  const handleDeleteAll = async () => {
    if (processingAll) return;
    
    setProcessingAll(true);
    
    try {
      const success = await deleteAllNotifications();
      
      if (success) {
        setNotifications([]);
        toast.success('Tüm bildirimler silindi');
      } else {
        toast.error('Bildirimler silinemedi');
      }
    } catch (err) {
      console.error('Bildirimler silinemedi:', err);
      toast.error('Bildirimler silinirken bir hata oluştu');
    } finally {
      setProcessingAll(false);
    }
  };
  
  // Takım davetini kabul et
  const handleAcceptInvite = async (notification) => {
    if (processingIds.includes(notification._id)) return;
    
    setProcessingIds((prev) => [...prev, notification._id]);
    console.log('Takım daveti kabul ediliyor:', notification._id);
    
    try {
      // Takım ID'sini al
      const teamId = notification.teamId ? 
        (typeof notification.teamId === 'object' ? notification.teamId._id : 
          (notification.data && notification.data.teamId ? notification.data.teamId : null)
        ) : 
        (notification.data && notification.data.teamId ? notification.data.teamId : null);
      
      if (!teamId) {
        console.error('Takım ID bulunamadı:', notification);
        throw new Error('Takım ID bulunamadı');
      }
      
      await acceptTeamInvite(notification._id, teamId);
      
      // Bildirimi güncelle
      setNotifications((prev) => 
        prev.map((n) => 
          n._id === notification._id 
            ? { ...n, status: 'accepted', read: true } 
            : n
        )
      );
    } catch (err) {
      console.error('Takım daveti kabul edilemedi:', err);
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== notification._id));
    }
  };
  
  // Takım davetini reddet
  const handleRejectInvite = async (notification) => {
    if (processingIds.includes(notification._id)) return;
    
    setProcessingIds((prev) => [...prev, notification._id]);
    console.log('Takım daveti reddediliyor:', notification._id);
    
    try {
      // Takım ID'sini al
      const teamId = notification.teamId ? 
        (typeof notification.teamId === 'object' ? notification.teamId._id : 
          (notification.data && notification.data.teamId ? notification.data.teamId : null)
        ) : 
        (notification.data && notification.data.teamId ? notification.data.teamId : null);
      
      if (!teamId) {
        console.error('Takım ID bulunamadı:', notification);
        throw new Error('Takım ID bulunamadı');
      }
      
      await rejectTeamInvite(notification._id, teamId);
      
      // Bildirimi güncelle
      setNotifications((prev) => 
        prev.map((n) => 
          n._id === notification._id 
            ? { ...n, status: 'rejected', read: true } 
            : n
        )
      );
    } catch (err) {
      console.error('Takım daveti reddedilemedi:', err);
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== notification._id));
    }
  };
  
  // Kullanıcı profiline git
  const handleViewProfile = (userId) => {
    navigate(`/user/${userId}`);
  };
  
  // Takım sayfasına git
  const handleViewTeam = (teamId) => {
    navigate(`/team/${teamId}`);
  };
  
  // Bildirim içeriğini render et
  const renderNotificationContent = (notification) => {
    const { type, data, status } = notification;
    
    console.log('Bildirim içeriği render ediliyor:', notification);
    
    // Takım daveti bildirimi
    if (type === 'team_invite') {
      // Gönderen ve takım bilgilerini al
      const senderName = notification.sender ? 
        (typeof notification.sender === 'object' ? 
          `${notification.sender.name} ${notification.sender.surname}` : 
          (data && data.senderName ? data.senderName : 'Birisi')
        ) : 
        (data && data.senderName ? data.senderName : 'Birisi');
      
      const teamName = notification.teamId ? 
        (typeof notification.teamId === 'object' ? 
          notification.teamId.name : 
          (data && data.teamName ? data.teamName : 'bir takım')
        ) : 
        (data && data.teamName ? data.teamName : 'bir takım');
      
      const senderId = notification.sender ? 
        (typeof notification.sender === 'object' ? notification.sender._id : 
          (data && data.senderId ? data.senderId : null)
        ) : 
        (data && data.senderId ? data.senderId : null);
      
      const teamId = notification.teamId ? 
        (typeof notification.teamId === 'object' ? notification.teamId._id : 
          (data && data.teamId ? data.teamId : null)
        ) : 
        (data && data.teamId ? data.teamId : null);
      
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{senderName}</span>
            <span className="text-gray-400">sizi</span>
            <span className="font-medium text-white">{teamName}</span>
            <span className="text-gray-400">takımına davet etti</span>
          </div>
          
          {status === 'pending' ? (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleAcceptInvite(notification)}
                disabled={processingIds.includes(notification._id)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {processingIds.includes(notification._id) ? 'İşleniyor...' : 'Kabul Et'}
              </button>
              <button
                onClick={() => handleRejectInvite(notification)}
                disabled={processingIds.includes(notification._id)}
                className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {processingIds.includes(notification._id) ? 'İşleniyor...' : 'Reddet'}
              </button>
            </div>
          ) : status === 'accepted' ? (
            <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg inline-block">
              Bu daveti kabul ettiniz
            </div>
          ) : status === 'rejected' ? (
            <div className="px-4 py-2 bg-gray-600/20 text-gray-400 rounded-lg inline-block">
              Bu daveti reddettiniz
            </div>
          ) : null}
          
          <div className="flex flex-wrap gap-2">
            {senderId && (
              <button
                onClick={() => handleViewProfile(senderId)}
                className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
              >
                Profili Görüntüle
              </button>
            )}
            {teamId && (
              <button
                onClick={() => handleViewTeam(teamId)}
                className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
              >
                Takımı Görüntüle
              </button>
            )}
          </div>
        </div>
      );
    }
    
    // İlan başvurusu bildirimi
    if (type === 'advert_appeal') {
      // Başvuran ve ilan bilgilerini al
      const applicantName = data && data.applicantName ? data.applicantName : 
        (notification.sender ? 
          (typeof notification.sender === 'object' ? 
            `${notification.sender.name} ${notification.sender.surname}` : 'Birisi'
          ) : 'Birisi'
        );
      
      const advertTitle = data && data.advertTitle ? data.advertTitle : 'ilanınıza';
      
      const applicantId = data && data.applicantId ? data.applicantId : 
        (notification.sender ? 
          (typeof notification.sender === 'object' ? notification.sender._id : null) : null
        );
      
      const advertId = data && data.advertId ? data.advertId : null;
      const appealId = data && data.appealId ? data.appealId : null;
      
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{applicantName}</span>
            <span className="text-gray-400">
              <span className="font-medium text-white">"{advertTitle}"</span> ilanınıza başvurdu
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {applicantId && (
              <button
                onClick={() => handleViewProfile(applicantId)}
                className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
              >
                Profili Görüntüle
              </button>
            )}
            {advertId && (
              <button
                onClick={() => navigate(`/me/adverts/${advertId}`)}
                className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
              >
                İlanı Görüntüle
              </button>
            )}
          </div>
        </div>
      );
    }
    
    // Başvuru kabul edildi bildirimi
    if (type === 'appeal_approved') {
      // İlan ve takım bilgilerini al
      const advertTitle = data && data.advertTitle ? data.advertTitle : 'bir ilana';
      const teamName = data && data.teamName ? data.teamName : 
        (notification.teamId ? 
          (typeof notification.teamId === 'object' ? notification.teamId.name : 'bir takım') : 
          'bir takım'
        );
      
      const teamId = data && data.teamId ? data.teamId : 
        (notification.teamId ? 
          (typeof notification.teamId === 'object' ? notification.teamId._id : null) : 
          null
        );
      
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">
              <span className="font-medium text-white">"{advertTitle}"</span> ilanına yaptığınız başvuru kabul edildi.
            </span>
          </div>
          
          <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg inline-block">
            <span className="font-medium text-emerald-400">{teamName}</span> takımına katıldınız!
          </div>
          
          {teamId && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleViewTeam(teamId)}
                className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
              >
                Takımı Görüntüle
              </button>
            </div>
          )}
        </div>
      );
    }
    
    // Başvuru reddedildi bildirimi
    if (type === 'appeal_rejected') {
      // İlan bilgilerini al
      const advertTitle = data && data.advertTitle ? data.advertTitle : 'bir ilana';
      const advertId = data && data.advertId ? data.advertId : null;
      
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">
              <span className="font-medium text-white">"{advertTitle}"</span> ilanına yaptığınız başvuru reddedildi.
            </span>
          </div>
          
          <div className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg inline-block">
            Başvurunuz kabul edilmedi
          </div>
          
          {advertId && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate(`/adverts/${advertId}`)}
                className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
              >
                İlanı Görüntüle
              </button>
            </div>
          )}
        </div>
      );
    }
    
    // Diğer bildirim tipleri için içerik
    return <div className="text-gray-400">{notification.content || notification.message || 'Bildirim içeriği'}</div>;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sol Menü */}
          <div className="lg:sticky lg:top-20 lg:h-fit">
            <Menu />
          </div>

          {/* İçerik Alanı */}
          <div className="flex-1">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Bildirimler
                </h1>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={processingAll || notifications.length === 0 || notifications.every(n => n.read)}
                    className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {processingAll ? 'İşleniyor...' : 'Tümünü Okundu İşaretle'}
                  </button>
                  
                  <button
                    onClick={handleDeleteAll}
                    disabled={processingAll || notifications.length === 0}
                    className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {processingAll ? 'İşleniyor...' : 'Tümünü Sil'}
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-700/30">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    Henüz bildiriminiz bulunmuyor
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-6 hover:bg-gray-800/30 transition-colors ${
                        notification.read ? 'opacity-70' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Bildirim içeriği */}
                        <div className="flex-1">
                          {renderNotificationContent(notification)}
                          
                          <div className="mt-2 flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              {new Date(notification.createdAt).toLocaleString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification._id)}
                                disabled={processingIds.includes(notification._id)}
                                className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingIds.includes(notification._id)
                                  ? 'İşleniyor...'
                                  : 'Okundu olarak işaretle'}
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Okunmamış göstergesi */}
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications; 