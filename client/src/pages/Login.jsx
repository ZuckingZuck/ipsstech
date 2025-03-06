import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { userLogin } from '../redux/userSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const user = response.data;
      localStorage.setItem("user", JSON.stringify(user));
      dispatch(userLogin(user));
      navigate("/");
      toast.success(`Hoşgeldiniz ${user.user.name} ${user.user.surname}`);
    } catch (error) {
      toast.error(error.response.data.error);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md p-6 sm:p-8 mx-4 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 bg-clip-text text-transparent animate-gradient">
            Hoş Geldiniz
          </h1>
          <p className="text-gray-400 text-sm">
            Hesabınıza giriş yapın
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4 mt-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">
              E-Posta Adresi
            </label>
            <div className="relative">
              <input
                className="w-full p-2.5 pl-4 bg-gray-700/50 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="ornek@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">
              Parola
            </label>
            <div className="relative">
              <input
                className="w-full p-2.5 pl-4 bg-gray-700/50 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            className="w-full p-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-200 transform hover:scale-[1.02] font-semibold shadow-lg"
            type="submit"
          >
            Giriş Yap
          </button>
        </form>

        <div className="relative mt-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800/80 text-gray-400">veya</span>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-5">
          Henüz bir hesabın yok mu?{" "}
          <NavLink 
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200" 
            to="/register"
          >
            Hemen kayıt ol
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default Login;
