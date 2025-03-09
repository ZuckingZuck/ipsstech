import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSocket } from '../context/SocketContext';
import Menu from '../components/Profile/Menu';

const UserSearch = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const { searchUsers } = useSocket();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // Debounce arama sorgusu
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    
    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);
  
  // Kullanıcı araması yap
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2 || !user || !user.token) {
        setSearchResults([]);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const results = await searchUsers(debouncedQuery);
        
        if (results) {
          setSearchResults(results);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error('Kullanıcı araması yapılamadı:', err);
        setError('Kullanıcı araması yapılırken bir hata oluştu');
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };
    
    performSearch();
  }, [debouncedQuery, user, searchUsers]);
  
  // Kullanıcı profiline git
  const handleViewProfile = (userId) => {
    navigate(`/user/${userId}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sol Menü */}
          <div className="lg:sticky lg:top-20 lg:h-fit">
            <Menu />
          </div>

          {/* İçerik Alanı */}
          <div className="flex-1">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
              {/* Başlık */}
              <div className="p-6 border-b border-gray-700/50">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Kullanıcı Ara
                </h1>
                <p className="text-gray-400 mt-2">
                  Diğer kullanıcıları arayın ve takıma davet edin
                </p>
              </div>
              
              {/* Arama Formu */}
              <div className="p-6">
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="İsim, soyisim veya e-posta ile ara..."
                      className="w-full bg-gray-700/50 text-white rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  {searchQuery && searchQuery.length < 2 && (
                    <p className="text-gray-400 text-sm mt-2">
                      En az 2 karakter girin
                    </p>
                  )}
                </div>
                
                {error && (
                  <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30 mb-6">
                    {error}
                  </div>
                )}
                
                {/* Arama Sonuçları */}
                <div>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {searchResults.map((result) => (
                        <div 
                          key={result._id}
                          className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-blue-500/30 hover:bg-gray-800/80 transition-all cursor-pointer"
                          onClick={() => handleViewProfile(result._id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                              {result.name ? result.name[0].toUpperCase() : '?'}
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">
                                {result.name} {result.surname}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                {result.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : debouncedQuery && debouncedQuery.length >= 2 ? (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
                      <div className="text-5xl mb-4">🔍</div>
                      <h3 className="text-xl font-semibold text-white mb-2">Kullanıcı Bulunamadı</h3>
                      <p className="text-gray-400">
                        "{debouncedQuery}" araması için sonuç bulunamadı. Farklı bir arama terimi deneyin.
                      </p>
                    </div>
                  ) : searchQuery ? (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
                      <div className="text-5xl mb-4">⌨️</div>
                      <h3 className="text-xl font-semibold text-white mb-2">Arama Yapmak İçin Yazın</h3>
                      <p className="text-gray-400">
                        En az 2 karakter girerek kullanıcı araması yapabilirsiniz.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
                      <div className="text-5xl mb-4">👥</div>
                      <h3 className="text-xl font-semibold text-white mb-2">Kullanıcı Arayın</h3>
                      <p className="text-gray-400">
                        İsim, soyisim veya e-posta ile kullanıcı araması yapabilirsiniz.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSearch; 