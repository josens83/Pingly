/**
 * Internationalization (i18n) System (Airbnb Style)
 *
 * Features:
 * - ICU MessageFormat support
 * - Pluralization
 * - Date/Time/Number formatting
 * - RTL support
 * - Lazy loading of translations
 * - Context-aware translations
 */

export type Locale = string;
export type TranslationKey = string;
export type TranslationNamespace = string;

export interface TranslationValues {
  [key: string]: string | number | boolean | Date | undefined;
}

export interface PluralRules {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

export interface TranslationEntry {
  value: string | PluralRules;
  context?: string;
  description?: string;
}

export type TranslationDictionary = {
  [key: string]: string | TranslationEntry | TranslationDictionary;
};

export interface I18nConfig {
  defaultLocale: Locale;
  supportedLocales: Locale[];
  fallbackLocale: Locale;
  loadPath: string;
  namespaces: TranslationNamespace[];
  defaultNamespace: TranslationNamespace;
  interpolation: {
    prefix: string;
    suffix: string;
  };
  pluralRules?: (locale: Locale, count: number) => keyof PluralRules;
}

export interface LocaleInfo {
  code: Locale;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: string;
  currency: string;
  numberFormat: {
    decimal: string;
    thousands: string;
  };
}

// Built-in locale information
const LOCALE_INFO: Record<string, LocaleInfo> = {
  'en-US': {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'h:mm A',
    currency: 'USD',
    numberFormat: { decimal: '.', thousands: ',' }
  },
  'ko-KR': {
    code: 'ko-KR',
    name: 'Korean',
    nativeName: '한국어',
    direction: 'ltr',
    dateFormat: 'YYYY년 MM월 DD일',
    timeFormat: 'HH:mm',
    currency: 'KRW',
    numberFormat: { decimal: '.', thousands: ',' }
  },
  'ja-JP': {
    code: 'ja-JP',
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: 'HH:mm',
    currency: 'JPY',
    numberFormat: { decimal: '.', thousands: ',' }
  },
  'zh-CN': {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    direction: 'ltr',
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: 'HH:mm',
    currency: 'CNY',
    numberFormat: { decimal: '.', thousands: ',' }
  },
  'zh-TW': {
    code: 'zh-TW',
    name: 'Chinese (Traditional)',
    nativeName: '繁體中文',
    direction: 'ltr',
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: 'HH:mm',
    currency: 'TWD',
    numberFormat: { decimal: '.', thousands: ',' }
  },
  'ar-SA': {
    code: 'ar-SA',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    currency: 'SAR',
    numberFormat: { decimal: '٫', thousands: '٬' }
  },
  'he-IL': {
    code: 'he-IL',
    name: 'Hebrew',
    nativeName: 'עברית',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    currency: 'ILS',
    numberFormat: { decimal: '.', thousands: ',' }
  },
  'es-ES': {
    code: 'es-ES',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    currency: 'EUR',
    numberFormat: { decimal: ',', thousands: '.' }
  },
  'fr-FR': {
    code: 'fr-FR',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    currency: 'EUR',
    numberFormat: { decimal: ',', thousands: ' ' }
  },
  'de-DE': {
    code: 'de-DE',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    currency: 'EUR',
    numberFormat: { decimal: ',', thousands: '.' }
  },
  'pt-BR': {
    code: 'pt-BR',
    name: 'Portuguese (Brazil)',
    nativeName: 'Português',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    currency: 'BRL',
    numberFormat: { decimal: ',', thousands: '.' }
  },
  'vi-VN': {
    code: 'vi-VN',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    currency: 'VND',
    numberFormat: { decimal: ',', thousands: '.' }
  },
  'th-TH': {
    code: 'th-TH',
    name: 'Thai',
    nativeName: 'ไทย',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    currency: 'THB',
    numberFormat: { decimal: '.', thousands: ',' }
  }
};

type LocaleChangeListener = (locale: Locale) => void;

class I18nService {
  private config: I18nConfig;
  private currentLocale: Locale;
  private translations: Map<string, TranslationDictionary> = new Map();
  private loadedNamespaces: Set<string> = new Set();
  private listeners: Set<LocaleChangeListener> = new Set();
  private cache: Map<string, string> = new Map();

  constructor() {
    this.config = this.getDefaultConfig();
    this.currentLocale = this.config.defaultLocale;
  }

  private getDefaultConfig(): I18nConfig {
    return {
      defaultLocale: 'ko-KR',
      supportedLocales: Object.keys(LOCALE_INFO),
      fallbackLocale: 'en-US',
      loadPath: '/locales/{{locale}}/{{namespace}}.json',
      namespaces: ['common', 'messages', 'errors', 'forms'],
      defaultNamespace: 'common',
      interpolation: {
        prefix: '{{',
        suffix: '}}'
      }
    };
  }

  /**
   * Initialize the i18n service
   */
  async initialize(config?: Partial<I18nConfig>): Promise<void> {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Detect locale from browser or storage
    this.currentLocale = this.detectLocale();

    // Load default namespace
    await this.loadNamespace(this.config.defaultNamespace);
  }

