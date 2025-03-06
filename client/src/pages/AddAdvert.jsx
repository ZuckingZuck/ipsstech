import React, { useState } from "react";
import Menu from "../components/Profile/Menu";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const AddAdvert = () => {
  const user = useSelector((state) => state.user.user);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fields: [],
    skills: [],
  });

  const [tempInput, setTempInput] = useState({
    fields: "",
    skills: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "title" || name === "description") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setTempInput((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = tempInput[field].trim();
      if (value) {
        setFormData((prev) => ({
          ...prev,
          [field]: [...prev[field], value],
        }));
        setTempInput((prev) => ({ ...prev, [field]: "" }));
      }
    }
  };

  const handleRemove = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await axios.post(
      `${import.meta.env.VITE_REACT_APP_API_URL}/api/advert`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    if (response.status === 200) {
      toast.success("İlanınız yayınlandı.");
      window.location.reload();
    }
  };

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
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
              {/* Başlık */}
              <div className="p-6 border-b border-gray-700/50">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Yeni İlan Oluştur
                </h1>
                <p className="text-gray-400 mt-1">
                  İlan detaylarını doldurarak yeni bir ilan yayınlayabilirsiniz.
                </p>
              </div>

              {/* Form */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Başlık Input */}
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-gray-300 font-medium block">
                      İlan Başlığı
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none text-white transition-all duration-200"
                      placeholder="İlan başlığını girin..."
                      required
                    />
                  </div>

                  {/* Detay Input */}
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-gray-300 font-medium block">
                      İlan Detayı
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="5"
                      className="w-full p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none text-white transition-all duration-200 resize-none"
                      placeholder="İlan detaylarını girin..."
                      required
                    />
                  </div>

                  {/* Alanlar Input */}
                  <div className="space-y-2">
                    <label htmlFor="fields" className="text-gray-300 font-medium block">
                      Alanlar
                      <span className="text-sm text-gray-400 ml-2">
                        (Enter veya virgül ile ekleyin)
                      </span>
                    </label>
                    <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200">
                      <div className="flex flex-wrap gap-2">
                        {formData.fields.map((field, index) => (
                          <span
                            key={index}
                            className="group px-3 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm font-medium flex items-center gap-2"
                          >
                            #{field}
                            <button
                              type="button"
                              onClick={() => handleRemove("fields", index)}
                              className="text-blue-400/50 hover:text-red-400 transition-colors duration-200"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          name="fields"
                          value={tempInput.fields}
                          onChange={handleChange}
                          onKeyDown={(e) => handleKeyDown(e, "fields")}
                          className="flex-1 bg-transparent outline-none text-white min-w-[100px]"
                          placeholder="Alan ekleyin..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Yetenekler Input */}
                  <div className="space-y-2">
                    <label htmlFor="skills" className="text-gray-300 font-medium block">
                      Yetenekler
                      <span className="text-sm text-gray-400 ml-2">
                        (Enter veya virgül ile ekleyin)
                      </span>
                    </label>
                    <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all duration-200">
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="group px-3 py-1 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm font-medium flex items-center gap-2"
                          >
                            #{skill}
                            <button
                              type="button"
                              onClick={() => handleRemove("skills", index)}
                              className="text-emerald-400/50 hover:text-red-400 transition-colors duration-200"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          name="skills"
                          value={tempInput.skills}
                          onChange={handleChange}
                          onKeyDown={(e) => handleKeyDown(e, "skills")}
                          className="flex-1 bg-transparent outline-none text-white min-w-[100px]"
                          placeholder="Yetenek ekleyin..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full p-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-medium shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      İlanı Yayınla
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAdvert;
