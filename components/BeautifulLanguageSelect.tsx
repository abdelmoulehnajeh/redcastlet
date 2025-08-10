import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const ElegantLanguageSelect = ({ lang, onLangChange, translations }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { value: 'fr', label: translations.french },
    { value: 'ar', label: translations.arabic }
  ];
  
  const selectedLanguage = languages.find(l => l.value === lang);
  
  const handleSelect = (value) => {
    const fakeEvent = { target: { value } };
    onLangChange(fakeEvent);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.elegant-select')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="elegant-select relative">
      {/* Elegant Select Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative flex items-center justify-between gap-3 
          px-4 py-2.5 min-w-[130px] w-auto
          bg-slate-800/60 backdrop-blur-md
          border border-slate-600/40 text-white 
          rounded-xl font-medium text-sm
          hover:bg-slate-700/60 hover:border-blue-500/50
          focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500/50
          transition-all duration-300 ease-out
          ${isOpen ? 'bg-slate-700/70 border-blue-500/50 ring-1 ring-blue-500/30' : ''}
        `}
      >
        <span className="text-slate-200">{selectedLanguage?.label}</span>
        <ChevronDown 
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {/* Dropdown Menu */}
      <div className={`
        absolute right-0 top-full mt-1 w-full
        bg-slate-800/95 backdrop-blur-md
        border border-slate-600/40 rounded-xl
        shadow-xl shadow-black/25
        transform transition-all duration-200 ease-out origin-top z-50
        ${isOpen 
          ? 'opacity-100 scale-100' 
          : 'opacity-0 scale-95 pointer-events-none'
        }
      `}>
        <div className="py-1">
          {languages.map((language) => (
            <button
              key={language.value}
              onClick={() => handleSelect(language.value)}
              className={`
                w-full px-4 py-2.5 text-left text-sm font-medium
                transition-all duration-150
                hover:bg-slate-700/60
                focus:outline-none focus:bg-slate-700/60
                ${lang === language.value 
                  ? 'text-blue-300 bg-slate-700/40' 
                  : 'text-slate-200'
                }
              `}
            >
              {language.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Example usage in your login page context
const LoginPageDemo = () => {
  const [lang, setLang] = useState('fr');
  
  const translations = {
    fr: {
      french: "Français",
      arabic: "العربية"
    },
    ar: {
      french: "فرنسي", 
      arabic: "العربية"
    }
  };

  const handleLangChange = (e) => {
    const selectedLang = e.target.value;
    setLang(selectedLang);
    localStorage.setItem("lang", selectedLang);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      <div className="relative z-10 w-full max-w-md">
        {/* Simply replace your existing select with this */}
        <div className="mb-6 flex justify-end">
          <ElegantLanguageSelect 
            lang={lang}
            onLangChange={handleLangChange}
            translations={translations[lang]}
          />
        </div>
        
        {/* Your existing beautiful card */}
        <div className="glass-card backdrop-blur-futuristic border-0 shadow-2xl rounded-3xl p-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent text-center mb-6">
            Red Castle
          </h2>
          <p className="text-slate-300 text-center">نظام إدارة المطعم • Système de Gestion Restaurant</p>
        </div>
      </div>
    </div>
  );
};

export default ElegantLanguageSelect;