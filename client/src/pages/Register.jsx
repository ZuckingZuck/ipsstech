import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useDispatch } from "react-redux";
import { userLogin } from "../redux/userSlice";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordAgain, setShowPasswordAgain] = useState(false);
  
  // Animasyon için kullanılacak state
  const [animate, setAnimate] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // Sayfa yüklendiğinde animasyonu başlat
    setAnimate(true);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (password !== passwordAgain) {
      return toast.error("Parolalar eşleşmiyor.");
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/auth/register`,
        { name, surname, email, phone, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const user = response.data;
      
      // Kullanıcı verilerini kontrol et
      if (user && user.user && user.user._id && user.token) {
        console.log('Kayıt başarılı, kullanıcı verileri:', user);
        
        // Kullanıcı verilerini localStorage'a kaydet
        localStorage.setItem("user", JSON.stringify(user));
        
        // Redux store'a aktar
        dispatch(userLogin(user));
        
        toast.success(`Hoşgeldiniz ${user.user.name} ${user.user.surname}`);
        
        // Kısa bir gecikme ile sayfayı yenile ve ana sayfaya yönlendir
        setTimeout(() => {
          window.location.href = "/"; // Sayfayı yenile ve ana sayfaya yönlendir
        }, 300);
      } else {
        console.error('Kayıt başarılı ancak kullanıcı verileri eksik:', user);
        toast.error("Kullanıcı verileri eksik, lütfen tekrar giriş yapın");
        setLoading(false);
      }
      
    } catch (error) {
      toast.error(error.response?.data?.error || "Kayıt olurken bir hata oluştu");
      setLoading(false);
    }
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!name || !surname || !email || !phone) {
        return toast.error("Lütfen tüm alanları doldurun.");
      }
      setCurrentStep(2);
    }
  };

  const prevStep = (e) => {
    e.preventDefault();
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen overflow-hidden flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[10%] top-[20%] w-72 h-72 bg-purple-600/20 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute right-[15%] top-[10%] w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute left-[30%] bottom-[10%] w-80 h-80 bg-emerald-600/20 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className={`w-full max-w-md transform transition-all duration-500 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
          
          <div className="px-8 pt-8 pb-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent animate-gradient">
                Hesap Oluştur
              </h1>
              <p className="text-gray-400 mt-2">
                Hemen kayıt ol ve ekibe katıl
              </p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className={`flex-1 border-t-2 ${currentStep >= 1 ? 'border-purple-500' : 'border-gray-700'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-2 ${currentStep >= 1 ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-400'}`}>1</div>
                <div className={`flex-1 border-t-2 ${currentStep >= 2 ? 'border-purple-500' : 'border-gray-700'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-2 ${currentStep >= 2 ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-400'}`}>2</div>
                <div className={`flex-1 border-t-2 border-gray-700`}></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span className={currentStep >= 1 ? 'text-purple-400' : ''}>Kişisel Bilgiler</span>
                <span className={currentStep >= 2 ? 'text-purple-400' : ''}>Güvenlik</span>
              </div>
            </div>
            
            <form onSubmit={handleRegister} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        İsim
                      </label>
                      <div className="relative group">
                        <input
                          className="w-full p-3 pl-4 bg-gray-800/50 rounded-xl border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 group-hover:border-gray-600/50 text-white placeholder-gray-400"
                          onChange={(e) => setName(e.target.value)}
                          type="text"
                          placeholder="İsim"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Soyisim
                      </label>
                      <div className="relative group">
                        <input
                          className="w-full p-3 pl-4 bg-gray-800/50 rounded-xl border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 group-hover:border-gray-600/50 text-white placeholder-gray-400"
                          onChange={(e) => setSurname(e.target.value)}
                          type="text"
                          placeholder="Soyisim"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      E-Posta Adresi
                    </label>
                    <div className="relative group">
                      <input
                        className="w-full p-3 pl-4 bg-gray-800/50 rounded-xl border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 group-hover:border-gray-600/50 text-white placeholder-gray-400"
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="ornek@email.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Telefon
                    </label>
                    <div className="relative group">
                      <input
                        className="w-full p-3 pl-4 bg-gray-800/50 rounded-xl border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 group-hover:border-gray-600/50 text-white placeholder-gray-400"
                        onChange={(e) => setPhone(e.target.value)}
                        type="text"
                        placeholder="05XX XXX XX XX"
                        required
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={nextStep}
                    className="w-full p-3 flex justify-center items-center bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 hover:from-blue-600 hover:via-purple-600 hover:to-emerald-600 rounded-xl transition-all duration-300 transform hover:scale-[1.02] font-semibold shadow-lg"
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Devam Et
                  </button>
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Parola
                    </label>
                    <div className="relative group">
                      <input
                        className="w-full p-3 pl-4 bg-gray-800/50 rounded-xl border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 group-hover:border-gray-600/50 text-white placeholder-gray-400"
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Parola Tekrar
                    </label>
                    <div className="relative group">
                      <input
                        className="w-full p-3 pl-4 bg-gray-800/50 rounded-xl border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 group-hover:border-gray-600/50 text-white placeholder-gray-400"
                        onChange={(e) => setPasswordAgain(e.target.value)}
                        type={showPasswordAgain ? "text" : "password"}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                        onClick={() => setShowPasswordAgain(!showPasswordAgain)}
                      >
                        {showPasswordAgain ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-700 rounded bg-gray-800/50"
                      required
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-400">
                      <span>Kullanım şartlarını ve gizlilik politikasını </span>
                      <a href="#" className="text-purple-400 hover:text-purple-300">kabul ediyorum</a>
                    </label>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={prevStep}
                      className="w-1/3 p-3 flex justify-center items-center bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-300 font-medium"
                      type="button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                      </svg>
                      Geri
                    </button>
                    
                    <button
                      className={`w-2/3 p-3 flex justify-center items-center bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 hover:from-blue-600 hover:via-purple-600 hover:to-emerald-600 rounded-xl transition-all duration-300 transform hover:scale-[1.02] font-semibold shadow-lg ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      )}
                      {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
          
          <div className="px-8 py-6 bg-gray-800/30 border-t border-gray-700/50">
            <p className="text-center text-gray-400 text-sm">
              Zaten bir hesabın var mı?{" "}
              <NavLink 
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200" 
                to="/login"
              >
                Giriş yap
              </NavLink>
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} IPSS Tech. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
