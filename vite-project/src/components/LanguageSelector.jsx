import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from '../config/axios';
import { useAuth } from '../context/AuthContext';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const { user, setUser } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');

  useEffect(() => {
    // If user is logged in and has a preferredLanguage, set it
    if (user && user.preferredLanguage) {
      setSelectedLanguage(user.preferredLanguage);
      i18n.changeLanguage(user.preferredLanguage);
    } else {
      setSelectedLanguage('en');
      i18n.changeLanguage('en');
    }
    // eslint-disable-next-line
  }, [user]);

const languages = [
  { code: 'en', label: 'English', englishName: 'English' },
  { code: 'ar', label: 'العربية', englishName: 'Arabic' },
  { code: 'zh', label: '中文', englishName: 'Chinese' },
  { code: 'ja', label: '日本語', englishName: 'Japanese' },
  { code: 'it', label: 'Italiano', englishName: 'Italian' },
  { code: 'es', label: 'Español', englishName: 'Spanish' },
  { code: 'de', label: 'Deutsch', englishName: 'German' },
  { code: 'fr', label: 'Français', englishName: 'French' },
  { code: 'pt', label: 'Português', englishName: 'Portuguese' },
  { code: 'ru', label: 'Русский', englishName: 'Russian' },
  { code: 'nl', label: 'Nederlands', englishName: 'Dutch' },
  { code: 'pl', label: 'Polski', englishName: 'Polish' },
  { code: 'tr', label: 'Türkçe', englishName: 'Turkish' },
   { code: 'id', label: 'Bahasa Indonesia', englishName: 'Indonesian' },
  { code: 'ms', label: 'Bahasa Melayu', englishName: 'Malaysian' },
];

  const handleChange = async (lang) => {
    setSelectedLanguage(lang);
    i18n.changeLanguage(lang);
    if (user) {
      try {
        const res = await axios.post('/api/user/preferred-language', { language: lang });
        if (res.data && res.data.preferredLanguage) {
          setUser({ ...user, preferredLanguage: res.data.preferredLanguage });
        }
      } catch (error) {
        // Optionally handle error
      }
    }
  };

  return (
    <div className="border-2 border-green-600 rounded-lg p-4 m-1 text-center relative mt-16 bg-gradient-to-br from-green-50 to-blue-50 shadow-lg">
      {/* Floating Header - responsive for mobile */}
      <div className="md:absolute md:-top-8 md:left-1/2 md:transform md:-translate-x-1/2 md:bg-white md:rounded-lg md:shadow-lg mb-6 md:mb-0 mt-2">
        <h2 className="text-green-700 text-xl font-bold border-2 border-green-600 px-8 py-2 rounded-lg bg-white shadow-sm capitalize">
         {t('choose_language')}
        </h2>
      </div>

      {/* Language Options */}
      <div className="flex flex-wrap justify-center items-center gap-8 mt-8">
        {languages.map((lang) => (
          <label
            key={lang.code}
            className={`flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-110 group ${
              selectedLanguage === lang.code 
                ? 'bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-4 shadow-lg border-2 border-green-400' 
                : 'bg-white rounded-xl p-4 shadow-md border-2 border-transparent hover:border-green-300 hover:shadow-lg'
            }`}
          >
            <div className={`border-2 rounded-lg px-6 py-3 text-center font-semibold text-sm mb-3 transition-all duration-300 ${
              selectedLanguage === lang.code
                ? 'border-green-500 bg-green-500 text-white shadow-md'
                : 'border-orange-400 bg-orange-50 text-orange-700 group-hover:border-orange-500 group-hover:bg-orange-100'
            }`}>
              {lang.label}
            </div>
            
            <input
              type="radio"
              name="language"
              value={lang.code}
              checked={selectedLanguage === lang.code}
              onChange={() => handleChange(lang.code)}
              className="w-5 h-5 text-green-600 accent-green-600 mb-2 cursor-pointer"
            />
            
            <span className={`text-xs font-medium transition-colors duration-300 ${
              selectedLanguage === lang.code 
                ? 'text-green-700 font-semibold' 
                : 'text-gray-600 group-hover:text-gray-800'
            }`}>
              {lang.englishName}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
