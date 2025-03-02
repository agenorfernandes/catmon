import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar arquivos de tradução
import translationEN from './locales/en/translation.json';
import translationPT from './locales/pt/translation.json';
import translationES from './locales/es/translation.json';

// Recursos de idiomas disponíveis
const resources = {
  en: {
    translation: translationEN
  },
  pt: {
    translation: translationPT
  },
  es: {
    translation: translationES
  }
  // Espaço para futuros idiomas:
  // zh: { translation: translationZH }, // Mandarim
  // ja: { translation: translationJA }, // Japonês
  // etc.
};

// Configurar i18n
i18n
  .use(LanguageDetector) // Detecta o idioma do navegador
  .use(initReactI18next) // Integração com React
  .init({
    resources,
    lng: localStorage.getItem('userLanguage') || 'pt', // Idioma padrão é português
    fallbackLng: 'en', // Fallback para inglês se a tradução não existir
    interpolation: {
      escapeValue: false // Não escapar HTML
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;