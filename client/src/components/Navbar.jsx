import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { userLogout } from '../redux/userSlice';
import { useSocket } from '../context/SocketContext';

const Navbar = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
    const teams = useSelector((state) => state.team.myteams) || [];
    const ledTeams = useSelector((state) => state.team.myleds) || [];
    const { unreadMessages, fetchUnreadCounts, soundEnabled, setSoundEnabled } = useSocket();
    
    // İlk takımın ID'sini bul (varsa)
    const firstTeamId = [...teams, ...ledTeams][0]?._id;
    
    // Sayfa yüklendiğinde okunmamış mesaj sayısını getir
    useEffect(() => {
        if (user && user.token) {
            fetchUnreadCounts();
        }
    }, [user, fetchUnreadCounts]);
    
    const LogOut = () => {
        dispatch(userLogout());
    }

    // Bildirim sesini aç/kapat
    const toggleSound = () => {
        setSoundEnabled(!soundEnabled);
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
                            {/* Bildirim Sesi Düğmesi */}
                            <button
                                onClick={toggleSound}
                                className="text-gray-300 hover:text-white transition-all duration-300"
                                title={soundEnabled ? "Bildirim sesini kapat" : "Bildirim sesini aç"}
                            >
                                {soundEnabled ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                    </svg>
                                )}
                            </button>
                            
                            <NavLink 
                                className="text-gray-300 hover:text-white font-medium transition-all duration-300 relative" 
                                to="/me/messages"
                                onClick={() => fetchUnreadCounts()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                {unreadMessages > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {unreadMessages > 99 ? '99+' : unreadMessages}
                                    </span>
                                )}
                            </NavLink>
                            
                            <NavLink 
                                className="text-gray-300 hover:text-white font-medium transition-all duration-300 flex items-center gap-2" 
                                to="/me"
                            >
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                    {user.user && user.user.name ? user.user.name[0].toUpperCase() : '?'}
                                </div>
                                <span>{user.user && user.user.name ? `${user.user.name} ${user.user.surname}` : 'Kullanıcı'}</span>
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
