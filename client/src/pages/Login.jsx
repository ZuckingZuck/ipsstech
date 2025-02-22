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
    <div className="min-h-screen flex justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6">
        <h1 className="text-center text-2xl font-bold">Giriş Yap</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="E-Posta"
            required
          />
          <input
            className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Parola"
            required
          />
          <button
            className="w-full p-3 bg-blue-500 hover:bg-blue-600 rounded transition font-semibold"
            type="submit"
          >
            Giriş Yap
          </button>
        </form>
        <p className="text-center text-gray-400">
          Henüz bir hesabın yok mu?{" "}
          <NavLink className="text-blue-400 hover:underline" to="/register">
            Kayıt ol.
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default Login;
