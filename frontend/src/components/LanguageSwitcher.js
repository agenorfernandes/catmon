import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'react-feather';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Lista de idiomas disponíveis
  const languages = [
    { code: 'pt', name: 'Português' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    // Idiomas que serão adicionados no futuro
    { code: 'zh', name: '中文', disabled: true },
    { code: 'ja', name: '日本語', disabled: true }
  ];

  // Mudar idioma
  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('userLanguage', langCode);
    setIsOpen(false);
  };

  // Fechar o dropdown quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button 
        className="language-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('settings.chooseLanguage')}
      >
        <Globe size={20} />
        <span>{languages.find(lang => lang.code === i18n.language)?.name || 'Language'}</span>
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          <div className="language-dropdown-header">
            {t('language.title')}
          </div>
          <ul className="language-list">
            {languages.map((language) => (
              <li 
                key={language.code}
                className={`language-item ${i18n.language === language.code ? 'active' : ''} ${language.disabled ? 'disabled' : ''}`}
                onClick={() => !language.disabled && changeLanguage(language.code)}
              >
                <span className="language-name">{language.name}</span>
                {language.disabled && <span className="coming-soon">{t('Coming soon')}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;