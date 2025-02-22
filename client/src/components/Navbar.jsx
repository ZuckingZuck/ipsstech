import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink } from 'react-router'
import { userLogout } from '../redux/userSlice';

const Navbar = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
    const LogOut = () => {
        dispatch(userLogout());
    }

  return (
    <div className='bg-slate-900 text-white'>
        <div className='container mx-auto flex justify-between items-center py-4'>
            <NavLink className="text-3xl font-semibold text-gray-200 hover:text-white transition duration-300" to="/">IPSSTECH</NavLink>
            <NavLink className="text-xl font-semibold text-gray-200 hover:text-white transition duration-300" to="/">Ana Sayfa</NavLink>
            {
              user && (
                <div className='flex gap-4'>
                  <NavLink className="text-lg font-medium text-gray-200 hover:text-white transition duration-300" to="/me">
                    {user.user.name} {user.user.surname}
                  </NavLink>
                  <button onClick={LogOut} className="text-lg font-medium text-gray-200 hover:text-white cursor-pointer transition duration-300">
                    Çıkış Yap
                  </button>
                </div>
              )
            }
            {
              !user && (
                <div className='flex gap-4'>
                  <NavLink className="text-lg font-medium text-gray-200 hover:text-white transition duration-300" to="/login">
                    Giriş Yap
                  </NavLink>
                  <NavLink className="text-lg font-medium text-gray-200 hover:text-white transition duration-300" to="/register">
                    Kayıt Ol
                  </NavLink>
                </div>
              )
            }
        </div>
    </div>
  )
}

export default Navbar;
