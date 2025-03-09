import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import { useSelector } from "react-redux";
import Menu from "../components/Profile/Menu";
import AdvertMenu from "../components/Advert/AdvertMenu";
import { toast } from "react-toastify";

const MyAdvertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const [advert, setAdvert] = useState();
  const [appeals, setAppeals] = useState();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchAdvert = async () => {
    try {
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
    } catch (error) {
      console.error("İlan detayları alınamadı:", error);
      toast.error("İlan detayları alınırken bir hata oluştu");
    }
  };

  const handleAppeal = async (aId, action) => {
    try {
      console.log(`Başvuru ${action} isteği gönderiliyor:`, aId);
      
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/advert/appeal/${action}/${aId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
  
      if (response.status === 200) {
        console.log(`Başvuru ${action} yanıtı:`, response.data);
        
        toast.success(
          action === "approve" ? "Başvuru kabul edildi!" : "Başvuru reddedildi!"
        );
  
        // Sayfayı yenilemek yerine verileri tekrar çekelim
        await fetchAdvert();
      }
    } catch (error) {
      console.error(
        `Başvuru ${action === "approve" ? "kabul" : "red"} etme hatası:`,
        error
      );
      toast.error(`${action === "approve" ? "Kabul" : "Red"} sırasında bir hata oluştu!`);
    }
  };
  
  const handleDeleteAdvert = async () => {
    if (!advert || !user || !user.token) return;
    
    setLoading(true);
    
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/advert/${advert._id}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      
      if (response.status === 200) {
        toast.success("İlan başarıyla silindi");
        navigate('/me/adverts');
      }
    } catch (error) {
      console.error("İlan silme hatası:", error);
      toast.error(error.response?.data?.error || "İlan silinirken bir hata oluştu");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
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
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {advert.title}
                  </h1>
                  
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-lg text-gray-300 mb-6">
                  Takım: <span className="text-white font-semibold">{advert.teamId.name}</span>
                </p>

                {/* Alanlar */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {advert.fields.map((field) => (
                    <span
                      key={field}
                      className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm font-medium"
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
                      className="px-3 py-1 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm font-medium"
                    >
                      #{skill}
                    </span>
                  ))}
                </div>

                {/* Açıklama */}
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <h2 className="text-xl font-bold text-white mb-2">Açıklama</h2>
                  <p className="text-gray-300 whitespace-pre-wrap">{advert.description}</p>
                </div>
              </div>

              {/* Bekleyen Başvurular */}
              {waitingAppeals && waitingAppeals.length > 0 && (
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl p-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                    Bekleyen Başvurular
                  </h2>

                  <div className="space-y-4">
                    {waitingAppeals.map((appeal) => (
                      <div
                        key={appeal._id}
                        className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {appeal.applicant?.name} {appeal.applicant?.surname}
                          </h3>
                          <p className="text-gray-400">{appeal.applicant?.email}</p>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                          <button
                            onClick={() => handleAppeal(appeal._id, "approve")}
                            className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500 hover:to-teal-600 border border-emerald-500/20 hover:border-transparent rounded-lg text-emerald-400 hover:text-white font-medium transition-all duration-300"
                          >
                            Kabul Et
                          </button>
                          <button
                            onClick={() => handleAppeal(appeal._id, "reject")}
                            className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-red-500/10 to-pink-500/10 hover:from-red-500 hover:to-pink-600 border border-red-500/20 hover:border-transparent rounded-lg text-red-400 hover:text-white font-medium transition-all duration-300"
                          >
                            Reddet
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Geçmiş Başvurular */}
              {nonWaitingAppeals && nonWaitingAppeals.length > 0 && (
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl p-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
                    Geçmiş Başvurular
                  </h2>

                  <div className="space-y-4">
                    {nonWaitingAppeals.map((appeal) => (
                      <div
                        key={appeal._id}
                        className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {appeal.applicant?.name} {appeal.applicant?.surname}
                          </h3>
                          <p className="text-gray-400">{appeal.applicant?.email}</p>
                        </div>

                        <div>
                          <span
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                              appeal.status === "Accepted"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                          >
                            {appeal.status === "Accepted" ? "Kabul Edildi" : "Reddedildi"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Silme Onay Modalı */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">İlanı Sil</h3>
            <p className="text-gray-300 mb-6">
              Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                disabled={loading}
              >
                İptal
              </button>
              <button
                onClick={handleDeleteAdvert}
                disabled={loading}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Siliniyor...
                  </span>
                ) : (
                  'Evet, Sil'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAdvertDetail;
