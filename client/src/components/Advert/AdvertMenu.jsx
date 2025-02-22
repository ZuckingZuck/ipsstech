import React from "react";
import { NavLink } from "react-router-dom";

const AdvertMenu = () => {
  return (
    <div className="bg-gray-900 bg-opacity-50 backdrop-blur-lg p-6 rounded-2xl shadow-2xl w-64 border border-gray-700">
      <h2 className="text-xl font-bold text-gray-200 mb-4">İlan Seçenekleri</h2>
      <ul className="flex flex-col gap-4">
        <li>
          <NavLink
            to="/me"
            className="flex items-center gap-3 px-6 py-3 text-lg font-semibold text-gray-300 hover:text-white bg-gray-800 bg-opacity-60 hover:bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105"
          >
            🔧 Düzenle
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/me/teams"
            className="flex items-center gap-3 px-6 py-3 text-lg font-semibold text-gray-300 hover:text-white bg-gray-800 bg-opacity-60 hover:bg-gradient-to-r from-red-500 to-pink-600 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105"
          >
            🗑️ Sil
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default AdvertMenu;
