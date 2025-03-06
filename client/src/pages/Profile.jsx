import React from "react";
import { useSelector } from "react-redux";
import Menu from "../components/Profile/Menu";

const Profile = () => {
  const teams = useSelector((state) => state.team.myteams);
  const user = useSelector((state) => state.user.user).user;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Belirtilmemiş";
      }
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return "Belirtilmemiş";
    }
  };

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
              {/* Profil Başlık */}
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-center gap-6">
                  {/* Profil Avatar */}
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {user.name[0].toUpperCase()}
                  </div>

                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {user.name} {user.surname}
                    </h1>
                    <p className="text-gray-400 mt-1">
                      Hoş geldin! Profil bilgilerini buradan yönetebilirsin.
                    </p>
                  </div>
                </div>
              </div>

              {/* Profil Detayları */}
              <div className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Email */}
                  <div className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Email Adresi</p>
                        <p className="text-white font-medium mt-1">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rol */}
                  <div className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Kullanıcı Rolü</p>
                        <p className="text-white font-medium mt-1 capitalize">{user.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Kayıt Tarihi */}
                  <div className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Kayıt Tarihi</p>
                        <p className="text-white font-medium mt-1">
                          {formatDate(user.createdAt)}
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

export default Profile;