  /**
   * Detect user's preferred locale
   */
  private detectLocale(): Locale {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('preferred_locale');
      if (stored && this.config.supportedLocales.includes(stored)) {
        return stored;
      }

      // Check browser language
      const browserLang = navigator.language;
      if (this.config.supportedLocales.includes(browserLang)) {
        return browserLang;
      }

      // Check for language match without region
      const langCode = browserLang.split('-')[0];
      const match = this.config.supportedLocales.find(
        locale => locale.startsWith(langCode)
      );
      if (match) {
        return match;
      }
    }

    return this.config.defaultLocale;
  }

  /**
   * Load translations for a namespace
   */
  async loadNamespace(namespace: TranslationNamespace): Promise<void> {
    const key = `${this.currentLocale}:${namespace}`;

    if (this.loadedNamespaces.has(key)) {
      return;
    }

    const path = this.config.loadPath
      .replace('{{locale}}', this.currentLocale)
      .replace('{{namespace}}', namespace);

    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load translations: ${path}`);
      }

      const data = await response.json();
      this.translations.set(key, data);
      this.loadedNamespaces.add(key);
    } catch (error) {
      console.warn(`Failed to load namespace ${namespace} for locale ${this.currentLocale}:`, error);

      // Try fallback locale
      if (this.currentLocale !== this.config.fallbackLocale) {
        const fallbackPath = this.config.loadPath
          .replace('{{locale}}', this.config.fallbackLocale)
          .replace('{{namespace}}', namespace);

        try {
          const response = await fetch(fallbackPath);
          if (response.ok) {
            const data = await response.json();
            this.translations.set(key, data);
            this.loadedNamespaces.add(key);
          }
        } catch {
          console.error(`Failed to load fallback translations for ${namespace}`);
        }
      }
    }
  }

  /**
   * Change current locale
   */
  async setLocale(locale: Locale): Promise<void> {
    if (!this.config.supportedLocales.includes(locale)) {
      throw new Error(`Unsupported locale: ${locale}`);
    }

    this.currentLocale = locale;
    this.cache.clear();
    this.loadedNamespaces.clear();

    // Persist preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred_locale', locale);
    }

    // Reload all namespaces
    await Promise.all(
      this.config.namespaces.map(ns => this.loadNamespace(ns))
    );

    // Notify listeners
    this.listeners.forEach(listener => listener(locale));

    // Update document direction
    if (typeof document !== 'undefined') {
      const info = this.getLocaleInfo();
      document.documentElement.dir = info.direction;
      document.documentElement.lang = locale;
    }
  }

  /**
   * Get current locale
   */
  getLocale(): Locale {
    return this.currentLocale;
  }

  /**
   * Get locale information
   */
  getLocaleInfo(locale?: Locale): LocaleInfo {
    return LOCALE_INFO[locale || this.currentLocale] || LOCALE_INFO['en-US'];
  }

  /**
   * Get all supported locales
   */
  getSupportedLocales(): LocaleInfo[] {
    return this.config.supportedLocales.map(
      locale => LOCALE_INFO[locale] || { code: locale, name: locale, nativeName: locale, direction: 'ltr', dateFormat: '', timeFormat: '', currency: '', numberFormat: { decimal: '.', thousands: ',' } }
    );
  }

  /**
   * Translate a key
   */
  t(
    key: TranslationKey,
    values?: TranslationValues,
    options?: { namespace?: string; context?: string; count?: number }
  ): string {
    const namespace = options?.namespace || this.config.defaultNamespace;
    const cacheKey = `${this.currentLocale}:${namespace}:${key}:${JSON.stringify(values)}:${options?.context}:${options?.count}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Get translation
    const translation = this.getTranslation(key, namespace);

    if (!translation) {
      console.warn(`Missing translation: ${namespace}:${key}`);
      return key;
    }

    let result: string;

    if (typeof translation === 'string') {
      result = translation;
    } else if (typeof translation === 'object') {
      // Handle plural or context
      if (options?.count !== undefined && 'other' in translation) {
        result = this.selectPlural(translation as PluralRules, options.count);
      } else if ('value' in translation) {
        result = translation.value as string;
      } else {
        result = key;
      }
    } else {
      result = key;
    }

    // Interpolate values
    if (values) {
      result = this.interpolate(result, values);
    }

    // Cache result
    this.cache.set(cacheKey, result);

    return result;
  }

