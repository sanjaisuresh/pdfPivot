import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { SiTiktok } from 'react-icons/si';
import { FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path
      ? 'border-teal-500 text-gray-900'
      : 'border-transparent text-white hover:border-gray-300 hover:text-gray-700';
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const features = [
    { name: t('Merge PDF'), path: '/merge-pdf', icon: '🗂️' },
    { name: t('Split PDF'), path: '/split-pdf', icon: '✂️' },
    { name: t('Remove Pages'), path: '/remove-pages', icon: '❌' },
    { name: t('Extract Pages'), path: '/extract-pages', icon: '📄' },
    { name: t('Organize PDF'), path: '/organize-pdf', icon: '🗃️' },
    { name: t('Rotate PDF'), path: '/rotate-pdf', icon: '🔄' },
    { name: t('Compress PDF'), path: '/compress-pdf', icon: '📉' },
    { name: t('JPG to PDF'), path: '/jpg-to-pdf', icon: '🖼️' },
    { name: t('Word to PDF'), path: '/word-to-pdf', icon: '📄' },
    { name: t('PowerPoint to PDF'), path: '/ppt-to-pdf', icon: '📊' },
    { name: t('Excel to PDF'), path: '/excel-to-pdf', icon: '📈' },
    { name: t('HTML to PDF'), path: '/html-to-pdf', icon: '🌐' },
    { name: t('PDF to JPG'), path: '/pdf-to-jpg', icon: '🖼️' },
    { name: t('PDF to Word'), path: '/pdf-to-word', icon: '📄' },
    { name: t('PDF to PowerPoint'), path: '/pdf-to-ppt', icon: '📊' },
    { name: t('PDF to Excel'), path: '/pdf-to-excel', icon: '📈' },
    { name: t('PDF to PDF/A'), path: '/pdf-to-pdfa', icon: '🗄️' },
    { name: t('Add Page Numbers'), path: '/add-page-numbers', icon: '🔢' },
    { name: t('Add Watermark'), path: '/add-watermark', icon: '💧' },
    { name: t('Unlock PDF'), path: '/unlock-pdf', icon: '🔓' },
    { name: t('Protect PDF'), path: '/protect-pdf', icon: '🔒' },
    { name: t('Sign PDF'), path: '/sign-pdf', icon: '✍️' },
    { name: t('Compare PDF'), path: '/compare-pdf', icon: '🆚' },
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  return (
    <nav className="bg-[#008080] shadow-lg">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between h-20">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-green-400">
              <img src='/logo.png' className='h-[110px] w-[200px]'/>
              </Link>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {user?.isAdmin ? (
                <>
                  <Link to="/admin" className={`${isActive('/admin')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 text-white hover:text-green-400`}>{t('Dashboard')}</Link>
                  <Link to="/admin/users" className={`${isActive('/admin/users')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 text-white hover:text-gold`}>{t('Users')}</Link>
                  <Link to="/admin/plans" className={`${isActive('/admin/plans')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 text-white hover:text-gold`}>{t('Plans Management')}</Link>
                  <Link to="/admin/payment-history"className={`${isActive('/admin/plans')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 text-white hover:text-gold`}>{t('Payment History')}</Link>

                </>
              ) : (
                <div className="relative inline-flex items-center" onMouseEnter={() => setShowFeatures(true)} onMouseLeave={() => setShowFeatures(false)}>
                  <button className={`hover:text-green-400 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${showFeatures ? 'border-gold text-gold' : 'border-transparent text-white hover:border-gold hover:text-green-400'}`}>
                    {t('Features')}
                    <svg className={`ml-2 h-5 w-5 transition-transform duration-200 ${showFeatures ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {showFeatures && (
                    <div className="absolute z-10 top-full right-0 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-2 max-h-[400px] overflow-y-auto">
                        {features.map((feature) => (
                          <Link key={feature.path} to={feature.path} className="flex items-center px-4 py-2 text-sm text-forest hover:bg-green-400 hover:text-forest">
                            <span className="mr-3 w-5 text-center">{feature.icon}</span>
                            {feature.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right section (desktop) */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <Link to="/plans" className={`${isActive('/plans')} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-white hover:text-gold`}>{t('Plans')}</Link>

            {/* Language Selector */}
           

            {user ? (
              <>
                {!user.isAdmin && (
                  <Link to="/dashboard" className={`${isActive('/dashboard')} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-white hover:text-gold`}>{t('Dashboard')}</Link>
                )}
                <button onClick={handleLogout} className="bg-gold text-forest px-4 py-2 rounded-md text-sm font-medium hover:bg-orangeweb hover:text-forest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2">
                  {t('Logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={`${isActive('/login')} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-white hover:text-green-400`}>{t('Login')}</Link>
                <Link to="/signup" className="bg-gold text-forest px-4 py-2 rounded-md text-sm font-medium hover:bg-orangeweb hover:text-forest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2">{t('Sign Up')}</Link>
              </>
            )}

            <div className="flex space-x-4">
              <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-400"><SiTiktok size={20} /></a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-400"><FaInstagram size={20} /></a>
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-400"><FaFacebook size={20} /></a>
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-400"><FaYoutube size={20} /></a>
            </div>
             {/* <div className="relative inline-block text-left">
              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent text-white border border-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-[#008080] text-white">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div> */}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center sm:hidden">
            <button onClick={toggleMenu} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {user?.isAdmin ? (
            <>
              <Link to="/admin" className={`${isActive('/admin')} block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}>{t('Dashboard')}</Link>
              <Link to="/admin/users" className={`${isActive('/admin/users')} block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}>{t('Users')}</Link>
              <Link to="/admin/plans" className={`${isActive('/admin/plans')} block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}>{t('Plans Management')}</Link>
              <Link to="/admin/payment-history" className={`${isActive('/admin/payment-history')} block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}>{t('Payment History')}</Link>
            </>
          ) : (
            <>
              {/* <Link to="/convert" className={`${isActive('/convert')} block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}>Convert</Link> */}
              {/* <Link to="/compress" className={`${isActive('/compress')} block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}>Compress</Link> */}
            </>
          )}
          <Link to="/plans" className={`${isActive('/plans')} block pl-3 pr-4 py-2 text-base font-medium transition-colors duration-200`}>{t('Plans')}</Link>
          
          {/* Mobile Language Selector */}
          {/* <div className="pl-3 pr-4 py-2">
            <select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent text-white border border-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 w-full"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#008080] text-white">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div> */}
        </div>

        <div className="pt-4 pb-3 border-t border-gray-200">
          {user ? (
            <div className="space-y-1">
              {!user.isAdmin && (
                <Link to="/dashboard" className={`${isActive('/dashboard')} block pl-3 pr-4 py-2 text-base font-medium transition-colors duration-200`}>{t('Dashboard')}</Link>
              )}
              <button onClick={handleLogout} className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-white hover:text-gray-800 hover:bg-gray-50 transition-colors duration-200">{t('Logout')}</button>
            </div>
          ) : (
            <div className="space-y-1">
              <Link to="/login" className={`${isActive('/login')} block pl-3 pr-4 py-2 text-base font-medium transition-colors duration-200 text-gold hover:text-white`}>{t('Login')}</Link>
              <Link to="/signup" className="block pl-3 pr-4 py-2 text-base font-medium text-gold hover:text-white hover:bg-gold transition-colors duration-200">{t('Sign Up')}</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
