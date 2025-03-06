import React from "react";
import Menu from "../components/Profile/Menu";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const MyAdverts = () => {
  const adverts = useSelector((state) => state.advert.myadverts);

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
                    İlanlarım
                  </h1>
                  <NavLink
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl transition-all duration-300 transform hover:scale-[1.02] font-medium text-white shadow-lg group"
                    to="/me/adverts/add"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Yeni İlan</span>
                  </NavLink>
                </div>
              </div>

              {/* İlanlar Listesi */}
              <div className="p-6">
                <div className="grid gap-6">
                  {adverts.length > 0 ? (
                    adverts.map((advert) => (
                      <div
                        key={advert._id}
                        className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-gray-700/50 hover:border-blue-500/30 transform hover:scale-[1.01] transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
                      >
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="space-y-3">
                            <h2 className="text-xl font-bold text-white group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                              {advert.title}
                            </h2>
                            
                            {/* Alanlar */}
                            <div className="flex flex-wrap gap-2">
                              {advert.fields?.map((field) => (
                                <span
                                  key={field}
                                  className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium"
                                >
                                  #{field}
                                </span>
                              ))}
                            </div>

                            <p className="text-gray-400 line-clamp-2">
                              {advert.description}
                            </p>
                          </div>

                          <div className="flex sm:flex-col gap-3 sm:min-w-[120px]">
                            <NavLink
                              to={`/advert/${advert._id}`}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500 hover:to-purple-600 border border-blue-500/20 hover:border-transparent rounded-lg text-blue-400 hover:text-white font-medium transition-all duration-300 group/button"
                            >
                              <span>Görüntüle</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover/button:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </NavLink>
                            <NavLink
                              to={`/me/adverts/${advert._id}`}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500 hover:to-teal-600 border border-emerald-500/20 hover:border-transparent rounded-lg text-emerald-400 hover:text-white font-medium transition-all duration-300"
                            >
                              Düzenle
                            </NavLink>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                      <p className="text-xl text-gray-400 font-medium">
                        Henüz bir ilan yayınlamadınız
                      </p>
                      <p className="text-gray-500 mt-2">
                        İlk ilanınızı oluşturmak için "Yeni İlan" butonuna tıklayın
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAdverts;
