import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import axios from "axios";
import { useSelector } from "react-redux";

const AdvertDetail = () => {
  const { id } = useParams();
  const user = useSelector((state) => state.user.user);
  const [advert, setAdvert] = useState();
  const [formData, setFormData] = useState({
    extra: "", // Kullanıcının kendisini tanıttığı metin
  });

  const fetchAdvert = async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_API_URL}/api/advert/${id}`
    );
    if (response.status === 200) {
      setAdvert(response.data);
    }
  };

  useEffect(() => {
    fetchAdvert();
  }, []);

  // Form verisini güncelleme
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Form gönderme işlemi
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
                Authorization: `Bearer ${user.token}`
            }
        }
      );

      if (response.status === 200) {
        alert("Başvurunuz başarıyla gönderildi!");
        setFormData({ extra: "" }); // Formu temizle
      }
    } catch (error) {
      console.error("Başvuru gönderme hatası:", error);
      alert("Başvuru sırasında bir hata oluştu!");
    }
  };

  if (!advert) return <p className="bg-gray-900 min-h-screen text-center text-white mt-10">Yükleniyor...</p>;

  return (
    <div className="bg-gray-900 text-white min-h-screen py-10">
      <div className="container mx-auto max-w-3xl bg-gray-800 p-6 rounded-lg shadow-lg">
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

        {/* Başvuru Formu */}
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label htmlFor="extra" className="text-sm font-semibold">
              Kendinizi tanıtın:
            </label>
            <textarea
              name="extra"
              id="extra"
              rows="4"
              className="bg-gray-800 text-white p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Kendinizden bahsedin..."
              value={formData.extra}
              onChange={handleChange}
            ></textarea>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 transition-all text-white font-semibold py-2 rounded"
            >
              Başvur
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdvertDetail;
