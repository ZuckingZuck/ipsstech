import React from "react";
import { NavLink } from "react-router-dom";

const Menu = () => {
  return (
    <div className="bg-gray-900 bg-opacity-50 backdrop-blur-lg p-6 rounded-2xl shadow-2xl w-64 border border-gray-700">
      <ul className="flex flex-col gap-4">
        <li>
          <NavLink
            to="/me"
            className="block px-6 py-3 text-lg font-semibold text-gray-300 hover:text-white bg-gray-800 bg-opacity-60 hover:bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105"
          >
            👤 Profilim
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/me/teams"
            className="block px-6 py-3 text-lg font-semibold text-gray-300 hover:text-white bg-gray-800 bg-opacity-60 hover:bg-gradient-to-r from-green-500 to-teal-600 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105"
          >
            👥 Takımlarım
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/me/memberships"
            className="block px-6 py-3 text-lg font-semibold text-gray-300 hover:text-white bg-gray-800 bg-opacity-60 hover:bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105"
          >
            🔑 Üyeliklerim
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/me/adverts"
            className="block px-6 py-3 text-lg font-semibold text-gray-300 hover:text-white bg-gray-800 bg-opacity-60 hover:bg-gradient-to-r from-red-500 to-pink-600 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105"
          >
            📢 İlanlarım
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Menu;
