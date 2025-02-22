import React from "react";
import { useSelector } from "react-redux";
import Menu from "../components/Profile/Menu";

const MyTeams = () => {
  const teams = useSelector((state) => state.team.myleds);
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
          {/* Başlık */}
          <h1 className="text-3xl font-bold text-gray-100 mb-6 border-b pb-2">
            🚀 Takımlarım
          </h1>

          {/* Takımlar Listesi */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams?.map((team) => (
              <div
                key={team._id}
                className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg border border-gray-700 hover:scale-105 transition-transform"
              >
                {/* Takım İsmi */}
                <h2 className="text-xl font-bold text-gray-100">{team.name}</h2>

                {/* Takım ID */}
                <p className="text-gray-400 mt-2 text-sm">ID: {team._id}</p>
              </div>
            ))}
          </div>

          {/* Eğer Takım Yoksa */}
          {teams?.length === 0 && (
            <p className="text-center text-gray-400 mt-10 text-lg">
              Henüz bir takıma üye değilsiniz. İlk adımı atın! 🚀
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTeams;
