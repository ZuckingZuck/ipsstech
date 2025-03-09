import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSocket } from "../../context/SocketContext";

const Menu = () => {
  const { teamUnreadCounts } = useSocket();
  
  // Toplam okunmamış mesaj sayısını hesapla
  const totalUnread = Object.values(teamUnreadCounts || {}).reduce((sum, count) => sum + count, 0);
  
  const menuItems = [
    {
      path: "/me",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: "Profilim",
      gradient: "from-blue-500 to-purple-600",
      hoverGradient: "from-blue-600 to-purple-700",
    },
    {
      path: "/me/messages",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      title: "Mesajlar",
      badge: totalUnread > 0 ? totalUnread : null,
      gradient: "from-cyan-500 to-blue-600",
      hoverGradient: "from-cyan-600 to-blue-700",
    },
    {
      path: "/me/teams",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Takımlarım",
      gradient: "from-emerald-500 to-teal-600",
      hoverGradient: "from-emerald-600 to-teal-700",
    },
    {
      path: "/me/memberships",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
      title: "Üyeliklerim",
      gradient: "from-yellow-500 to-orange-600",
      hoverGradient: "from-yellow-600 to-orange-700",
    },
    {
      path: "/me/adverts",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      title: "İlanlarım",
      gradient: "from-pink-500 to-rose-600",
      hoverGradient: "from-pink-600 to-rose-700",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-xl w-72">
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
