import de from './de.json';
import en from './en.json';

export const translations = {
  de,
  en,
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = string;

export const DEFAULT_LANGUAGE: Language = 'de';
export const LANGUAGE_STORAGE_KEY = 'ddiscover:language';

export const LANGUAGE_OPTIONS: { value: Language; labelKey: TranslationKey }[] = [
  { value: 'de', labelKey: 'language.german' },
  { value: 'en', labelKey: 'language.english' },
];

function readPath(source: unknown, path: string) {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (current && typeof current === 'object' && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, source);
}

export function translate(
  language: Language,
  key: TranslationKey,
  values?: Record<string, string | number>,
) {
  const localizedValue = readPath(translations[language], key);
  const fallbackValue = readPath(translations[DEFAULT_LANGUAGE], key);
  const rawValue = typeof localizedValue === 'string'
    ? localizedValue
    : typeof fallbackValue === 'string'
      ? fallbackValue
      : key;

  if (!values) {
    return rawValue;
  }

  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{{${name}}}`, String(value)),
    rawValue,
  );
}

export function localeForLanguage(language: Language) {
  return language === 'de' ? 'de-DE' : 'en-US';
}
