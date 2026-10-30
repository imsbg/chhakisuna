import type { Language } from './translations';

export type AppPage = 'home' | 'terms';

/**
 * Detects whether the current pathname points to the Terms & Conditions page (/en/terms or /odia/terms).
 */
export function detectPageFromUrl(pathname: string): AppPage {
  const cleanPath = pathname.replace(/\/+$/, '');
  if (/\/terms$/i.test(cleanPath)) {
    return 'terms';
  }
  return 'home';
}

/**
 * Detects language ('en' or 'or') from URL pathname (/en, /odia, /en/terms, /odia/terms) or search params.
 * Returns null if neither is explicitly present in the URL.
 */
export function detectLanguageFromUrl(pathname: string, search: string = ''): Language | null {
  const cleanPath = pathname.replace(/\/+$/, '').replace(/\/terms$/i, '');
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
 * Computes the updated pathname ending with `/en`, `/odia`, `/en/terms`, or `/odia/terms`,
 * preserving any base path prefix if the app is hosted in a subdirectory.
 */
export function getPathWithLang(
  pathname: string,
  lang: Language,
  pageOverride?: AppPage
): string {
  const targetSlug = lang === 'en' ? 'en' : 'odia';
  const targetPage = pageOverride ?? detectPageFromUrl(pathname);

  // Remove trailing slashes
  let base = pathname.replace(/\/+$/, '');
  // Strip /terms suffix if present
  base = base.replace(/\/terms$/i, '');
  // Strip existing /en or /odia suffix if present
  base = base.replace(/\/(en|odia)$/i, '');
  // Strip /index.html if present
  base = base.replace(/\/index\.html$/i, '');

  const prefix = !base || base === '/' ? '' : base;
  const langPath = `${prefix}/${targetSlug}`;
  return targetPage === 'terms' ? `${langPath}/terms` : langPath;
}

/**
 * Builds the full relative URL (`pathname + search + hash`) with the language slug (`/en` or `/odia`)
 * and optional page override (`home` or `terms`).
 */
export function buildUrlWithLang(
  pathname: string,
  search: string,
  hash: string,
  lang: Language,
  pageOverride?: AppPage
): string {
  const nextPath = getPathWithLang(pathname, lang, pageOverride);
  return `${nextPath}${search || ''}${hash || ''}`;
}

/**
 * Generates a localized share message in Odia ('or') or English ('en') with the proper /odia or /en link.
 */
export function buildFriendSharePayload(
  shareLang: Language,
  roomCode?: string | null,
  origin: string = 'https://chhakisuna.netlify.app',
  pathname: string = '/'
): { url: string; title: string; text: string; fullMessage: string } {
  const basePath = getPathWithLang(pathname, shareLang, 'home');
  const cleanOrigin = origin.replace(/\/+$/, '');
  const url = roomCode
    ? `${cleanOrigin}${basePath}?room=${roomCode}`
    : `${cleanOrigin}${basePath}`;

  if (shareLang === 'or') {
    if (roomCode) {
      const title = `ଛକି ଶୂନ – କୋଠରି ${roomCode} ରେ ମୋ ସହିତ ଖେଳନ୍ତୁ!`;
      const text = `ଆସନ୍ତୁ ମୋ ସହିତ ଅନଲାଇନ୍ ଛକି ଶୂନ ଖେଳିବା! କୋଠରି କୋଡ୍: ${roomCode} । ଖେଳିବା କିମ୍ବା ଲାଇଭ୍ ଦେଖିବା ପାଇଁ ଏହି ଲିଙ୍କ୍ ରେ କ୍ଲିକ୍ କରନ୍ତୁ:`;
      return {
        url,
        title,
        text,
        fullMessage: `${text}\n${url}`,
      };
    }
    const title = 'ଛକି ଶୂନ – ମାଗଣା ଅନଲାଇନ୍ ଏବଂ ଏକାକୀ ଖେଳ';
    const text = 'ଆସନ୍ତୁ ସାଙ୍ଗମାନଙ୍କ ସହିତ ଅନଲାଇନ୍ କିମ୍ବା ଏକାକୀ ଛକି ଶୂନ ଖେଳିବା! ଏଠାରେ କ୍ଲିକ୍ କରନ୍ତୁ:';
    return {
      url,
      title,
      text,
      fullMessage: `${text}\n${url}`,
    };
  } else {
    if (roomCode) {
      const title = `Play Tic Tac Toe in Room ${roomCode}!`;
      const text = `Come play Tic Tac Toe online with me! Room Code: ${roomCode}. Click the link below to join as a player or watch live:`;
      return {
        url,
        title,
        text,
        fullMessage: `${text}\n${url}`,
      };
    }
    const title = 'Tic Tac Toe – Free Online & Solo Game';
    const text = 'Come play Tic Tac Toe online with friends or solo! Click here to play:';
    return {
      url,
      title,
      text,
      fullMessage: `${text}\n${url}`,
    };
  }
}
