import type { Language } from './translations';

/**
 * Detects language ('en' or 'or') from URL pathname (/en or /odia) or search params.
 * Returns null if neither is explicitly present in the URL.
 */
export function detectLanguageFromUrl(pathname: string, search: string = ''): Language | null {
  const cleanPath = pathname.replace(/\/+$/, '');
  if (/\/en$/i.test(cleanPath) || cleanPath.toLowerCase() === 'en') {
    return 'en';
  }
  if (/\/odia$/i.test(cleanPath) || cleanPath.toLowerCase() === 'odia') {
    return 'or';
  }

  if (search) {
    const params = new URLSearchParams(search);
    const langParam = params.get('lang')?.toLowerCase();
    if (langParam === 'en' || langParam === 'english') return 'en';
    if (langParam === 'or' || langParam === 'odia') return 'or';
  }

  return null;
}

/**
 * Computes the updated pathname ending with `/en` (for English) or `/odia` (for Odia),
 * preserving any base path prefix if the app is hosted in a subdirectory.
 */
export function getPathWithLang(pathname: string, lang: Language): string {
  const targetSlug = lang === 'en' ? 'en' : 'odia';
  // Remove trailing slashes
  let base = pathname.replace(/\/+$/, '');
  // Strip existing /en or /odia suffix if present
  base = base.replace(/\/(en|odia)$/i, '');
  // Strip /index.html if present
  base = base.replace(/\/index\.html$/i, '');

  if (!base || base === '/') {
    return `/${targetSlug}`;
  }
  return `${base}/${targetSlug}`;
}

/**
 * Builds the full relative URL (`pathname + search + hash`) with the language slug (`/en` or `/odia`).
 */
export function buildUrlWithLang(
  pathname: string,
  search: string,
  hash: string,
  lang: Language
): string {
  const nextPath = getPathWithLang(pathname, lang);
  return `${nextPath}${search || ''}${hash || ''}`;
}
