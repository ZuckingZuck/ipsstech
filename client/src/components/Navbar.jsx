import React, { useState } from 'react'
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
        <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-b border-gray-700/50 sticky top-0 z-50 backdrop-blur-lg bg-opacity-80">
            <div className='container mx-auto px-4 flex justify-between items-center h-16'>
                <div className="flex items-center space-x-8">
                    <NavLink 
                        className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hover:from-blue-500 hover:to-purple-600 transition-all duration-300" 
                        to="/"
                    >
                        IPSSTECH
                    </NavLink>
                    
                    <NavLink 
                        className="text-gray-300 hover:text-white font-medium transition-all duration-300 hover:translate-y-[-2px]" 
                        to="/"
                    >
                        Ana Sayfa
                    </NavLink>
                </div>

                <div className="flex items-center">
                    {user ? (
                        <div className='flex items-center space-x-6'>
                            <NavLink 
                                className="text-gray-300 hover:text-white font-medium transition-all duration-300 flex items-center gap-2" 
                                to="/me"
                            >
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                    {user.user.name[0].toUpperCase()}
                                </div>
                                <span>{user.user.name} {user.user.surname}</span>
                            </NavLink>
                            
                            <button 
                                onClick={LogOut} 
                                className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300"
                            >
                                Çıkış Yap
                            </button>
                        </div>
                    ) : (
                        <div className='flex items-center space-x-4'>
                            <NavLink 
                                className="px-4 py-2 text-gray-300 hover:text-white transition-all duration-300" 
                                to="/login"
                            >
                                Giriş Yap
                            </NavLink>
                            
                            <NavLink 
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all duration-300 transform hover:scale-[1.02] font-medium" 
                                to="/register"
                            >
                                Kayıt Ol
                            </NavLink>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar;
