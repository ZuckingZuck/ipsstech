import React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import Menu from "../components/Profile/Menu";

const MyMemberships = () => {
  const teams = useSelector((state) => state.team.myteams);

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
              {/* Başlık ve Buton */}
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Üyeliklerim
                  </h1>
                  <NavLink
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 rounded-xl transition-all duration-300 transform hover:scale-[1.02] font-medium text-white shadow-lg group"
                    to="/teams"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Takım Ara</span>
                  </NavLink>
                </div>
              </div>

              {/* Takımlar Listesi */}
              <div className="p-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teams?.map((team) => (
                    <div
                      key={team._id}
                      className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-gray-700/50 hover:border-yellow-500/30 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/10"
                    >
                      <div className="space-y-4">
                        {/* Takım Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                          {team.name[0].toUpperCase()}
                        </div>

                        {/* Takım Bilgileri */}
                        <div>
                          <h2 className="text-xl font-bold text-white group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                            {team.name}
                          </h2>
                          <p className="text-gray-400 text-sm mt-1">
                            {team.members?.length || 0} Üye
                          </p>
                        </div>

                        {/* Butonlar */}
                        <div className="flex gap-3 pt-2">
                          <NavLink
                            to={`/team/${team._id}`}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 hover:from-yellow-500 hover:to-orange-600 border border-yellow-500/20 hover:border-transparent rounded-lg text-yellow-400 hover:text-white font-medium transition-all duration-300 group/button"
                          >
                            <span>Görüntüle</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover/button:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </NavLink>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Üyelik Yoksa */}
                {(!teams || teams.length === 0) && (
                  <div className="text-center py-20 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <p className="text-xl text-gray-400 font-medium">
                      Henüz bir takıma üye değilsiniz
                    </p>
                    <p className="text-gray-500 mt-2">
                      Yeni bir takıma katılmak için "Takım Ara" butonuna tıklayın
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

export default MyMemberships;
