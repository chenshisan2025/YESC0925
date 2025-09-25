import { useState, useEffect } from 'react';

type Language = 'zh' | 'en';

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
}

// 简化的语言管理，避免Zustand冲突
export const useLanguage = (): LanguageStore => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yescoin-language');
      return (saved as Language) || 'zh';
    }
    return 'zh';
  });

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    if (typeof window !== 'undefined') {
      localStorage.setItem('yescoin-language', newLanguage);
    }
  };

  return { language, setLanguage };
};