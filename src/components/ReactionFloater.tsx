import React, { useState, useEffect } from 'react';
import { Sparkles, MessageCircle } from 'lucide-react';
import { sounds } from '../utils/sound';
import { Translations } from '../utils/translations';

export interface FloatingItem {
  id: string;
  emoji: string;
  sender: string;
  leftPercent: number;
}

interface ReactionFloaterProps {
  onSendReaction: (emoji: string) => void;
  activeReactions: FloatingItem[];
  t: Translations;
  isDarkMode: boolean;
}

export const REACTION_EMOJIS = ['👏', '🔥', '😮', '❤️', '🎉', '🏆', '💯'];

export const ReactionFloater: React.FC<ReactionFloaterProps> = ({
  onSendReaction,
  activeReactions,
  t,
  isDarkMode,
}) => {
  return (
    <>
      {/* Floating animations container */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        {activeReactions.map((item) => (
          <div
            key={item.id}
            style={{ left: `${item.leftPercent}%`, bottom: '90px' }}
            className="absolute flex flex-col items-center animate-float-up pointer-events-none"
          >
            <span className="text-3xl sm:text-4xl filter drop-shadow-lg select-none">
              {item.emoji}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white shadow-sm mt-0.5 whitespace-nowrap">
              {item.sender}
            </span>
          </div>
        ))}
      </div>

      {/* Cheerful reaction button bar */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl border bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-md border-slate-200/80 dark:border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1 hidden sm:flex">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          {t.sendReaction}:
        </span>
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              sounds.playReaction();
              onSendReaction(emoji);
            }}
            aria-label={`Send reaction ${emoji}`}
            className="p-1.5 sm:p-2 rounded-xl text-lg hover:scale-125 active:scale-95 transition-all duration-150 hover:bg-indigo-500/10"
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
};
