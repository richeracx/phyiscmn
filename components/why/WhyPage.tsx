'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Binary,
  Check,
  FileCheck2,
  Layers,
  Lock,
  RefreshCw,
  Scale,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { LanguageSwitch } from '@/components/shared/LanguageSwitch';

export function WhyPage() {
  const { lang } = useLanguage();
  const tr = lang === 'tr';

  return (
    <div className="min-h-screen bg-black text-[#F5F5F7] selection:bg-white/20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-10">
          <Link href="/" className="flex items-center gap-2 group" aria-label="Physicsmn Home">
            <span className="font-display text-[15px] font-semibold tracking-[0.16em] text-white">
              PHYSICSMN
            </span>
            <span className="rounded-full border border-white/20 bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/70">
              {tr ? 'Neden Physicsmn' : 'Why Us'}
            </span>
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/"
              className="hidden font-mono text-[11px] uppercase tracking-[0.15em] text-white/60 transition-colors hover:text-white md:inline"
            >
              {tr ? 'Giriş' : 'Overview'}
            </Link>
            <Link
              href="/why"
              className="font-mono text-[11px] uppercase tracking-[0.15em] text-white underline underline-offset-8"
            >
              {tr ? 'Neden Physicsmn?' : 'Why Physicsmn?'}
            </Link>
            <Link
              href="/docs"
              className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/60 transition-colors hover:text-white"
            >
              {tr ? 'Belgeler & Kıyaslama' : 'Docs & Benchmark'}
            </Link>
            <LanguageSwitch />
            <Link
              href="/solve"
              className="rounded-full bg-white px-4 py-1.5 font-sans text-[12.5px] font-medium text-black transition-all hover:bg-neutral-200 active:scale-[0.98]"
            >
              {tr ? 'Çözücüyü Aç' : 'Open Solver'}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/[0.06] px-6 py-20 sm:px-10 md:py-28">
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#8052ff]/15 via-transparent to-transparent blur-3xl" />

        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-[#E5C158] backdrop-blur-md">
            <Scale size={13} className="text-[#E5C158]" />
            <span>
              {tr
                ? 'Nöro-Sembolik Mimari vs. Olasılıksal Dil Modelleri'
                : 'Neuro-Symbolic Architecture vs. Probabilistic LLMs'}
            </span>
          </div>

          <h1 className="font-sans text-[clamp(2.5rem,5.5vw,4.5rem)] font-normal leading-[1.04] tracking-[-0.03em] text-white">
            {tr ? (
              <>
                Fizik tahmin edilemez, <br className="hidden sm:inline" />
                <span className="text-white/70">ispat edilir ve denetlenir.</span>
              </>
            ) : (
              <>
                Physics cannot be guessed; <br className="hidden sm:inline" />
                <span className="text-white/70">it must be proven and audited.</span>
              </>
            )}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl font-sans text-[17px] font-light leading-[1.65] text-[#A1A1AA] sm:text-[19px]">
            {tr
              ? 'Standart üretken yapay zekalar (ChatGPT, Gemini) kelimeleri istatistiksel olasılıkla tamamlar; bu da aritmetik ve birimsel halüsinasyonlara yol açar. Physicsmn ise yapay zekayı deterministik mathjs sembolik denetimi ve otonom öz-düzeltme döngüsü ile birleştirir.'
              : 'Standard generative AI (ChatGPT, Gemini) generates text probabilistically, making it susceptible to arithmetic and dimensional hallucinations. Physicsmn pairs generative reasoning with a deterministic mathjs symbolic auditor and autonomous self-correction loop.'}
          </p>

          {/* Key Metric Pills */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center backdrop-blur-sm">
              <div className="font-mono text-[26px] font-bold text-white sm:text-[30px]">94.7%</div>
              <div className="mt-1 font-sans text-[12px] font-light text-white/60">
                {tr ? 'MEB Görsel Doğruluk' : 'MEB Visual Accuracy'}
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center backdrop-blur-sm">
              <div className="font-mono text-[26px] font-bold text-[#10B981] sm:text-[30px]">±2%</div>
              <div className="mt-1 font-sans text-[12px] font-light text-white/60">
                {tr ? 'Deterministik Tolerans' : 'Deterministic Tolerance'}
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center backdrop-blur-sm">
              <div className="font-mono text-[26px] font-bold text-[#E5C158] sm:text-[30px]">
                [M]<sup>a</sup>[L]<sup>b</sup>[T]<sup>c</sup>
              </div>
              <div className="mt-1 font-sans text-[12px] font-light text-white/60">
                {tr ? 'SI Temel Boyut Eşitliği' : 'SI Base Dimension Audit'}
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center backdrop-blur-sm">
              <div className="font-mono text-[26px] font-bold text-white sm:text-[30px]">100%</div>
              <div className="mt-1 font-sans text-[12px] font-light text-white/60">
                {tr ? 'Yerel Gizlilik (Sıfır İzleme)' : 'Offline Local Privacy'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Section */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <div className="mb-14 text-center">
          <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-white/50">
            {tr ? '01 // MİMARİ KARŞILAŞTIRMA' : '01 // ARCHITECTURAL COMPARISON'}
          </span>
          <h2 className="mt-2 font-sans text-[30px] font-normal tracking-[-0.02em] text-white sm:text-[38px]">
            {tr ? 'Dört Temel Fark: Neden Farklı Sonuç Alıyoruz?' : 'Four Core Differences: Why Results Differ'}
          </h2>
          <p className="mt-3 font-sans text-[16px] font-light text-white/60">
            {tr
              ? 'Standart bir dil modeli ile fizik için özel olarak inşa edilmiş nöro-sembolik sistem arasındaki farklar.'
              : 'The engineering distinctions between a general-purpose chat model and a neuro-symbolic physics engine.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Difference 1 */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 backdrop-blur-md transition-all hover:border-white/20">
            <div>
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#10B981]">
                <Binary size={22} />
              </div>
              <span className="block font-mono text-[11px] uppercase tracking-wider text-white/40">
                Pillar 01
              </span>
              <h3 className="mt-1 font-sans text-[22px] font-medium text-white">
                {tr
                  ? 'Olasılıksal Tahmin vs. Deterministik mathjs Denetimi'
                  : 'Probabilistic Guessing vs. Deterministic mathjs Auditing'}
              </h3>
              <p className="mt-3 font-sans text-[15px] font-light leading-[1.65] text-[#A1A1AA]">
                {tr
                  ? 'Standart üretken modeller sayıları ve formülleri ardışık metin belirteçleri (tokens) olarak tamamlar. Çarpma ve kare alma gibi temel işlemlerde bile sayısal halüsinasyon yapabilirler. Physicsmn ise çıkarılan tüm değişkenleri sembolik mathjs kapsamına yükler, temel SI birimlerini ([M] kütle, [L] uzunluk, [T] zaman) denetler ve sonucu %2 toleransla matematiksel olarak doğrular.'
                  : 'General-purpose models generate mathematical values through next-token prediction, which frequently hallucinates arithmetic or combines incompatible units. Physicsmn extracts numerical parameters into a formal scope, audits algebraic relations inside mathjs, checks dimensional equivalence ([M] mass, [L] length, [T] time), and verifies numbers within strict 2% bounds.'}
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/60 p-4 font-mono text-[12px]">
              <div className="flex items-center gap-2 text-red-400">
                <X size={14} />
                <span>{tr ? 'Standart Model: 0.5 × 2 × 10² = 999 J (Kör Kabul)' : 'Raw LLM: 0.5 × 2 × 10² = 999 J (Unchecked)'}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-emerald-400">
                <Check size={14} />
                <span>{tr ? 'Physicsmn: mathjs Denetimi → 100.00 J [M·L²·T⁻²] ✓ Onaylandı' : 'Physicsmn: mathjs Scope → 100.00 J [M·L²·T⁻²] ✓ Verified'}</span>
              </div>
            </div>
          </div>

          {/* Difference 2 */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 backdrop-blur-md transition-all hover:border-white/20">
            <div>
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#8052ff]">
                <RefreshCw size={22} />
              </div>
              <span className="block font-mono text-[11px] uppercase tracking-wider text-white/40">
                Pillar 02
              </span>
              <h3 className="mt-1 font-sans text-[22px] font-medium text-white">
                {tr
                  ? 'Otonom Öz-Düzeltme (Self-Correction) Döngüsü'
                  : 'Autonomous Self-Correction Loop'}
              </h3>
              <p className="mt-3 font-sans text-[15px] font-light leading-[1.65] text-[#A1A1AA]">
                {tr
                  ? 'Standart bir arayüz ilk üretilen cevabı öğrenciye doğrudan gösterir; hata varsa fark edilmez. Physicsmn ise hata kesici devreye (circuit breaker) sahiptir: mathjs denetiminde birim veya hesaplama uyumsuzluğu tespit edildiğinde, sistem öğrenciye göstermeden önce hatanın tam nedenini modele geri besleyerek düzeltilmiş tam çözümü otonom olarak tekrar türetir.'
                  : 'Standard chat interfaces output their first generation directly to the user with no recourse if step 3 contained an arithmetic error. Physicsmn features a deterministic circuit-breaker: if mathjs detects a unit contradiction or numerical discrepancy, it prompts the model with the exact deterministic failure report and regenerates an auto-repaired solution before the user sees it.'}
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/60 p-4 font-mono text-[12px]">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle size={14} />
                <span>
                  {tr
                    ? 'Denetim: "%90 sapma (999 J vs 100 J). Aritmetiği düzeltin."'
                    : 'Audit: "90% discrepancy (999 J vs 100 J). Recalculate."'}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-emerald-400">
                <Check size={14} />
                <span>
                  {tr
                    ? 'Döngü: 2. geçişte otomatik onarıldı → mathVerified: true'
                    : 'Repair: Auto-repaired on pass 2 → mathVerified: true'}
                </span>
              </div>
            </div>
          </div>

          {/* Difference 3 */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 backdrop-blur-md transition-all hover:border-white/20">
            <div>
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#2E8BFF]">
                <Layers size={22} />
              </div>
              <span className="block font-mono text-[11px] uppercase tracking-wider text-white/40">
                Pillar 03
              </span>
              <h3 className="mt-1 font-sans text-[22px] font-medium text-white">
                {tr
                  ? 'Çok Sorulu MEB Sayfalarını Ayrıştırma'
                  : 'Multi-Question MEB Worksheet Parsing'}
              </h3>
              <p className="mt-3 font-sans text-[15px] font-light leading-[1.65] text-[#A1A1AA]">
                {tr
                  ? 'Gerçek test sayfaları genellikle 5 ila 7 soru içerir. Standart yapay zekalar sayfayı tek bir metin yığını olarak okuyarak soruları birbirine karıştırır veya yarıda kesilir. Physicsmn, sayfadaki tüm soruları bağımsız nesneler olarak tespit eder; her birini sekmelere (Soru 1, Soru 2...) ayırır ve her soru için bağımsız doğrulama rozeti üretir.'
                  : 'Real exam pages contain 5 to 7 problems per sheet. Standard LLMs treat the image as a single text block, mixing formulas between adjacent questions or cutting off mid-page. Physicsmn decomposes the worksheet into independent structured problems, creating separate tabbed solutions (Question 1..N) with individual mathematical verification badges.'}
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/60 p-4 font-mono text-[12px]">
              <div className="flex items-center gap-2 text-white/80">
                <FileCheck2 size={14} className="text-[#2E8BFF]" />
                <span>{tr ? 'Test Sayfası → Soru 1, Soru 2, Soru 3... bağımsız sekmeler' : 'Worksheet → Question 1, 2, 3... isolated tabs'}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-emerald-400">
                <Check size={14} />
                <span>{tr ? 'Her soru için ayrı "mathVerified: true" rozeti' : 'Independent verification badge for each question'}</span>
              </div>
            </div>
          </div>

          {/* Difference 4 */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 backdrop-blur-md transition-all hover:border-white/20">
            <div>
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#E5C158]">
                <ShieldCheck size={22} />
              </div>
              <span className="block font-mono text-[11px] uppercase tracking-wider text-white/40">
                Pillar 04
              </span>
              <h3 className="mt-1 font-sans text-[22px] font-medium text-white">
                {tr
                  ? 'MEB Müfredat Uyumu ve Yerel Gizlilik'
                  : 'MEB Curriculum Alignment & Local Privacy'}
              </h3>
              <p className="mt-3 font-sans text-[15px] font-light leading-[1.65] text-[#A1A1AA]">
                {tr
                  ? 'Genel yapay zekalar lise öğrencilerine üniversite kalkülüsü (türev/integral), emperyal birimler veya yabancı kabuller sunar. Physicsmn ise MEB 9–12. sınıf müfredatına sadıktır (g = 10 m/s², sin 37° = 0.6, trigonometri ve vektörler). Ayrıca öğrenci verileri merkezi veritabanlarında saklanmaz; çözüm geçmişi yalnızca cihazınızın localStorage belleğinde kalır.'
                  : 'General models often introduce university calculus, imperial units, or non-MEB approximations (e.g. g = 9.81) that confuse high school students. Physicsmn strictly follows Turkish MEB conventions (g = 10 m/s², sin 37° = 0.6, algebra and vector geometry). Student problem history is stored exclusively in client-side localStorage with zero database tracking.'}
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/60 p-4 font-mono text-[12px]">
              <div className="flex items-center gap-2 text-white/80">
                <Lock size={14} className="text-[#E5C158]" />
                <span>{tr ? 'localStorage Tarihçesi · Sıfır Sunucu Kaydı' : 'Offline localStorage history · Zero cloud logging'}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-emerald-400">
                <Check size={14} />
                <span>{tr ? 'g = 10 m/s², sin 37° = 0,6 tam MEB standartları' : 'Strict MEB high school physical standards'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Side-by-Side Comparison Matrix */}
      <section className="border-t border-white/[0.06] bg-white/[0.01] px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-white/50">
              {tr ? '02 // KARŞILAŞTIRMA MATRİSİ' : '02 // COMPARISON MATRIX'}
            </span>
            <h2 className="mt-2 font-sans text-[28px] font-normal tracking-[-0.02em] text-white sm:text-[34px]">
              {tr ? 'Physicsmn ile Standart Yapay Zeka Karşılaştırması' : 'Physicsmn vs. Standard Generative AI'}
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-black/60 backdrop-blur-md">
            <table className="w-full text-left font-sans text-[14px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[12px] font-mono uppercase tracking-wider text-white/60">
                  <th className="px-6 py-4">{tr ? 'Özellik / Yetenek' : 'Capability'}</th>
                  <th className="px-6 py-4 text-white/40">{tr ? 'Standart Yapay Zeka (ChatGPT / Gemini)' : 'Standard LLM (ChatGPT / Gemini)'}</th>
                  <th className="px-6 py-4 text-emerald-400 font-semibold">{tr ? 'Physicsmn (Nöro-Sembolik)' : 'Physicsmn (Neuro-Symbolic)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] font-light">
                <tr>
                  <td className="px-6 py-4 font-medium text-white">{tr ? 'Sayısal Doğrulama' : 'Numerical Verification'}</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">{tr ? 'Olasılıksal tahmin; sık aritmetik hata' : 'Token-based guess; prone to math errors'}</td>
                  <td className="px-6 py-4 text-emerald-300 font-medium">{tr ? 'mathjs ile ±%2 kesin sayısal denetim' : 'Deterministic mathjs audit within ±2%'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-white">{tr ? 'SI Birim ve Boyut Analizi' : 'SI Unit Dimensional Balance'}</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">{tr ? 'Yüzeysel metin kontrolü; birim çelişkilerini atlar' : 'Superficial text check; misses unit mismatches'}</td>
                  <td className="px-6 py-4 text-emerald-300 font-medium">{tr ? '[M]ᵃ[L]ᵇ[T]ᶜ temel SI boyut eşitliği doğrulaması' : 'Base SI dimension verification [M]ᵃ[L]ᵇ[T]ᶜ'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-white">{tr ? 'Otonom Öz-Düzeltme (Self-Correction)' : 'Autonomous Self-Correction'}</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">{tr ? 'Yok; ilk üretilen yanlış cevap sunulur' : 'None; outputs unverified first attempt'}</td>
                  <td className="px-6 py-4 text-emerald-300 font-medium">{tr ? 'Denetim hatası modele bildirilerek otomatik onarım' : 'Audit feedback loop triggers automatic re-derivation'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-white">{tr ? 'Çok Sorulu Test Sayfası Desteği' : 'Multi-Question Worksheets'}</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">{tr ? 'Tek parça metin; soruları atlar veya karıştırır' : 'Single text blob; drops questions or blends data'}</td>
                  <td className="px-6 py-4 text-emerald-300 font-medium">{tr ? 'Her soru için bağımsız sekme ve çözüm ayrıştırma' : 'Independent tabs and verified solutions per question'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-white">{tr ? 'MEB Lise Müfredat Uyumu' : 'MEB High School Alignment'}</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">{tr ? 'Üniversite kalkülüsü ve yabancı sabitler' : 'University calculus and non-standard constants'}</td>
                  <td className="px-6 py-4 text-emerald-300 font-medium">{tr ? '9–12. sınıf MEB formülleri ve kabul standartları' : 'Strict 9th–12th grade MEB conventions and notation'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-white">{tr ? 'Kuvvet Diyagramı Görselleştirmesi' : 'Force Diagram Rendering'}</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">{tr ? 'Görsel çizim üretmez (yalnızca metin)' : 'Text description only; no interactive diagram'}</td>
                  <td className="px-6 py-4 text-emerald-300 font-medium">{tr ? 'Etkileşimli SVG serbest cisim diyagramı' : 'Interactive SVG free-body vector diagram'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-white">{tr ? 'Öğrenci Gizliliği' : 'Privacy & Data Harvesting'}</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">{tr ? 'Sorular sunucu veritabanlarında saklanır ve eğitilir' : 'Queries logged and mined for training'}</td>
                  <td className="px-6 py-4 text-emerald-300 font-medium">{tr ? 'Yalnızca cihazınızın localStorage belleği; sıfır takip' : 'Offline client-side localStorage; zero user tracking'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Honest Scientific Limitations Section */}
      <section className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 text-left backdrop-blur-md">
          <div className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-wider text-[#E5C158]">
            <Scale size={16} />
            <span>{tr ? 'Bilimsel Dürüstlük ve Sınırlarımız' : 'Scientific Honesty & Limitations'}</span>
          </div>
          <h3 className="mt-3 font-sans text-[20px] font-medium text-white">
            {tr ? '"%100 Kusursuz" İddiasında Bulunmuyoruz.' : 'We Do Not Claim "100% Zero Hallucination".'}
          </h3>
          <p className="mt-3 font-sans text-[14.5px] font-light leading-[1.6] text-[#A1A1AA]">
            {tr
              ? 'Yapay zeka sistemleri için "asla hata yapmaz" demek bilimsel olarak gerçekçi değildir. Eğer öğrencinin yüklediği fotoğraf aşırı bulanıksa veya küçük bir indis görme modeli (Vision OCR) tarafından yanlış okunursa, başlangıç verisi hatalı olabilir. Physicsmn\'in garanti ettiği şey şudur: Bir çözüm "mathVerified: true" rozetine sahipse, formülün cebirsel tutarlılığı, SI temel birim eşitliği ve sayısal hesaplaması mathjs tarafından deterministik olarak doğrulanmıştır.'
              : 'Claiming that any AI system is completely infallible is scientifically dishonest. If a user uploads a blurry photo or a subtle subscript is misread by Vision OCR, the initial extracted parameters may be inaccurate. What Physicsmn guarantees is that whenever a derivation displays the "mathVerified: true" badge, its algebraic relations, SI unit dimensions, and arithmetic calculations have been verified deterministically by mathjs.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-4 border-t border-white/[0.08] pt-6 font-mono text-[12px]">
            <Link
              href="/docs#benchmark"
              className="inline-flex items-center gap-1.5 text-white underline underline-offset-4 transition-colors hover:text-[#E5C158]"
            >
              <span>{tr ? '57 Soruluk MEB Kıyaslama Raporunu İncele' : 'Review the 57-Question MEB Benchmark Report'}</span>
              <ArrowRight size={13} />
            </Link>
            <Link
              href="/docs#tests"
              className="inline-flex items-center gap-1.5 text-white/60 transition-colors hover:text-white"
            >
              <span>{tr ? 'Hata Enjeksiyon Testleri' : 'Fault-Injection Test Suite'}</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="border-t border-white/[0.08] px-6 py-16 text-center sm:px-10">
        <h2 className="font-sans text-[26px] font-normal text-white sm:text-[32px]">
          {tr ? 'Fizik Probleminizi Şimdi Denetleyin.' : 'Verify Your Physics Problem Now.'}
        </h2>
        <p className="mx-auto mt-2 max-w-lg font-sans text-[15px] font-light text-white/60">
          {tr
            ? 'Bir soru yazın veya ödev sayfanızın fotoğrafını yükleyin. Adım adım MEB türetimini inceleyin.'
            : 'Type a problem or snap a photo of your test page. Inspect the step-by-step verified derivation.'}
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/solve"
            className="rounded-full bg-white px-7 py-3 font-sans text-[13.5px] font-medium text-black transition-all hover:bg-neutral-200 active:scale-[0.98]"
          >
            {tr ? 'Çözücüyü Başlat' : 'Start Solving'}
          </Link>
          <Link
            href="/docs"
            className="rounded-full border border-white/20 bg-white/[0.04] px-6 py-3 font-sans text-[13.5px] font-medium text-white/80 backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/[0.1] hover:text-white"
          >
            {tr ? 'Teknik Belgeler' : 'Technical Docs'}
          </Link>
        </div>
      </footer>
    </div>
  );
}
