import React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router";

const Adverts = () => {
  const adverts = useSelector((state) => state.advert.adverts);

  return (
    <div className="bg-gray-900 text-white min-h-screen py-10">
      <div className="container mx-auto">
        {/* Başlık */}
        <div className="text-4xl font-extrabold text-center text-gray-100 mb-6">
          Takım Arkadaşı İlanları
        </div>

        {/* İlanlar Listesi */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adverts?.map((advert) => (
            <div
              key={advert._id}
              className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-2xl shadow-lg border border-gray-700 hover:scale-105 transition-transform flex flex-col"
            >
              {/* İlan Başlığı */}
              <h1 className="text-xl font-bold text-gray-100">{advert.title}</h1>

              {/* Alanlar */}
              <div className="mt-2 flex flex-wrap gap-2">
                {advert?.fields?.map((field) => (
                  <span
                    key={field}
                    className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full shadow-md"
                  >
                    #{field}
                  </span>
                ))}
              </div>

              {/* Takım & Açıklama */}
              <p className="text-gray-400 mt-3">
                <span className="font-semibold text-gray-300">Takım:</span> {advert.teamId.name}
              </p>
              <p className="text-gray-300 mt-2 flex-grow">{advert.description}</p>

              {/* Takım Lideri */}
              <p className="text-gray-400 mt-3">
                <span className="font-semibold text-gray-300">Takım Lideri:</span>{" "}
                {advert.owner.name} {advert.owner.surname}
              </p>

              {/* Detay Linki (Altta Sabit) */}
              <div className="mt-auto pt-5 text-center">
                <NavLink
                  to={`/advert/${advert._id}`}
                  className="bg-blue-700 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md transition-all block"
                >
                  Detaylı İncele →
                </NavLink>
              </div>
            </div>
          ))}
        </div>

        {/* İlan Yoksa Mesaj */}
        {adverts?.length === 0 && (
          <p className="text-center text-gray-400 mt-10 text-lg">
            Şu an hiç ilan yok. İlk ilanı sen oluştur!
          </p>
        )}
      </div>
    </div>
  );
};

export default Adverts;
