import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import axios from "axios";
import { useSelector } from "react-redux";
import Menu from "../components/Profile/Menu";
import AdvertMenu from "../components/Advert/AdvertMenu";
import { toast } from "react-toastify";

const MyAdvertDetail = () => {
  const { id } = useParams();
  const user = useSelector((state) => state.user.user);
  const [advert, setAdvert] = useState();
  const [appeals, setAppeals] = useState();

  const fetchAdvert = async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_API_URL}/api/advert/myadvert/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }
    );
    if (response.status === 200) {
      console.log("buresposne", response.data);
      setAdvert(response.data.advert);
      setAppeals(response.data.appeals)
    }
  };

  const handleAppeal = async (aId, action) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/advert/appeal/${action}/${aId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
  
      if (response.status === 200) {
        toast.success(
          action === "approve" ? "Başvuru kabul edildi!" : "Başvuru reddedildi!"
        );
  
        if (action === "approve") {
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      }
    } catch (error) {
      console.error(
        `Başvuru ${action === "approve" ? "kabul" : "red"} etme hatası:`,
        error
      );
      toast.error(`${action === "approve" ? "Kabul" : "Red"} sırasında bir hata oluştu!`);
    }
  };
  useEffect(() => {
    fetchAdvert();
  }, []);

  // "Waiting" olan başvuruları ve olmayanları ayırıyoruz
  const waitingAppeals = appeals?.filter(appeal => appeal.status === "Waiting");
  const nonWaitingAppeals = appeals?.filter(appeal => appeal.status !== "Waiting");

  if (!advert) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

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
            <div className="space-y-6">
              {/* İlan Detayları */}
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl p-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                  {advert.title}
                </h1>
                
                <p className="text-lg text-gray-300 mb-6">
                  Takım: <span className="text-white font-semibold">{advert.teamId.name}</span>
                </p>

                {/* Alanlar */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {advert.fields.map((field) => (
                    <span
                      key={field}
                      className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium"
                    >
                      #{field}
                    </span>
                  ))}
                </div>

                {/* Yetenekler */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {advert.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium"
                    >
                      #{skill}
                    </span>
                  ))}
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed">{advert.description}</p>
                
                <div className="flex items-center gap-3 text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>
                    Takım Lideri: <span className="text-white font-medium">{advert.owner.name} {advert.owner.surname}</span>
                  </span>
                </div>
              </div>

              {/* Bekleyen Başvurular */}
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl p-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
                  Bekleyen Başvurular
                </h2>
                <div className="space-y-4">
                  {waitingAppeals && waitingAppeals.length > 0 ? (
                    waitingAppeals.map((appeal) => (
                      <div
                        key={appeal.id}
                        className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-3">
                            <h3 className="text-xl font-bold text-white group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                              {appeal.applicant.name} {appeal.applicant.surname}
                            </h3>
                            <p className="text-gray-300">{appeal.extra}</p>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-sm font-medium">
                                {appeal.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAppeal(appeal._id, "approve")}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500 hover:to-teal-600 border border-emerald-500/20 hover:border-transparent rounded-lg text-emerald-400 hover:text-white font-medium transition-all duration-300"
                            >
                              Kabul Et
                            </button>
                            <button
                              onClick={() => handleAppeal(appeal._id, "reject")}
                              className="px-4 py-2 bg-gradient-to-r from-rose-500/10 to-pink-500/10 hover:from-rose-500 hover:to-pink-600 border border-rose-500/20 hover:border-transparent rounded-lg text-rose-400 hover:text-white font-medium transition-all duration-300"
                            >
                              Reddet
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">Henüz bekleyen başvuru bulunmuyor.</p>
                  )}
                </div>
              </div>

              {/* Geçmiş Başvurular */}
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl p-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
                  Geçmiş Başvurular
                </h2>
                <div className="space-y-4">
                  {nonWaitingAppeals && nonWaitingAppeals.length > 0 ? (
                    nonWaitingAppeals.map((appeal) => (
                      <div
                        key={appeal.id}
                        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-gray-700/50"
                      >
                        <div className="space-y-3">
                          <h3 className="text-xl font-bold text-white">
                            {appeal.applicant.name} {appeal.applicant.surname}
                          </h3>
                          <p className="text-gray-300">{appeal.extra}</p>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              appeal.status === "Accepted" 
                                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                            }`}>
                              {appeal.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">Henüz geçmiş başvuru bulunmuyor.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Menü */}
          <div className="lg:sticky lg:top-20 lg:h-fit">
            <AdvertMenu />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAdvertDetail;
