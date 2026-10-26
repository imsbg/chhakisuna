import React, { useState } from 'react';
import { Download, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';
import { Translations } from '../utils/translations';
import { sounds } from '../utils/sound';

/**
 * =========================================================================
 * 📢 FEATURED SPONSORED APP (EDIT DIRECTLY HERE IN HTML / CODE)
 * You (Sandeep Biswal G) can customize your app name, logo, description & URL below.
 * This Featured App is permanent, always ON, and cannot be disabled by players.
 * =========================================================================
 */
export const SPONSORED_APP = {
  appName: 'Odia Bhasa App',
  appLogoUrl: 'https://imsbg.github.io/odiabhasa/images/app.png',
  shortDescription: 'ଶିଖିବା ଓ ପଢିବାପାଇଁ ସର୍ବଶ୍ରେଷ୍ଠ ଓଡ଼ିଆ ଆପ୍',
  downloadButtonUrl: 'https://play.google.com/store/apps/details?id=in.sandeep.odiabhasa',
  buttonLabel: 'Download Now',
};

interface PromoBannerProps {
  t: Translations;
  isDarkMode: boolean;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ t, isDarkMode }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <aside
      aria-label="Sponsored Application"
      className={`fixed bottom-2 left-2 right-2 sm:bottom-3 sm:left-4 sm:right-4 max-w-3xl mx-auto z-40 transition-all duration-300 rounded-2xl border shadow-2xl p-2.5 sm:p-3.5 backdrop-blur-xl ${
        isDarkMode
          ? 'bg-slate-900/95 border-slate-800/90 text-slate-100 shadow-indigo-950/40'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/60'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: App Logo & Details */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative shrink-0">
            {SPONSORED_APP.appLogoUrl && !imageError ? (
              <img
                src={SPONSORED_APP.appLogoUrl}
                alt={`${SPONSORED_APP.appName} logo`}
                onError={() => setImageError(true)}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-indigo-500/20 shadow-sm ring-1 ring-indigo-500/10"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            )}
            <span
              className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
              title="Verified App"
            >
              <ShieldCheck className="h-2 w-2 text-white" />
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                {t.promoBadge}
              </span>
              <h4 className="font-bold text-xs sm:text-sm truncate">
                {SPONSORED_APP.appName}
              </h4>
            </div>
            <p className={`text-[11px] sm:text-xs truncate max-w-xs sm:max-w-md ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {SPONSORED_APP.shortDescription}
            </p>
          </div>
        </div>

        {/* Right: Permanent Download Button */}
        <div className="shrink-0">
          <a
            href={SPONSORED_APP.downloadButtonUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sounds.playClick()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/30 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.downloadNow}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70 hidden sm:inline" />
          </a>
        </div>
      </div>
    </aside>
  );
};
