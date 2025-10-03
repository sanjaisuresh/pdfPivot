import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import it from './locales/it.json';
import es from './locales/es.json';
import de from './locales/de.json';

// New languages
import fr from './locales/fr.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import tr from './locales/tr.json'; // Turkish
import id from './locales/id.json'; // Turkish
import ms from './locales/ms.json'; // Turkish

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      zh: { translation: zh },
      ja: { translation: ja },
      it: { translation: it },
      es: { translation: es },
      de: { translation: de },
      fr: { translation: fr },
      pt: { translation: pt },
      ru: { translation: ru },
      nl: { translation: nl },
      pl: { translation: pl },
      tr: { translation: tr },
      id: { translation: id },
      ms: { translation: ms },
    },
    supportedLngs: [
      'en', 'ar', 'zh', 'ja', 'it', 'es', 'de',
      'fr', 'pt', 'ru', 'nl', 'pl', 'tr','id','ms'
    ],
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
