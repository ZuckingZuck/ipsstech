import React, { useState } from 'react'
import { useNavigate, NavLink } from 'react-router';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { userLogin } from '../redux/userSlice';
const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [passwordAgain, setPasswordAgain] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        if(password !== passwordAgain){
            return toast.error("Parolalar eşleşmiyor.");
        }
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_REACT_APP_API_URL}/api/auth/register`,
                { name, surname, email, phone, password },
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
            <h1 className='text-center text-xl font-bold'>Kayıt Ol</h1>
            <form onSubmit={handleRegister} className='flex flex-col'>
                <label htmlFor="email">İsim</label>
                <input className='border' onChange={e => setName(e.target.value)} type="text" name="name" id="name" required />

                <label htmlFor="email">Soy isim</label>
                <input className='border' onChange={e => setSurname(e.target.value)} type="text" name="surname" id="surname" required />

                <label htmlFor="email">E-Posta</label>
                <input className='border' onChange={e => setEmail(e.target.value)} type="text" name="email" id="email" required />

                <label htmlFor="email">Telefon</label>
                <input className='border' onChange={e => setPhone(e.target.value)} type="text" name="phone" id="phone" required />

                <label htmlFor="password">Parola</label>
                <input className='border' onChange={e => setPassword(e.target.value)} type="password" name="password" id="password" required />

                <label htmlFor="password">Parola Tekrar</label>
                <input className='border' onChange={e => setPasswordAgain(e.target.value)} type="password" name="passwordAgain" id="passwordAgain" required />

                <input className='cursor-pointer bg-blue-500 mt-2 text-white rounded hover:bg-blue-400 transition' type="submit" value={"Kayıt Ol"}/>
                <span className='mt-2'>Zaten bir hesabın var mı? <NavLink className="text-blue-500 hover:underline" to="/login">Giriş yap.</NavLink> </span>
            </form>
        </div>
    </div>
  )
}

export default Register