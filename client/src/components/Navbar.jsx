import React from 'react'
import { useDispatch } from 'react-redux'
import { NavLink } from 'react-router'
import { userLogout } from '../redux/userSlice';
const Navbar = () => {
    const dispatch = useDispatch();
    const LogOut = () => {
        dispatch(userLogout());
    }
  return (
    <div className='bg-slate-900 text-white'>
        <div className='container mx-auto flex justify-between py-2'>
            <NavLink className={"text-2xl"} to="/">Logo</NavLink>
            <button onClick={LogOut} className='cursor-pointer'>Çıkış Yap</button>
        </div>
        
    </div>
  )
}

export default Navbar