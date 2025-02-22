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

  if (!advert) return <p className="bg-gray-900 min-h-screen text-center text-white mt-10">Yükleniyor...</p>;

  return (
    <div className="bg-gray-900 text-white min-h-screen py-10">
      <div className="container flex gap-10 mx-auto ">
        <div>
            <Menu />
        </div>
        <div className="flex flex-col gap-3 w-full max-w-4xl"> {/* Sabit genişlik */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-2">{advert.title}</h1>
            <p className="text-lg text-gray-300 mb-4">
              Takım: <span className="text-white font-semibold">{advert.teamId.name}</span>
            </p>

            {/* Alanlar & Yetenekler */}
            <div className="flex flex-wrap gap-2 mb-4">
              {advert.fields.map((field) => (
                <span
                  key={field}
                  className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                >
                  #{field}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {advert.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                >
                  #{skill}
                </span>
              ))}
            </div>

            <p className="text-gray-300 mb-4">{advert.description}</p>
            <p className="font-semibold text-gray-300">
              Takım Lideri:{" "}
              <span className="text-white">
                {advert.owner.name} {advert.owner.surname}
              </span>
            </p>
          </div>
          {/* Bekleyen Başvurular */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-white mb-4">Bekleyen Başvurular</h1>
            <div className="space-y-4">
              {waitingAppeals && waitingAppeals.length > 0 ? (
                waitingAppeals.map((appeal) => (
                  <div
                    key={appeal.id}
                    className="bg-gray-700 p-4 rounded-lg shadow-md border border-gray-600"
                  >
                    <h2 className="text-xl font-semibold text-white">
                      Başvuran: {appeal.applicant.name} {appeal.applicant.surname}
                    </h2>
                    <p className="text-gray-300 mt-2">{appeal.extra}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Durum:{" "}
                      <span
                        className={`font-medium ${
                          appeal.status === "Accepted"
                            ? "text-green-400"
                            : appeal.status === "Rejected"
                            ? "text-red-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {appeal.status}
                      </span>
                    </p>
                    <div className="flex gap-4 mt-4">
                      <button onClick={() => {handleAppeal(appeal._id, "approve")}} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
                        Kabul Et
                      </button>
                      <button onClick={() => {handleAppeal(appeal._id, "reject")}} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
                        Reddet
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">Henüz başvuru yapılmamış.</p>
              )}
            </div>
          </div>

          {/* Geçmiş Başvurular */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-white mb-4">Geçmiş Başvurular</h1>
            <div className="space-y-4">
              {nonWaitingAppeals && nonWaitingAppeals.length > 0 ? (
                nonWaitingAppeals.map((appeal) => (
                  <div
                    key={appeal.id}
                    className="bg-gray-700 p-4 rounded-lg shadow-md border border-gray-600"
                  >
                    <h2 className="text-xl font-semibold text-white">
                      Başvuran: {appeal.applicant.name} {appeal.applicant.surname}
                    </h2>
                    <p className="text-gray-300 mt-2">{appeal.extra}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Durum:{" "}
                      <span
                        className={`font-medium ${
                          appeal.status === "Accepted"
                            ? "text-green-400"
                            : appeal.status === "Rejected"
                            ? "text-red-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {appeal.status}
                      </span>
                    </p>
                    
                  </div>
                ))
              ) : (
                <p className="text-gray-400">Henüz başvuru yapılmamış.</p>
              )}
            </div>
          </div>
        </div>
        <div>
            <AdvertMenu />
        </div>
      </div>
    </div>
  );
};

export default MyAdvertDetail;
