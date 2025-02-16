import React, { useState } from 'react'
import { useNavigate, NavLink } from 'react-router';
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
            toast.success(`Hoşgeldiniz ${user.user.name} ${user.user.surname}`)
    
        } catch (error) {
            toast.error(error.response.data.error);
        }
    };

  return (
    <div className='flex justify-center mt-20'>
        <div>
            <h1 className='text-center text-xl font-bold'>Giriş Yap</h1>
            <form onSubmit={handleLogin} className='flex flex-col'>
                <label htmlFor="email">E-Mail</label>
                <input className='border' onChange={e => setEmail(e.target.value)} type="text" name="email" id="email" required />
                <label htmlFor="password">Parola</label>
                <input className='border' onChange={e => setPassword(e.target.value)} type="password" name="password" id="password" required />
                <input className='cursor-pointer bg-blue-500 mt-2 text-white rounded hover:bg-blue-400 transition' type="submit" value={"Giriş Yap"}/>
                <span className='mt-2'>Henüz bir hesabın yok mu? <NavLink className="text-blue-500 hover:underline" to="/register">Kayıt ol.</NavLink> </span>
            </form>
        </div>
    </div>
  )
}

export default Login