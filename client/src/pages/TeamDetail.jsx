import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import TeamChat from './TeamChat';
import { toast } from 'react-toastify';

const TeamDetail = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const teams = useSelector((state) => state.team.myteams) || [];
  const ledTeams = useSelector((state) => state.team.myleds) || [];
  const { socket, connected, setActiveTeam, fetchUnreadCounts } = useSocket();
  
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'members', 'settings'
  const [onlineUsers, setOnlineUsers] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [removingMember, setRemovingMember] = useState(null); // Çıkarılmakta olan üyenin ID'si
  const [confirmModal, setConfirmModal] = useState({ show: false, memberId: null, memberName: '' });

  // Aktif takımı ayarla
  useEffect(() => {
    if (teamId) {
      setActiveTeam(teamId);
    }
    
    return () => {
      // Bileşen kaldırıldığında aktif takımı temizle
      setActiveTeam(null);
    };
  }, [teamId, setActiveTeam]);

  // Sayfa yüklendiğinde okunmamış mesaj sayısını güncelle
  useEffect(() => {
    if (user && user.token) {
      // Sayfa yüklendiğinde bir kez çağır
      fetchUnreadCounts();
    }
  }, [user, fetchUnreadCounts]);

  // Takım bilgilerini getir
  const fetchTeamDetails = async () => {
    if (!teamId || !user || !user.token) return;
    
    try {
      setLoading(true);
      
      // Takım bilgilerini API'den getir
      const teamResponse = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/team/${teamId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      
      if (teamResponse.status === 200) {
        setTeam(teamResponse.data);
        
        // Takım üyelerini getir
        const membersResponse = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/team/${teamId}/members`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          }
        );
        
        if (membersResponse.status === 200) {
          setMembers(membersResponse.data);
        }
      }
    } catch (err) {
      console.error('Takım bilgileri alınamadı:', err);
      setError('Takım bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Takım bilgilerini yükle
  useEffect(() => {
    fetchTeamDetails();
  }, [teamId, user]);

  // Online kullanıcıları takip et
  useEffect(() => {
    if (!socket || !team) return;
    
    // Online kullanıcıları dinle
    socket.on('user_status', (data) => {
      setOnlineUsers(data);
    });
    
    // Yazıyor durumunu dinle
    socket.on('user_typing', (data) => {
      if (data.teamId === teamId) {
        setTypingUsers(prev => ({
          ...prev,
          [data.userId]: data.isTyping
        }));
        
        // 3 saniye sonra yazıyor durumunu otomatik olarak kapat
        if (data.isTyping) {
          setTimeout(() => {
            setTypingUsers(prev => ({
              ...prev,
              [data.userId]: false
            }));
          }, 3000);
        }
      }
    });
    
    // Takım odasına katıl
    socket.emit('join_team', { teamId });
    
    // Kullanıcı durumunu iste
    socket.emit('get_online_users', { teamId });
    
    return () => {
      socket.off('user_status');
      socket.off('user_typing');
      socket.emit('leave_team', { teamId });
    };
  }, [socket, team, teamId]);

  // Kullanıcının takım lideri olup olmadığını kontrol et
  const isTeamLeader = useMemo(() => {
    if (!team || !user || !user.user) return false;
    
    // Takım lideri ID'si string ise
    if (typeof team.leader === 'string') {
      return team.leader === user.user._id;
    }
    
    // Takım lideri bir obje ise
    if (team.leader && team.leader._id) {
      return team.leader._id === user.user._id;
    }
    
    return false;
  }, [team, user]);

  // Üye çıkarma işlevi
  const handleRemoveMember = async (memberId) => {
    if (!teamId || !user || !user.token) return;
    
    try {
      setRemovingMember(memberId);
      
      const response = await axios.delete(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/team/${teamId}/members/${memberId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      
      // Modalı kapat
      setConfirmModal({ show: false, memberId: null, memberName: '' });
      
      if (response.status === 200) {
        // Başarı mesajı göster
        toast.success('Üye takımdan başarıyla çıkarıldı');
        
        // Üyeyi listeden kaldır (UI'ı hemen güncellemek için)
        setMembers(prev => prev.filter(member => member._id !== memberId));
        
        // Takım bilgilerini güncelle (biraz gecikme ile)
        setTimeout(() => {
          fetchTeamDetails();
        }, 500);
      }
    } catch (error) {
      console.error('Üye çıkarma hatası:', error);
      
      // Modalı kapat
      setConfirmModal({ show: false, memberId: null, memberName: '' });
      
      // Hata mesajı göster
      const errorMessage = error.response?.data?.error || 'Üye çıkarma işlemi sırasında bir hata oluştu';
      toast.error(errorMessage);
    } finally {
      setRemovingMember(null);
    }
  };

  // Üye çıkarma onay modalını göster
  const showRemoveConfirmation = (member) => {
    setConfirmModal({
      show: true,
      memberId: member._id,
      memberName: `${member.name} ${member.surname}`
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30">
            {error || 'Takım bulunamadı'}
          </div>
          <button
            onClick={() => navigate('/me/teams')}
            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Takımlarıma Dön
          </button>
        </div>
      </div>
    );
  }

  // Takım liderini bul
  const teamLeader = members.find(member => {
    if (typeof team.leader === 'string') {
      return member._id === team.leader;
    } else if (team.leader && team.leader._id) {
      return member._id === team.leader._id;
    }
    return false;
  });

  // Takım üyelerini bul (lider hariç)
  const teamMembers = members.filter(member => {
    if (typeof team.leader === 'string') {
      return member._id !== team.leader;
    } else if (team.leader && team.leader._id) {
      return member._id !== team.leader._id;
    }
    return true;
  });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12">
        <div className="container mx-auto px-4">
          {/* Takım Başlığı */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden mb-6">
            <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {team.name[0].toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {team.name}
                  </h1>
                  <p className="text-gray-400 mt-1">
                    {members.length} Üye • {isTeamLeader ? 'Takım Lideri' : 'Üye'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'chat'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Sohbet
                </button>
                <button
                  onClick={() => setActiveTab('members')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'members'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Üyeler
                </button>
                {isTeamLeader && (
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      activeTab === 'settings'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Ayarlar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* İçerik Alanı */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sol Kenar - Üye Listesi */}
            <div className="lg:w-1/4">
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700/50">
                  <h2 className="text-lg font-semibold text-white">Takım Üyeleri</h2>
                </div>
                <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                  {/* Takım Lideri */}
                  {teamLeader && (
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                            {teamLeader.name ? teamLeader.name[0].toUpperCase() : '?'}
                          </div>
                          {onlineUsers[teamLeader._id] && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {teamLeader.name} {teamLeader.surname}
                          </p>
                          <div className="flex items-center">
                            <p className="text-emerald-400 text-xs">Takım Lideri</p>
                            {typingUsers[teamLeader._id] && (
                              <div className="ml-2 flex items-center">
                                <span className="text-emerald-400 text-xs italic flex items-center">
                                  <div className="flex space-x-1 mr-1">
                                    <div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                  </div>
                                  yazıyor
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Takım Üyeleri */}
                  {teamMembers.map(member => (
                    <div key={member._id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl hover:bg-gray-700/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {member.name ? member.name[0].toUpperCase() : '?'}
                          </div>
                          {onlineUsers[member._id] && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {member.name} {member.surname}
                          </p>
                          <div className="flex items-center">
                            <p className="text-gray-400 text-xs">Üye</p>
                            {typingUsers[member._id] && (
                              <div className="ml-2 flex items-center">
                                <span className="text-gray-400 text-xs italic flex items-center">
                                  <div className="flex space-x-1 mr-1">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                  </div>
                                  yazıyor
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {isTeamLeader && member._id !== user.user._id && (
                        <button 
                          className="text-red-400 hover:text-red-300 transition-colors"
                          onClick={() => showRemoveConfirmation(member)}
                          disabled={removingMember === member._id}
                          title="Üyeyi takımdan çıkar"
                        >
                          {removingMember === member._id ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {members.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      Henüz üye bulunmuyor
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Sağ Kenar - İçerik */}
            <div className="lg:w-3/4">
              {activeTab === 'chat' && (
                <TeamChat teamId={teamId} team={team} isTeamLeader={isTeamLeader} />
              )}
              
              {activeTab === 'members' && (
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Takım Üyeleri</h2>
                    
                    <div className="space-y-4">
                      {members.map(member => (
                        <div key={member._id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {member.name ? member.name[0].toUpperCase() : '?'}
                            </div>
                            <div>
                              <p className="text-white font-medium text-lg">
                                {member.name} {member.surname}
                              </p>
                              <p className="text-gray-400">
                                {(typeof team.leader === 'string' && member._id === team.leader) || 
                                 (team.leader && team.leader._id && member._id === team.leader._id) 
                                  ? 'Takım Lideri' : 'Üye'}
                              </p>
                            </div>
                          </div>
                          
                          {isTeamLeader && member._id !== user.user._id && (
                            <button 
                              className="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/20 transition-colors"
                              onClick={() => showRemoveConfirmation(member)}
                              disabled={removingMember === member._id}
                            >
                              {removingMember === member._id ? (
                                <span className="flex items-center">
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Çıkarılıyor...
                                </span>
                              ) : (
                                'Çıkar'
                              )}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'settings' && isTeamLeader && (
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Takım Ayarları</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-gray-300 mb-2">Takım Adı</label>
                        <input
                          type="text"
                          defaultValue={team.name}
                          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 mb-2">Takım Açıklaması</label>
                        <textarea
                          defaultValue={team.description}
                          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[100px]"
                        ></textarea>
                      </div>
                      
                      <div className="flex justify-end">
                        <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl transition-all duration-300">
                          Değişiklikleri Kaydet
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Üye Çıkarma Onay Modalı */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Üyeyi Çıkar</h3>
            <p className="text-gray-300 mb-6">
              <span className="font-semibold text-white">{confirmModal.memberName}</span> adlı üyeyi takımdan çıkarmak istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                onClick={() => setConfirmModal({ show: false, memberId: null, memberName: '' })}
                disabled={removingMember !== null}
              >
                İptal
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                onClick={() => {
                  if (confirmModal.memberId) {
                    handleRemoveMember(confirmModal.memberId);
                  }
                }}
                disabled={removingMember !== null}
              >
                {removingMember === confirmModal.memberId ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Çıkarılıyor...
                  </span>
                ) : (
                  'Evet, Çıkar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeamDetail; 