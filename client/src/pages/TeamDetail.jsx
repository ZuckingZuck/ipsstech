import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import TeamChat from './TeamChat';

const TeamDetail = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const teams = useSelector((state) => state.team.myteams) || [];
  const ledTeams = useSelector((state) => state.team.myleds) || [];
  const { socket, connected } = useSocket();
  
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'members', 'settings'
  const [onlineUsers, setOnlineUsers] = useState({});

  // Takım bilgilerini bul
  useEffect(() => {
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
    
    fetchTeamDetails();
  }, [teamId, user]);

  // Online kullanıcıları takip et
  useEffect(() => {
    if (!socket || !team) return;
    
    // Online kullanıcıları dinle
    socket.on('user_status', (data) => {
      setOnlineUsers(data);
    });
    
    // Takım odasına katıl
    socket.emit('join_team', { teamId });
    
    // Kullanıcı durumunu iste
    socket.emit('get_online_users', { teamId });
    
    return () => {
      socket.off('user_status');
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
                        <p className="text-emerald-400 text-xs">Takım Lideri</p>
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
                        <p className="text-gray-400 text-xs">Üye</p>
                      </div>
                    </div>
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
                          <button className="px-3 py-1 bg-red-500/10 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/20 transition-colors">
                            Çıkar
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
  );
};

export default TeamDetail; 