  /**
   * Get raw translation value
   */
  private getTranslation(key: TranslationKey, namespace: string): string | TranslationEntry | undefined {
    const dictKey = `${this.currentLocale}:${namespace}`;
    const dictionary = this.translations.get(dictKey);

    if (!dictionary) {
      return undefined;
    }

    // Support nested keys with dot notation
    const parts = key.split('.');
    let current: TranslationDictionary | string | TranslationEntry | undefined = dictionary;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as TranslationDictionary)[part];
      } else {
        return undefined;
      }
    }

    return current as string | TranslationEntry | undefined;
  }

  /**
   * Select plural form based on count
   */
  private selectPlural(rules: PluralRules, count: number): string {
    // Use Intl.PluralRules if available
    if (typeof Intl !== 'undefined' && Intl.PluralRules) {
      const pluralRules = new Intl.PluralRules(this.currentLocale);
      const form = pluralRules.select(count) as keyof PluralRules;
      return rules[form] || rules.other;
    }

    // Fallback to simple English rules
    if (count === 0 && rules.zero) return rules.zero;
    if (count === 1 && rules.one) return rules.one;
    if (count === 2 && rules.two) return rules.two;
    return rules.other;
  }

  /**
   * Interpolate values into string
   */
  private interpolate(str: string, values: TranslationValues): string {
    const { prefix, suffix } = this.config.interpolation;

    return str.replace(
      new RegExp(`${this.escapeRegex(prefix)}(\\w+)${this.escapeRegex(suffix)}`, 'g'),
      (_, key) => {
        const value = values[key];
        if (value === undefined) return `${prefix}${key}${suffix}`;
        if (value instanceof Date) return this.formatDate(value);
        return String(value);
      }
    );
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Format a date according to current locale
   */
  formatDate(date: Date, style: 'full' | 'long' | 'medium' | 'short' = 'medium'): string {
    return new Intl.DateTimeFormat(this.currentLocale, {
      dateStyle: style
    }).format(date);
  }

  /**
   * Format a time according to current locale
   */
  formatTime(date: Date, style: 'full' | 'long' | 'medium' | 'short' = 'short'): string {
    return new Intl.DateTimeFormat(this.currentLocale, {
      timeStyle: style
    }).format(date);
  }

  /**
   * Format a date and time according to current locale
   */
  formatDateTime(
    date: Date,
    dateStyle: 'full' | 'long' | 'medium' | 'short' = 'medium',
    timeStyle: 'full' | 'long' | 'medium' | 'short' = 'short'
  ): string {
    return new Intl.DateTimeFormat(this.currentLocale, {
      dateStyle,
      timeStyle
    }).format(date);
  }

  /**
   * Format a number according to current locale
   */
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLocale, options).format(value);
  }

  /**
   * Format currency according to current locale
   */
  formatCurrency(value: number, currency?: string): string {
    const curr = currency || this.getLocaleInfo().currency;
    return new Intl.NumberFormat(this.currentLocale, {
      style: 'currency',
      currency: curr
    }).format(value);
  }

  /**
   * Format a relative time (e.g., "2 days ago")
   */
  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    const diffWeek = Math.round(diffDay / 7);
    const diffMonth = Math.round(diffDay / 30);
    const diffYear = Math.round(diffDay / 365);

    const rtf = new Intl.RelativeTimeFormat(this.currentLocale, { numeric: 'auto' });

    if (Math.abs(diffSec) < 60) {
      return rtf.format(diffSec, 'second');
    } else if (Math.abs(diffMin) < 60) {
      return rtf.format(diffMin, 'minute');
    } else if (Math.abs(diffHour) < 24) {
      return rtf.format(diffHour, 'hour');
    } else if (Math.abs(diffDay) < 7) {
      return rtf.format(diffDay, 'day');
    } else if (Math.abs(diffWeek) < 4) {
      return rtf.format(diffWeek, 'week');
    } else if (Math.abs(diffMonth) < 12) {
      return rtf.format(diffMonth, 'month');
    } else {
      return rtf.format(diffYear, 'year');
    }
  }

  /**
   * Format a list according to current locale
   */
  formatList(items: string[], style: 'conjunction' | 'disjunction' | 'unit' = 'conjunction'): string {
    return new Intl.ListFormat(this.currentLocale, { style, type: style }).format(items);
  }

  /**
   * Subscribe to locale changes
   */
  onLocaleChange(listener: LocaleChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Check if current locale is RTL
   */
  isRTL(): boolean {
    return this.getLocaleInfo().direction === 'rtl';
  }

  /**
   * Add translations programmatically
   */
  addTranslations(locale: Locale, namespace: string, translations: TranslationDictionary): void {
    const key = `${locale}:${namespace}`;
    const existing = this.translations.get(key) || {};
    this.translations.set(key, { ...existing, ...translations });
    this.cache.clear();
  }
}

// Singleton instance
export const i18n = new I18nService();

// Shorthand function
export function t(
  key: TranslationKey,
  values?: TranslationValues,
  options?: { namespace?: string; context?: string; count?: number }
): string {
  return i18n.t(key, values, options);
}

// React hooks
export function useTranslation(namespace?: string) {
  return {
    t: (key: string, values?: TranslationValues, opts?: { context?: string; count?: number }) =>
      i18n.t(key, values, { ...opts, namespace }),
    i18n,
    locale: i18n.getLocale(),
    isRTL: i18n.isRTL()
  };
}

export function useLocale(): [Locale, (locale: Locale) => Promise<void>] {
  return [i18n.getLocale(), (locale) => i18n.setLocale(locale)];
}
