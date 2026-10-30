import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageCircle, Globe } from 'lucide-react';
import { Language, Translations } from '../utils/translations';
import { buildFriendSharePayload } from '../utils/urlLang';
import { sounds } from '../utils/sound';

interface ShareFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
  roomCode?: string | null;
  isDarkMode: boolean;
  t: Translations;
  onCopiedToast?: (msg: string) => void;
}

export const ShareFriendModal: React.FC<ShareFriendModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  roomCode,
  isDarkMode,
  t,
  onCopiedToast,
}) => {
  const [selectedShareLang, setSelectedShareLang] = useState<Language>(currentLanguage);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://chhakisuna.netlify.app';
  const pathname =
    typeof window !== 'undefined' ? window.location.pathname : '/';

  const payload = buildFriendSharePayload(selectedShareLang, roomCode, origin, pathname);

  const handleCopyMessage = () => {
    sounds.playClick();
    navigator.clipboard.writeText(payload.fullMessage).then(() => {
      setCopied(true);
      onCopiedToast?.(t.messageCopied);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handleShareNative = async () => {
    sounds.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: payload.title,
          text: payload.text,
          url: payload.url,
        });
      } catch {
        // user cancelled native share
      }
    } else {
      handleCopyMessage();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    payload.fullMessage
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-friend-heading"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in"
    >
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-5 transition-all ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="share-friend-heading" className="font-extrabold text-base leading-tight">
                {t.shareWithFriend}
              </h3>
              {roomCode && (
                <span className="text-[11px] font-mono font-bold text-indigo-400">
                  {t.roomCode}: {roomCode}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            aria-label={t.close}
            className={`p-2 rounded-xl transition-colors ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language Prompt Question */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
            <Globe className="w-4 h-4" />
            <span>{t.shareLanguagePromptTitle}</span>
          </div>
          <p className="text-xs text-slate-400">{t.shareLanguagePromptSubtitle}</p>

          {/* Native Language Choice Buttons: ଓଡ଼ିଆ vs English */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setSelectedShareLang('or');
                setCopied(false);
              }}
              className={`py-3.5 px-4 rounded-2xl border-2 font-extrabold text-base transition-all flex flex-col items-center justify-center gap-1 ${
                selectedShareLang === 'or'
                  ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400 shadow-md shadow-indigo-500/10'
                  : isDarkMode
                  ? 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>ଓଡ଼ିଆ</span>
              <span className="text-[10px] font-mono font-normal opacity-75">/odia</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setSelectedShareLang('en');
                setCopied(false);
              }}
              className={`py-3.5 px-4 rounded-2xl border-2 font-extrabold text-base transition-all flex flex-col items-center justify-center gap-1 ${
                selectedShareLang === 'en'
                  ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400 shadow-md shadow-indigo-500/10'
                  : isDarkMode
                  ? 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>English</span>
              <span className="text-[10px] font-mono font-normal opacity-75">/en</span>
            </button>
          </div>
        </div>

        {/* Message Preview Box */}
        <div
          className={`p-3.5 rounded-2xl border text-xs leading-relaxed break-words space-y-1.5 ${
            isDarkMode
              ? 'bg-slate-950/80 border-slate-800 text-slate-300'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <p className="font-medium">{payload.text}</p>
          <p className="font-mono font-bold text-indigo-400 break-all">{payload.url}</p>
        </div>

        {/* Share Action Buttons */}
        <div className="space-y-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sounds.playClick()}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t.shareViaWhatsApp}</span>
          </a>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleCopyMessage}
              className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t.copied : t.copyShareMessage}</span>
            </button>

            <button
              type="button"
              onClick={handleShareNative}
              className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                isDarkMode
                  ? 'border-slate-700 hover:bg-slate-800 text-slate-200'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Share2 className="w-4 h-4 text-indigo-500" />
              <span>{t.shareViaSystem}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
