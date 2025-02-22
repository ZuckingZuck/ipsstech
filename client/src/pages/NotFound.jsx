import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white text-center px-4">
      <h1 className="text-9xl font-bold text-red-500">404</h1>
      <h2 className="text-4xl font-semibold mt-4">Sayfa Bulunamadı</h2>
      <p className="text-lg text-gray-400 mt-2">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
};

export default NotFound;
