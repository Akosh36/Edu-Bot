import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'uz' | 'ru';

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useI18n = create<I18nState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'language-storage',
    }
  )
);

export const translations = {
  en: {
    home: 'Home',
    subjects: 'Subjects',
    bookmarks: 'Bookmarks',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    search: 'Search articles...',
    chatPlaceholder: 'Ask a question...',
    chatTitle: 'AI Assistant',
    noArticles: 'No articles found in this section.',
    readMore: 'Read More',
    save: 'Save',
    saved: 'Saved',
    startLearning: 'Start Learning',
    welcome: 'Welcome back',
    heroTitle: 'Learn Anything, Anywhere.',
    heroSubtitle: 'Master new topics with our multilingual platform and AI-powered assistant designed to accelerate your learning journey.',
    askAI: 'Ask AI',
    popularTags: 'Popular Tags',
    loginToBookmark: 'Please sign in to save bookmarks.'
  },
  uz: {
    home: 'Bosh sahifa',
    subjects: 'Fanlar',
    bookmarks: 'Xatchoʻplar',
    signIn: 'Kirish',
    signOut: 'Chiqish',
    search: 'Maqolalarni qidirish...',
    chatPlaceholder: 'Savol bering...',
    chatTitle: 'AI Yordamchi',
    noArticles: 'Ushbu boʻlimda maqolalar topilmadi.',
    readMore: 'Batafsil',
    save: 'Saqlash',
    saved: 'Saqlangan',
    startLearning: 'Oʻrganishni Boshlash',
    welcome: 'Xush kelibsiz',
    heroTitle: 'Har Narsani, Har Yerde Oʻrganing.',
    heroSubtitle: 'Koʻp tilli platformamiz va oʻrganishingizni tezlashtiruvchi AI yordamchisi bilan yangi mavzularni oʻzlashtiring.',
    askAI: 'AI dan soʻrang',
    popularTags: 'Ommabop Teglar',
    loginToBookmark: 'Xatchoʻplarni saqlash uchun tizimga kiring.'
  },
  ru: {
    home: 'Главная',
    subjects: 'Предметы',
    bookmarks: 'Закладки',
    signIn: 'Войти',
    signOut: 'Выйти',
    search: 'Поиск статей...',
    chatPlaceholder: 'Задайте вопрос...',
    chatTitle: 'ИИ Помощник',
    noArticles: 'В этом разделе статьи не найдены.',
    readMore: 'Читать далее',
    save: 'Сохранить',
    saved: 'Сохранено',
    startLearning: 'Начать обучение',
    welcome: 'С возвращением',
    heroTitle: 'Изучайте всё, везде.',
    heroSubtitle: 'Осваивайте новые темы с нашей многоязычной платформой и ИИ-помощником, разработанным для ускорения вашего обучения.',
    askAI: 'Спросить ИИ',
    popularTags: 'Популярные теги',
    loginToBookmark: 'Пожалуйста, войдите, чтобы сохранить закладки.'
  }
};

export const getLocalizedField = <T extends Record<string, any>>(
  item: T,
  field: string,
  language: Language
): string => {
  const key = `${field}${language.charAt(0).toUpperCase()}${language.slice(1)}`;
  return item[key] as string || '';
};
