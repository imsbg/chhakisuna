import React, { useState } from 'react';
import { X, Copy, Check, Share2, Smartphone } from 'lucide-react';
import { Translations } from '../utils/translations';
import { sounds } from '../utils/sound';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  isDarkMode: boolean;
  t: Translations;
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  isDarkMode,
  t,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !roomCode) return null;

  const joinUrl = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopied(true);
      sounds.playClick();
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Play Tic Tac Toe in Room ${roomCode}`,
          text: `Join my WebRTC Tic Tac Toe room (${roomCode}) to play or spectate live!`,
          url: joinUrl,
        });
      } catch {
        // user cancelled share
      }
    } else {
      handleCopy();
    }
  };

  // QR Code URL using standard high-availability SVG QR endpoint
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    joinUrl
  )}&margin=10`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-heading"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        className={`w-full max-w-sm rounded-3xl border shadow-2xl p-6 text-center space-y-5 transition-all ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-500" />
            <h3 id="qr-heading" className="font-bold text-base">
              {t.shareRoom}
            </h3>
          </div>
          <button
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

        {/* Room Code Badge */}
        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
          <span className="text-xs uppercase tracking-wider font-semibold block mb-0.5">
            {t.roomCode}
          </span>
          <span className="font-mono text-3xl font-extrabold tracking-widest">
            {roomCode}
          </span>
        </div>

        {/* QR Code Container with nice rounded border */}
        <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-200 inline-block mx-auto">
          <img
            src={qrSvgUrl}
            alt={`QR code to join room ${roomCode}`}
            className="w-48 h-48 mx-auto object-contain"
            onError={(e) => {
              // fallback if external image server fails
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <p className="text-[11px] font-semibold text-slate-500 mt-2">
            {t.scanWithCamera}
          </p>
        </div>

        {/* Invite link & Copy action */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={joinUrl}
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-mono border truncate ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t.copied : t.copyLink}</span>
            </button>
          </div>

          <button
            onClick={handleShare}
            className="w-full py-2.5 rounded-xl border border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>{t.shareViaMessaging}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
