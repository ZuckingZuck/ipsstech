import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSocket } from "../../context/SocketContext";

const Menu = () => {
  const user = useSelector((state) => state.user.user);
  
  const menuItems = [
    {
      path: "/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      title: "Ana Sayfa",
      gradient: "from-blue-500 to-purple-600",
      hoverGradient: "from-blue-600 to-purple-700",
    },
    {
      path: "/me",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: "Profilim",
      gradient: "from-emerald-500 to-teal-600",
      hoverGradient: "from-emerald-600 to-teal-700",
    },
    {
      path: "/me/teams",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Takımlarım",
      gradient: "from-cyan-500 to-blue-600",
      hoverGradient: "from-cyan-600 to-blue-700",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-xl w-72">
      {user && (
        <div className="mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {user.user && user.user.name ? user.user.name[0].toUpperCase() : '?'}
          </div>
          <div>
            <h3 className="text-white font-semibold">
              {user.user && user.user.name ? `${user.user.name} ${user.user.surname}` : 'Kullanıcı'}
            </h3>
            <p className="text-gray-400 text-sm">
              {user.user && user.user.email}
            </p>
          </div>
        </div>
      )}
      
      <nav className="space-y-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                isActive 
                ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg` 
                : `bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:${item.hoverGradient} hover:shadow-lg`
              }`
            }
          >
            <div className="p-2 rounded-lg transition-all duration-300 bg-gray-700/50 group-hover:bg-white/10">
              {item.icon}
            </div>
            <span className="font-medium">{item.title}</span>
            
            {/* Bildirim rozeti */}
            {item.badge && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Menu; 