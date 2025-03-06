import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const AdvertDetail = () => {
  const { id } = useParams();
  const user = useSelector((state) => state.user.user);
  const [advert, setAdvert] = useState();
  const [formData, setFormData] = useState({
    extra: "",
  });

  const fetchAdvert = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/advert/${id}`
      );
      if (response.status === 200) {
        setAdvert(response.data);
      }
    } catch (error) {
      toast.error("İlan bilgileri yüklenirken bir hata oluştu!");
    }
  };

  useEffect(() => {
    fetchAdvert();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/advert/appeal/${id}`,
        {
          extra: formData.extra,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Başvurunuz başarıyla gönderildi!");
        setFormData({ extra: "" });
      }
    } catch (error) {
      toast.error("Başvuru sırasında bir hata oluştu!");
    }
  };

  if (!advert) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
          {/* Üst Başlık Alanı */}
          <div className="p-8 border-b border-gray-700/50">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
              {advert.title}
            </h1>
            
            <div className="flex items-center space-x-2 text-gray-300 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">{advert.teamId.name}</span>
            </div>

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
            <div className="flex flex-wrap gap-2">
              {advert.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium"
                >
                  #{skill}
                </span>
              ))}
            </div>
          </div>

          {/* İçerik Alanı */}
          <div className="p-8 space-y-6">
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed">{advert.description}</p>
            </div>

            <div className="flex items-center space-x-2 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>
                Takım Lideri: {advert.owner.name} {advert.owner.surname}
              </span>
            </div>

            {/* Başvuru Formu */}
            <div className="mt-8 p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-4">Başvuru Yap</h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="extra" className="block text-sm font-medium text-gray-300 mb-2">
                    Kendinizi Tanıtın
                  </label>
                  <textarea
                    name="extra"
                    id="extra"
                    rows="4"
                    className="w-full bg-gray-900/50 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Yetenekleriniz ve deneyimlerinizden bahsedin..."
                    value={formData.extra}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 transform hover:scale-[1.02] font-medium text-white shadow-lg"
                >
                  Başvuruyu Gönder
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertDetail;
