'use client';

import { ArrowRight, ImagePlus, LoaderCircle, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useLanguage } from '@/components/shared/LanguageProvider';
import type { Photo } from '@/lib/solver/client/photo';
import { LIMITS } from '@/lib/solver/limits';

interface ComposerProps {
  problem: string;
  onProblemChange: (value: string) => void;
  photo: Photo | null;
  preparingPhoto: boolean;
  onPhoto: (file: File) => void;
  onRemovePhoto: () => void;
  onSubmit: () => void;
  busy: boolean;
}

const formatBytes = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export function Composer({
  problem,
  onProblemChange,
  photo,
  preparingPhoto,
  onPhoto,
  onRemovePhoto,
  onSubmit,
  busy,
}: ComposerProps) {
  const { t } = useLanguage();
  const copy = t.solver;
  const fileInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const canSubmit = !busy && !preparingPhoto && (problem.trim().length > 0 || photo !== null);
  const nearLimit = problem.length > LIMITS.problemChars * 0.9;

  const takeFile = (files: FileList | null | undefined) => {
    const file = files?.[0];
    if (file) onPhoto(file);
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) onSubmit();
      }}
      onDragOver={(event) => {
        if (busy || !event.dataTransfer.types.includes('Files')) return;
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!busy) takeFile(event.dataTransfer.files);
      }}
      className={`relative rounded-2xl border bg-white/[0.025] transition-colors duration-300 ${
        dragging ? 'border-[#E5C158]/60' : 'border-white/[0.1] focus-within:border-white/[0.22]'
      }`}
    >
      <label htmlFor="problem" className="sr-only">
        {copy.placeholder}
      </label>
      <textarea
        id="problem"
        value={problem}
        onChange={(event) => onProblemChange(event.target.value.slice(0, LIMITS.problemChars))}
        onPaste={(event) => {
          const image = Array.from(event.clipboardData.files).find((file) => file.type.startsWith('image/'));
          if (image && !busy) {
            event.preventDefault();
            onPhoto(image);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && canSubmit) {
            event.preventDefault();
            onSubmit();
          }
        }}
        placeholder={copy.placeholder}
        disabled={busy}
        rows={5}
        maxLength={LIMITS.problemChars}
        spellCheck
        className="block max-h-[50vh] min-h-[148px] w-full resize-y bg-transparent px-5 pb-3 pt-5 text-[15.5px] leading-[1.65] text-[#F5F5F7] placeholder:text-[#5B5B63] focus:outline-none disabled:opacity-60 sm:px-6"
      />

      {(photo || preparingPhoto) && (
        <div className="mx-5 mb-4 flex items-center gap-4 rounded-xl border border-white/[0.08] bg-black/40 p-2.5 pr-3 sm:mx-6">
          {photo ? (
            <img src={photo.url} alt={copy.photoAlt} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
          ) : (
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-white/[0.04]">
              <LoaderCircle size={18} strokeWidth={1.4} className="animate-spin text-[#71717A]" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] text-[#F5F5F7]">{photo ? photo.name : copy.preparingPhoto}</p>
            {photo && <p className="mt-0.5 font-mono text-[11px] text-[#71717A]">{formatBytes(photo.blob.size)} · JPEG</p>}
          </div>
          {photo && !busy && (
            <button
              type="button"
              onClick={onRemovePhoto}
              aria-label={copy.removePhoto}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#71717A] transition-colors hover:bg-white/[0.06] hover:text-[#F5F5F7]"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.06] px-3 py-3 sm:px-4">
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="hidden"
          onChange={(event) => {
            takeFile(event.target.files);
            event.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={busy || preparingPhoto}
          className="flex items-center gap-2 rounded-full border border-white/[0.12] px-3.5 py-1.5 text-[13px] text-[#D4D4D8] transition-colors hover:border-white/30 hover:text-[#F5F5F7] disabled:pointer-events-none disabled:opacity-40"
        >
          <ImagePlus size={15} strokeWidth={1.5} />
          {photo ? copy.replacePhoto : copy.addPhoto}
        </button>
        <span className="hidden font-mono text-[10.5px] tracking-[0.04em] text-[#5B5B63] lg:inline">{copy.photoHint}</span>

        <div className="ml-auto flex items-center gap-4">
          <span
            className={`font-mono text-[10.5px] tabular-nums ${nearLimit ? 'text-[#E5C158]' : 'text-[#5B5B63]'}`}
            aria-live="polite"
          >
            {copy.characters(problem.length, LIMITS.problemChars)}
          </span>
          <span className="hidden font-mono text-[10.5px] text-[#5B5B63] xl:inline">{copy.shortcut}</span>
          <button
            type="submit"
            disabled={!canSubmit}
            className="group flex items-center gap-1.5 rounded-full bg-[#F5F5F7] px-5 py-2 text-[13.5px] font-medium text-black transition-[transform,opacity] duration-300 hover:scale-[1.03] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30"
          >
            {copy.solve}
            <ArrowRight size={15} strokeWidth={1.8} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {dragging && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-2xl bg-black/80">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#E5C158]">{copy.dropHere}</p>
        </div>
      )}
    </form>
  );
}
