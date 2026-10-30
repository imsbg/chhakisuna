import React from 'react';
import {
  ShieldCheck,
  Wifi,
  HardDrive,
  Scale,
  ArrowLeft,
  ExternalLink,
  Smartphone,
} from 'lucide-react';
import { Translations } from '../utils/translations';
import { sounds } from '../utils/sound';

interface TermsPageProps {
  t: Translations;
  isDarkMode: boolean;
  onBackToGame: () => void;
}

const PLAY_STORE_DEV_URL =
  'https://play.google.com/store/apps/dev?id=6501689567504406715';

export const TermsPage: React.FC<TermsPageProps> = ({
  t,
  isDarkMode,
  onBackToGame,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 animate-fade-in pt-1 pb-14 sm:pb-16">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onBackToGame();
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold transition-all active:scale-95 ${
            isDarkMode
              ? 'bg-slate-900 border-slate-800 text-slate-200 hover:border-indigo-500'
              : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-500 shadow-sm'
          }`}
        >
          <ArrowLeft className="w-4 h-4 text-indigo-500" />
          <span>{t.backToGame}</span>
        </button>
      </div>

      {/* Main Terms & Privacy Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${
          isDarkMode
            ? 'bg-slate-900/85 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="border-b border-slate-800/40 pb-5 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>{t.appTitle}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.termsPageTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">{t.termsPageSubtitle}</p>
        </div>

        {/* Policy Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Zero Data Collection */}
          <div
            className={`p-5 rounded-2xl border space-y-2 ${
              isDarkMode
                ? 'bg-slate-800/50 border-slate-700/70'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5 text-emerald-500 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <h3>{t.termsNoDataTitle}</h3>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-400">
              {t.termsNoDataDesc}
            </p>
          </div>

          {/* 2. WebRTC Peer-to-Peer */}
          <div
            className={`p-5 rounded-2xl border space-y-2 ${
              isDarkMode
                ? 'bg-slate-800/50 border-slate-700/70'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5 text-indigo-400 font-bold text-sm">
              <Wifi className="w-5 h-5 shrink-0" />
              <h3>{t.termsWebrtcTitle}</h3>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-400">
              {t.termsWebrtcDesc}
            </p>
          </div>

          {/* 3. Local Device Storage */}
          <div
            className={`p-5 rounded-2xl border space-y-2 ${
              isDarkMode
                ? 'bg-slate-800/50 border-slate-700/70'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5 text-sky-400 font-bold text-sm">
              <HardDrive className="w-5 h-5 shrink-0" />
              <h3>{t.termsLocalStorageTitle}</h3>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-400">
              {t.termsLocalStorageDesc}
            </p>
          </div>

          {/* 4. Fair Play & Auto-Expiry */}
          <div
            className={`p-5 rounded-2xl border space-y-2 ${
              isDarkMode
                ? 'bg-slate-800/50 border-slate-700/70'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
              <Scale className="w-5 h-5 shrink-0" />
              <h3>{t.termsFairPlayTitle}</h3>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-400">
              {t.termsFairPlayDesc}
            </p>
          </div>
        </div>

        {/* Download More Apps Card */}
        <div
          className={`p-5 sm:p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isDarkMode
              ? 'bg-gradient-to-r from-indigo-950/60 via-slate-900 to-violet-950/60 border-indigo-500/30'
              : 'bg-gradient-to-r from-indigo-50 via-white to-violet-50 border-indigo-200'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base">{t.moreAppsTitle}</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                {t.moreAppsDesc}
              </p>
            </div>
          </div>

          <a
            href={PLAY_STORE_DEV_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sounds.playClick()}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-2 shrink-0 transition-all active:scale-95"
          >
            <span>{t.downloadMoreAppsBtn}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
