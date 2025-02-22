import React from "react";
import Menu from "../components/Profile/Menu";
import { NavLink } from "react-router-dom"; // Hatalı import düzeltildi
import { useSelector } from "react-redux";

const MyAdverts = () => {
  const adverts = useSelector((state) => state.advert.myadverts);

  return (
    <div className="bg-gray-900 text-white min-h-screen py-10">
      <div className="container mx-auto flex flex-col md:flex-row gap-10">
        {/* Sol Menü */}
        <div>
          <Menu />
        </div>

        {/* İçerik Alanı */}
        <div className="w-full md:w-3/4 bg-gray-800 p-6 rounded-lg shadow-lg">
          {/* Başlık ve Buton */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Adverts</h1>
            <NavLink
              className="bg-blue-600 hover:bg-blue-700 transition-all text-white px-4 py-2 rounded"
              to="/me/adverts/add"
            >
              + İlan Yayınla
            </NavLink>
          </div>

          {/* İlanlar Listesi */}
          <div className="flex flex-col gap-5">
            {adverts.length > 0 ? (
              adverts.map((advert) => (
                <div
                  key={advert._id}
                  className="bg-gray-700 p-4 rounded-lg shadow hover:shadow-lg transition-all"
                >
                  <h1 className="text-lg font-semibold">{advert.title}</h1>
                  <p className="text-gray-300">{advert.description}</p>
                  <NavLink
                    className="bg-blue-500 hover:bg-blue-600 transition-all text-white px-3 py-1 rounded mt-2 inline-block"
                    to={`/me/adverts/${advert._id}`}
                  >
                    Detay
                  </NavLink>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400">
                <span>Henüz bir ilan yayınlamadınız.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAdverts;
