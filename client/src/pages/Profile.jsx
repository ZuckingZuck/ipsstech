import React from "react";
import { useSelector } from "react-redux";
import Menu from "../components/Profile/Menu";

const Profile = () => {
  const teams = useSelector((state) => state.team.myteams);
  const user = useSelector((state) => state.user.user).user;
  console.log("myteams:", teams);

  return (
    <div className="bg-gray-900 text-white min-h-screen py-10">
      <div className="container mx-auto flex gap-10">
        {/* Sol Menü */}
        <div>
          <Menu />
        </div>

        {/* Sağ İçerik */}
        <div className="w-3/4">
          {/* Profil Başlık */}
          <h1 className="text-3xl font-bold text-gray-100 mb-6 border-b pb-2">
            {user.name} {user.surname}'s Profile
          </h1>

          <p className="text-gray-400 mt-2">
            Hoş geldin, <span className="text-white font-semibold">{user.name}!</span>
            Profil bilgilerini buradan yönetebilirsin.
          </p>

          {/* Profil Detayları */}
          <div className="mt-6 space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg shadow-md">
              <span className="text-gray-300">📧 Email:</span>{" "}
              <span className="text-white">{user.email}</span>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg shadow-md">
              <span className="text-gray-300">📅 Kayıt Tarihi:</span>{" "}
              <span className="text-white">{user.createdAt}</span>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg shadow-md">
              <span className="text-gray-300">🎭 Rol:</span>{" "}
              <span className="text-white capitalize">{user.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
