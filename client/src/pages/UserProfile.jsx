import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSocket } from '../context/SocketContext';
import Menu from '../components/Profile/Menu';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const ledTeams = useSelector((state) => state.team.myleds) || [];
  const { getUserProfile, sendTeamInvite } = useSocket();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [sending, setSending] = useState(false);
  
  // Kullanıcı profili getir
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId || !user || !user.token) return;
      
      try {
        setLoading(true);
        
        const profileData = await getUserProfile(userId);
        
        if (profileData) {
          setProfile(profileData);
        } else {
          setError('Kullanıcı profili bulunamadı');
        }
      } catch (err) {
        console.error('Kullanıcı profili alınamadı:', err);
        setError('Kullanıcı profili yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [userId, user, getUserProfile]);

  // Takım daveti gönder
  const handleSendInvite = () => {
    if (!selectedTeam || !userId || !user || !user.user) {
      console.error("Davet gönderme hatası: Eksik bilgi", { selectedTeam, userId, user });
      return;
    }
    
    setSending(true);
    console.log("Davet gönderiliyor:", { userId, selectedTeam, senderId: user.user._id });
    
    // Takım daveti gönder
    sendTeamInvite(userId, selectedTeam)
      .then((result) => {
        console.log("Davet gönderme sonucu:", result);
        // Başarılı olduğunda
        setTimeout(() => {
          setSending(false);
          setSelectedTeam('');
        }, 1500);
      })
      .catch((error) => {
        // Hata durumunda
        console.error("Davet gönderme hatası:", error);
        setSending(false);
      });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sol Menü */}
            <div className="lg:sticky lg:top-20 lg:h-fit">
              <Menu />
            </div>

            {/* İçerik Alanı */}
            <div className="flex-1 flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !profile) {
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
                <div className="p-6 text-center">
                  <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30">
                    {error || 'Kullanıcı profili bulunamadı'}
                  </div>
                  <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Geri Dön
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
              {/* Profil Başlığı */}
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profile.name ? profile.name[0].toUpperCase() : '?'}
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {profile.name} {profile.surname}
                    </h1>
                    <p className="text-gray-400 mt-1">
                      {profile.email}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Profil İçeriği */}
              <div className="p-6">
                {/* Takım Daveti Gönderme */}
                {ledTeams.length > 0 && userId !== user.user._id && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">Takıma Davet Et</h2>
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <label className="block text-gray-400 mb-2">Takım Seçin</label>
                          <select
                            value={selectedTeam}
                            onChange={(e) => setSelectedTeam(e.target.value)}
                            className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            disabled={sending}
                          >
                            <option value="">Takım seçin</option>
                            {ledTeams.map(team => (
                              <option key={team._id} value={team._id}>{team.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={handleSendInvite}
                            disabled={!selectedTeam || sending}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                          >
                            {sending ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Davet Gönderiliyor...
                              </span>
                            ) : (
                              'Davet Gönder'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Kullanıcı Bilgileri */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">Kullanıcı Bilgileri</h2>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400">Ad</p>
                        <p className="text-white font-medium">{profile.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Soyad</p>
                        <p className="text-white font-medium">{profile.surname}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">E-posta</p>
                        <p className="text-white font-medium">{profile.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Kayıt Tarihi</p>
                        <p className="text-white font-medium">
                          {new Date(profile.createdAt).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 