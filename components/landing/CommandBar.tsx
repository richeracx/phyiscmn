'use client';

import { ArrowRight, ImagePlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { soundController } from '@/lib/cosmos/audio';
import { stashPhoto } from '@/lib/solver/client/handoff';
import { preparePhoto, releasePhoto, type Photo } from '@/lib/solver/client/photo';

export function CommandBar() {
  const { t } = useLanguage();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [photo, setPhoto] = useState<Photo | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const choosePhoto = async (file: File | undefined) => {
    if (!file) return;
    try {
      const prepared = await preparePhoto(file, file.name || 'photo.jpg');
      releasePhoto(photo);
      setPhoto(prepared);
    } catch {
      router.push('/solve');
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query && !photo) {
      inputRef.current?.focus();
      return;
    }
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (photo && (await stashPhoto(photo.blob, photo.name))) params.set('photo', '1');
    router.push(`/solve?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-2xl">
      <form
        onSubmit={submit}
        data-no-shock
        className="flex w-full max-w-2xl items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.03] px-5 py-2.5 backdrop-blur-xl transition-colors duration-300 focus-within:border-white/40"
      >
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.hero.placeholder}
          aria-label={t.hero.placeholder}
          enterKeyHint="go"
          className="min-w-0 flex-1 bg-transparent py-1 text-[15px] font-extralight text-white placeholder:text-[#9a9a9a] focus:outline-none"
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="hidden"
          onChange={(e) => {
            void choosePhoto(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label={t.hero.upload}
          title={t.hero.upload}
          className="grid h-8 w-8 shrink-0 place-items-center text-[#9a9a9a] transition-colors hover:text-white"
        >
          <ImagePlus size={17} strokeWidth={1.5} />
        </button>
        <button
          type="submit"
          onMouseEnter={() => soundController.playButtonHover()}
          onClick={() => soundController.playButtonClick()}
          className="group ml-1 flex shrink-0 items-center gap-1.5 rounded-full bg-white px-5 py-2 text-[13px] font-medium uppercase tracking-[0.03em] text-black transition-all duration-300 hover:bg-neutral-200 active:scale-[0.98]"
        >
          {t.hero.solve}
          <ArrowRight size={15} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>
      </form>
      <p className="mt-3 h-4 pl-6 text-left font-sans text-[12px] text-zinc-400" aria-live="polite">
        {photo ? t.hero.attached(photo.name) : ''}
      </p>
    </div>
  );
}
