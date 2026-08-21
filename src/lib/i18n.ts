// src/lib/i18n.ts
// Locale routing helpers + bilingual content map.
// Used by /[lang]/ pages and the language toggle.

export const LOCALES = ['en', 'zh'] as const;
export type Locale = typeof LOCALES[number];
export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Get locale from a URL pathname. */
export function getLocaleFromPath(pathname: string): Locale {
  const seg = pathname.split('/').filter(Boolean)[0];
  return isLocale(seg) ? seg : DEFAULT_LOCALE;
}

/** Strip the locale prefix from a path (returns /path). */
export function stripLocale(pathname: string): string {
  const segs = pathname.split('/').filter(Boolean);
  if (isLocale(segs[0])) segs.shift();
  const result = '/' + segs.join('/');
  return result === '/' ? '/' : result.replace(/\/$/, '');
}

/** Build a path for the given locale.
 *  Anchor links (`#xxx` or `/#xxx`) keep the right locale prefix and never
 *  need a separate page. Real paths get the locale prefix on non-default locales.
 */
export function localizedPath(locale: Locale, path: string): string {
  if (path.startsWith('#')) {
    const base = locale === DEFAULT_LOCALE ? '/' : `/${locale}`;
    return `${base}${path}`;
  }
  if (path.startsWith('/#')) {
    const base = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
    return `${base}${path}`;
  }
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return `/${locale}${clean === '/' ? '' : clean}`;
}

/** All site paths in order (used to build the nav + sitemap).
 *  About/Services/Training/Gallery/Contact are anchor links to sections
 *  on the home page (where the content actually lives). Only Insights has
 *  its own real route.
 */
export const SITE_PATHS = [
  { href: '/',              label_en: 'Home',           label_zh: '首页' },
  { href: '/#about',        label_en: 'About',          label_zh: '关于' },
  { href: '/#services',     label_en: 'Services',       label_zh: '服务' },
  { href: '/#training',     label_en: 'Training',       label_zh: '课程' },
  { href: '/insights',      label_en: 'Insights',       label_zh: '见解' },
  { href: '/#past-training',label_en: 'Gallery',        label_zh: '活动' },
  { href: '/#contact',      label_en: 'Contact',        label_zh: '联系' },
] as const;
