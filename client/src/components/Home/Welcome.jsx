import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Welcome = () => {
  const user = useSelector((state) => state.user.user);

  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 max-w-4xl mx-auto mb-24">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 bg-clip-text text-transparent animate-gradient">
            Proje Yönetiminde Yeni Nesil Yaklaşım
          </h1>
          
          <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            IPSSTECH ile projelerinizi yönetmek ve ekip oluşturmak artık çok daha kolay. Profesyonel proje yönetim araçlarıyla tanışın.
          </p>

          {!user && (
            <div className="flex justify-center gap-4 pt-8">
              <NavLink
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl transition-all duration-300 transform hover:scale-[1.02] font-medium text-white shadow-xl hover:shadow-blue-500/20"
              >
                Hemen Başla
              </NavLink>
              <NavLink
                to="/login"
                className="px-8 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-600 hover:border-gray-500 rounded-xl transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg"
              >
                Giriş Yap
              </NavLink>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Ekip Oluştur</h3>
            <p className="text-gray-400 leading-relaxed">Projeleriniz için ideal ekibi oluşturun. Farklı yeteneklere sahip kişilerle tanışın ve birlikte çalışın.</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Projeleri Yönet</h3>
            <p className="text-gray-400 leading-relaxed">Modern araçlarla projelerinizi kolayca yönetin. Görev takibi, ilerleme raporları ve daha fazlası.</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 transform hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Hızlı Geliştir</h3>
            <p className="text-gray-400 leading-relaxed">Projelerinizi hızla hayata geçirin. Verimli iş akışları ve işbirliği araçlarıyla başarıya ulaşın.</p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 rounded-3xl"></div>
          <div className="relative backdrop-blur-xl bg-gray-800/20 rounded-3xl p-12 border border-gray-700/50">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
              Neden <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">IPSSTECH</span>?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50 transform hover:scale-[1.02] transition-all duration-300">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">500+</div>
                <div className="text-gray-300 font-medium">Aktif Kullanıcı</div>
              </div>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50 transform hover:scale-[1.02] transition-all duration-300">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent mb-2">200+</div>
                <div className="text-gray-300 font-medium">Tamamlanan Proje</div>
              </div>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50 transform hover:scale-[1.02] transition-all duration-300">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">50+</div>
                <div className="text-gray-300 font-medium">Aktif Ekip</div>
              </div>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50 transform hover:scale-[1.02] transition-all duration-300">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent mb-2">24/7</div>
                <div className="text-gray-300 font-medium">Destek</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
