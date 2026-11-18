'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock, History as HistoryIcon, Layers, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/shared/LanguageProvider';
import {
  clearHistory,
  deleteFromHistory,
  getHistory,
  type HistoryItem,
} from '@/lib/solver/client/history';
import type { Solution } from '@/lib/solver/schema';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (solution: Solution) => void;
}

export function HistoryDrawer({ isOpen, onClose, onSelect }: HistoryDrawerProps) {
  const { t } = useLanguage();
  const copy = t.solver.history;
  const [items, setItems] = useState<HistoryItem[]>([]);

  const refresh = () => setItems(getHistory());

  useEffect(() => {
    refresh();
    const handleUpdate = () => refresh();
    window.addEventListener('physicsmn:history', handleUpdate);
    return () => window.removeEventListener('physicsmn:history', handleUpdate);
  }, []);

  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleClearAll = () => {
    if (items.length === 0) return;
    if (window.confirm(copy.clearConfirm)) {
      clearHistory();
    }
  };

  const formatTime = (ts: number) => {
    const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return copy.justNow;
    const m = Math.floor(s / 60);
    if (m < 60) return copy.minutesAgo(m);
    const h = Math.floor(m / 60);
    if (h < 24) return copy.hoursAgo(h);
    const d = Math.floor(h / 24);
    return copy.daysAgo(d);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            aria-hidden
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/[0.08] bg-[#0c0c11] shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={copy.title}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5">
              <div className="flex items-center gap-2.5">
                <HistoryIcon size={18} className="text-[#E5C158]" />
                <h2 className="font-display text-[16.5px] font-medium tracking-tight text-[#F5F5F7]">
                  {copy.title}
                </h2>
                {items.length > 0 && (
                  <span className="rounded-full bg-white/[0.07] px-2 py-0.5 font-mono text-[11px] text-[#A1A1AA]">
                    {items.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-[#71717A] transition-colors hover:bg-white/[0.04] hover:text-red-400"
                  >
                    {copy.clearAll}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-[#71717A] transition-colors hover:bg-white/[0.06] hover:text-[#F5F5F7]"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.02] text-[#52525B]">
                    <Clock size={20} />
                  </div>
                  <p className="mt-4 font-medium text-[#F5F5F7]">{copy.empty}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[#71717A]">{copy.emptyDetail}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <article
                      key={item.id}
                      onClick={() => onSelect(item.solution)}
                      className="group relative cursor-pointer rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 transition-all duration-200 hover:border-[#E5C158]/40 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[10px] uppercase tracking-wider text-[#E5C158]/80">
                              {item.grade}. Sınıf · {item.unit}
                            </span>
                            <span className="text-[11px] text-[#52525B]">·</span>
                            <span className="font-mono text-[10.5px] text-[#71717A]">
                              {formatTime(item.timestamp)}
                            </span>
                          </div>

                          <h3 className="truncate font-display text-[15px] font-normal text-[#F5F5F7] group-hover:text-white">
                            {item.topicTitle}
                          </h3>

                          {item.problemSnippet && (
                            <p className="line-clamp-2 text-[12.5px] leading-relaxed text-[#A1A1AA]">
                              {item.problemSnippet}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2.5 pt-1">
                            {item.problemCount > 1 && (
                              <span className="inline-flex items-center gap-1 rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10.5px] text-[#D4D4D8]">
                                <Layers size={11} className="text-[#E5C158]" />
                                {copy.questionsCount(item.problemCount)}
                              </span>
                            )}
                            {item.hasMathVerified && (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10.5px] text-emerald-400">
                                <CheckCircle2 size={11} />
                                {copy.verified}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFromHistory(item.id);
                          }}
                          className="rounded-lg p-1.5 text-[#52525B] opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                          title={copy.delete}
                          aria-label={copy.delete}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
