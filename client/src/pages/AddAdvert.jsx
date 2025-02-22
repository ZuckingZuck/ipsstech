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
    <div className="container mx-auto flex gap-10 min-h-screen py-10">
      <div>
        <Menu />
      </div>
      <div className="w-3/4 bg-gray-800 p-6 rounded-xl shadow-md flex-grow">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 bg-gray-900 p-6 rounded-xl"
        >
          <label
            htmlFor="title"
            className="text-gray-300 font-semibold text-lg"
          >
            Başlık
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            className="p-3 rounded-lg bg-gray-700 text-gray-200 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <label
            htmlFor="description"
            className="text-gray-300 font-semibold text-lg"
          >
            Detay
          </label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            className="p-3 rounded-lg bg-gray-700 text-gray-200 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />

          <label
            htmlFor="fields"
            className="text-gray-300 font-semibold text-lg"
          >
            Alanlar (Enter veya , ile ekleyin)
          </label>
          <div className="border p-4 rounded-lg bg-gray-700 flex flex-wrap gap-2 mb-4">
            {formData.fields.map((field, index) => (
              <span
                key={index}
                className="bg-gray-600 text-sm px-3 py-1 rounded flex items-center gap-1 text-gray-200"
              >
                {field}
                <button
                  type="button"
                  onClick={() => handleRemove("fields", index)}
                  className="text-red-500 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              name="fields"
              id="fields"
              value={tempInput.fields}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "fields")}
              className="bg-transparent border-none outline-none text-gray-200 flex-1"
            />
          </div>

          <label
            htmlFor="skills"
            className="text-gray-300 font-semibold text-lg"
          >
            Yetenekler (Enter veya , ile ekleyin)
          </label>
          <div className="border p-4 rounded-lg bg-gray-700 flex flex-wrap gap-2 mb-6">
            {formData.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-gray-600 text-sm px-3 py-1 rounded flex items-center gap-1 text-gray-200"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemove("skills", index)}
                  className="text-red-500 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              name="skills"
              id="skills"
              value={tempInput.skills}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, "skills")}
              className="bg-transparent border-none outline-none text-gray-200 flex-1"
            />
          </div>

          <input
            type="submit"
            value="Yayınla"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-600 transition duration-300"
          />
        </form>
      </div>
    </div>
  );
};

export default AddAdvert;
