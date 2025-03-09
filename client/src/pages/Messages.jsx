import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import Menu from '../components/Profile/Menu';
import { useSocket } from '../context/SocketContext';

const Messages = () => {
  const user = useSelector((state) => state.user.user);
  const teams = useSelector((state) => state.team.myteams) || [];
  const ledTeams = useSelector((state) => state.team.myleds) || [];
  const { teamUnreadCounts, fetchUnreadCounts } = useSocket();
  const [allTeams, setAllTeams] = useState([]);

  // Tüm takımları birleştir
  useEffect(() => {
    const combined = [...(teams || []), ...(ledTeams || [])];
    setAllTeams(combined);
  }, [teams, ledTeams]);

  // Sayfa yüklendiğinde okunmamış mesaj sayısını güncelle
  useEffect(() => {
    fetchUnreadCounts();
  }, [fetchUnreadCounts]);

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
              {/* Başlık */}
              <div className="p-6 border-b border-gray-700/50">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Takım Sohbetleri
                </h1>
                <p className="text-gray-400 mt-2">
                  Takımlarınızla mesajlaşmak için bir takım seçin
                </p>
              </div>

              {/* Takımlar Listesi */}
              <div className="p-6">
                <div className="space-y-4">
                  {allTeams.map((team) => (
                    <NavLink
                      key={team._id}
                      to={`/team/${team._id}`}
                      className="block bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-xl border border-gray-700/50 hover:border-emerald-500/30 transform hover:scale-[1.01] transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Takım Avatar */}
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                            {team.name[0].toUpperCase()}
                          </div>

                          {/* Takım Bilgileri */}
                          <div>
                            <h2 className="text-xl font-bold text-white">
                              {team.name}
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">
                              {team.members?.length || 0} Üye
                              {user && user.user && team.leader && typeof team.leader === 'string' && team.leader === user.user._id && ' • Takım Lideri'}
                              {user && user.user && team.leader && team.leader._id && team.leader._id === user.user._id && ' • Takım Lideri'}
                            </p>
                          </div>
                        </div>

                        {/* Okunmamış Mesaj Sayısı */}
                        {teamUnreadCounts[team._id] > 0 && (
                          <div className="bg-red-500 text-white text-xs font-bold rounded-full h-6 min-w-6 px-2 flex items-center justify-center">
                            {teamUnreadCounts[team._id]}
                          </div>
                        )}
                      </div>
                    </NavLink>
                  ))}
                </div>

                {/* Takım Yoksa */}
                {allTeams.length === 0 && (
                  <div className="text-center py-20 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-xl text-gray-400 font-medium">
                      Henüz bir takımınız yok
                    </p>
                    <p className="text-gray-500 mt-2">
                      Mesajlaşmak için önce bir takıma katılmalısınız
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages; 