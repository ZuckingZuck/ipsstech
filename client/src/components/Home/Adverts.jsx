import React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router";

const Adverts = () => {
  const adverts = useSelector((state) => state.advert.adverts);

  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Başlık Bölümü */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 bg-clip-text text-transparent animate-gradient mb-4">
            Takım Arkadaşı İlanları
          </h1>
          <p className="text-gray-400 text-lg">
            Yeteneklerinizi sergileyebileceğiniz projeleri keşfedin ve hayalinizdeki takıma katılın
          </p>
        </div>

        {/* İlanlar Listesi */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {adverts?.map((advert) => (
            <div
              key={advert._id}
              className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 hover:border-blue-500/30 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
            >
              {/* İlan Başlığı */}
              <h2 className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text group-hover:text-transparent transition-all duration-300">
                {advert.title}
              </h2>

              {/* Alanlar */}
              <div className="flex flex-wrap gap-2 mb-6">
                {advert?.fields?.map((field) => (
                  <span
                    key={field}
                    className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium hover:border-blue-500/40 transition-all duration-300"
                  >
                    #{field}
                  </span>
                ))}
              </div>

              {/* Takım Bilgisi */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-2 text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">{advert.teamId.name}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{advert.owner.name} {advert.owner.surname}</span>
                </div>
              </div>

              {/* Açıklama */}
              <p className="text-gray-400 mb-8 line-clamp-3">
                {advert.description}
              </p>

              {/* Detay Butonu */}
              <div className="mt-auto">
                <NavLink
                  to={`/advert/${advert._id}`}
                  className="group/button flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500 hover:to-purple-600 border border-blue-500/20 hover:border-transparent rounded-xl text-blue-400 hover:text-white font-medium transition-all duration-300"
                >
                  <span>Detaylı İncele</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover/button:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </NavLink>
              </div>
            </div>
          ))}
        </div>

        {/* İlan Yoksa Mesaj */}
        {adverts?.length === 0 && (
          <div className="text-center py-20 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-xl text-gray-400 font-medium">
              Şu an hiç ilan yok.
            </p>
            <p className="text-gray-500 mt-2">
              İlk ilanı oluşturmak için harika bir fırsat!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Adverts;
