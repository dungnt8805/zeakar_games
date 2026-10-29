import EXTRA_MESSAGES from './messages.json';
export const LOCALES = ['en', 'vi', 'zh', 'fr', 'th', 'ja', 'ko'] as const;
export type Locale = typeof LOCALES[number];
export const LANGUAGE_NAMES: Record<Locale, string> = { en: 'English', vi: 'Tiếng Việt', zh: '简体中文', fr: 'Français', th: 'ไทย', ja: '日本語', ko: '한국어' };
export const HTML_LANG: Record<Locale, string> = { en: 'en', vi: 'vi', zh: 'zh-Hans', fr: 'fr', th: 'th', ja: 'ja', ko: 'ko' };
export const localizedPath = (lang: Locale, path = '/') => `${lang === 'en' ? '' : `/${lang}`}${path === '/' ? '/' : path}`;
export const localizedPolicyPath = (lang: Locale, id: string) => localizedPath(lang, `/policies/${id}`);

export const UI_TRANSLATIONS = EXTRA_MESSAGES;
