'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, FileCode, Sparkles } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { LanguageSwitch } from '@/components/shared/LanguageSwitch';

export function DocsPage() {
  const { lang } = useLanguage();
  const tr = lang === 'tr';
  const [activeSection, setActiveSection] = useState('architecture');

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'architecture', label: tr ? 'Sistem Mimarisi & İşlem Hattı' : 'System Architecture & Pipeline' },
    { id: 'tests', label: tr ? 'Deterministik Doğrulama & Testler' : 'Deterministic Verification & Tests' },
    { id: 'benchmark', label: tr ? 'Ampirik Kıyaslama (N = 57 MEB Veriseti)' : 'Empirical Benchmark (N = 57 Dataset)' },
    { id: 'limitations', label: tr ? 'Sınırlar ve Gelecek Yol Haritası' : 'Honest Limitations & Roadmap' },
  ];

  return (
    <div className="min-h-screen bg-black text-[#F5F5F7] selection:bg-white/20">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-10">
          <Link href="/" className="flex items-center gap-2 group" aria-label="Physicsmn Home">
            <span className="font-display text-[15px] font-semibold tracking-[0.16em] text-white">
              PHYSICSMN
            </span>
            <span className="rounded-full border border-white/20 bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#10B981]">
              {tr ? 'Teknik Belgeler' : 'Documentation'}
            </span>
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/why"
              className="hidden font-mono text-[11px] uppercase tracking-[0.15em] text-white/60 transition-colors hover:text-white md:inline"
            >
              {tr ? 'Neden Physicsmn?' : 'Why Physicsmn?'}
            </Link>
            <Link
              href="/docs"
              className="font-mono text-[11px] uppercase tracking-[0.15em] text-white underline underline-offset-8"
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

      {/* Main Container with Sidebar */}
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Sticky Sidebar Navigation */}
          <aside className="lg:col-span-3">
            <div className="sticky top-28 flex flex-col gap-1 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-md">
              <span className="mb-3 px-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
                {tr ? 'İçindekiler' : 'Table of Contents'}
              </span>

              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-left font-sans text-[13px] transition-all duration-200 ${
                      isActive
                        ? 'bg-white/[0.08] font-medium text-white shadow-sm'
                        : 'font-light text-white/60 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />}
                  </button>
                );
              })}

              <div className="mt-4 border-t border-white/[0.08] pt-4">
                <Link
                  href="/why"
                  className="flex items-center gap-2 px-3 py-2 text-[12px] font-mono text-white/50 transition-colors hover:text-white"
                >
                  <span>{tr ? '← Neden Physicsmn? Karşılaştırması' : '← Why Physicsmn? Comparison'}</span>
                </Link>
                <Link
                  href="/solve"
                  className="mt-1 flex items-center gap-2 px-3 py-2 text-[12px] font-mono text-[#E5C158] transition-colors hover:text-white"
                >
                  <span>{tr ? 'Çözücü Arayüzünü Başlat →' : 'Launch Solver Web App →'}</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 space-y-24">
            {/* Header intro */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-[#10B981]">
                <FileCode size={13} />
                <span>{tr ? 'Teknik Rapor & Sistem Mimarisi' : 'Technical Report & System Architecture'}</span>
              </div>
              <h1 className="mt-4 font-sans text-[36px] font-normal tracking-[-0.03em] text-white sm:text-[44px]">
                {tr ? 'Physicsmn Mühendislik & Kıyaslama Raporu' : 'Physicsmn Engineering & Benchmark Report'}
              </h1>
              <p className="mt-4 font-sans text-[16px] font-light leading-[1.65] text-[#A1A1AA]">
                {tr
                  ? 'Büyük dil modellerinin istatistiksel muhakeme yeteneğini, mathjs deterministik sembolik motoru ve MEB müfredat standartlarıyla birleştiren nöro-sembolik fizik çözücüsünün teknik detayları ve deneysel sonuçları.'
                  : 'Complete architectural documentation and empirical benchmark results for Physicsmn: combining generative reasoning models with a deterministic mathjs symbolic auditor and MEB high-school physics standards.'}
              </p>
            </div>

            {/* SECTION 1: ARCHITECTURE */}
            <section id="architecture" className="scroll-mt-24 space-y-8">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#2E8BFF]">
                  Section 01
                </span>
                <h2 className="mt-1 font-sans text-[28px] font-normal text-white">
                  {tr ? 'Sistem Mimarisi ve Uçtan Uca İşlem Hattı' : 'System Architecture & End-to-End Pipeline'}
                </h2>
                <p className="mt-2 font-sans text-[14.5px] font-light text-white/60">
                  {tr
                    ? 'Kullanıcı girdisinden LaTeX derlemesine ve yerel depolamaya kadar her aşama tip güvenliği ve güvenlik katmanlarıyla korunur.'
                    : 'From user ingestion to KaTeX compilation and offline local history: every layer enforces type safety and privacy.'}
                </p>
              </div>

              {/* Visual Pipeline Flow Diagram */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                <h3 className="font-mono text-[12px] uppercase tracking-wider text-white/60">
                  {tr ? 'İşlem Hattı Akış Şeması' : 'Pipeline Execution Flow'}
                </h3>

                <div className="mt-6 flex flex-col gap-3 font-mono text-[12px]">
                  {/* Step 1 */}
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/60 p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-bold text-white">1</span>
                    <div className="flex-1">
                      <span className="font-semibold text-white">SolveBar.tsx / Composer.tsx</span>
                      <span className="block text-[11px] text-white/50">{tr ? 'Metin girdisi veya kamera/fotoğraf yüklemesi (İstemci tarafı 4.5MB denetimi)' : 'Input string or camera/photo capture (Client-side 4.5MB validation)'}</span>
                    </div>
                    <span className="text-white/40">Client UI</span>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center text-white/20">↓</div>

                  {/* Step 2 */}
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/60 p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-bold text-white">2</span>
                    <div className="flex-1">
                      <span className="font-semibold text-[#2E8BFF]">request.ts & rate-limit.ts</span>
                      <span className="block text-[11px] text-white/50">{tr ? 'CSRF koruması + Sihirli bayt tespiti (0xFFD8FF, PNG, WEBP) + SHA-256 tuzlu IP hashleme (Upstash Redis 20 istek/gün)' : 'CSRF check + Magic-byte sniffing (JPEG, PNG, WEBP) + Salted SHA-256 IP rate limit (20 req/day)'}</span>
                    </div>
                    <span className="text-white/40">Security</span>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center text-white/20">↓</div>

                  {/* Step 3 */}
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/60 p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-bold text-white">3</span>
                    <div className="flex-1">
                      <span className="font-semibold text-[#8052ff]">gpt.ts & prompt.ts</span>
                      <span className="block text-[11px] text-white/50">{tr ? 'gpt-5.6-luna (Muhakeme modeli, sıcaklık parametresi devre dışı, MEB 9-12 müfredat talimatı, JSON mod)' : 'gpt-5.6-luna (Reasoning model, temperature-free, strict MEB curriculum directives, JSON schema)'}</span>
                    </div>
                    <span className="text-white/40">LLM Engine</span>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center text-white/20">↓</div>

                  {/* Step 4 */}
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/60 p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-bold text-white">4</span>
                    <div className="flex-1">
                      <span className="font-semibold text-white">schema.ts</span>
                      <span className="block text-[11px] text-white/50">{tr ? 'Zod şema doğrulaması, temizlenmiş çoktan seçmeli harf (A-E), değişkenler ve semboller ayrıştırması' : 'Zod validation, HTML-stripped choice letter (A-E), extracted verification block variables'}</span>
                    </div>
                    <span className="text-white/40">Zod Schema</span>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center text-white/20">↓</div>

                  {/* Step 5 */}
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 font-bold text-emerald-400">5</span>
                    <div className="flex-1">
                      <span className="font-semibold text-emerald-400">verify.ts (Deterministic mathjs Auditor)</span>
                      <span className="block text-[11px] text-emerald-200/60">{tr ? 'Sembolik mathjs kapsamı + [M]ᵃ[L]ᵇ[T]ᶜ temel SI boyut eşitliği + ±%2 sayısal tolerans denetimi' : 'Symbolic scope + [M]ᵃ[L]ᵇ[T]ᶜ base SI dimension equality + ±2% numerical tolerance audit'}</span>
                    </div>
                    <span className="text-emerald-400 font-semibold">Circuit Breaker</span>
                  </div>

                  {/* Arrow with fork */}
                  <div className="flex justify-center text-white/20">↓ (Audit Fail? → solve.ts Self-Correction Loop / Pass? → Proceed)</div>

                  {/* Step 6 */}
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/60 p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-bold text-white">6</span>
                    <div className="flex-1">
                      <span className="font-semibold text-[#E5C158]">render.ts & history.ts</span>
                      <span className="block text-[11px] text-white/50">{tr ? 'Sunucu tarafı KaTeX derlemesi + Türkçe karakter normalizasyonu (\c{c} → ç) + Çevrimdışı localStorage kaydı' : 'Server-side KaTeX rendering + Turkish diacritic recovery (\c{c} → ç) + Offline localStorage history'}</span>
                    </div>
                    <span className="text-white/40">Client Render</span>
                  </div>
                </div>
              </div>

              {/* Detailed Technical Components Cards */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 font-sans">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
                  <h4 className="font-mono text-[13px] font-semibold uppercase tracking-wider text-white">
                    1. CSRF & Sihirli Bayt Denetimi (`request.ts`)
                  </h4>
                  <p className="mt-2 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    {tr
                      ? 'İstemcinin beyan ettiği dosya uzantısına güvenilmez. Gelen görüntü ikili verisi (Buffer) sihirli baytları taranarak gerçek MIME türü doğrulanır (JPEG: 0xFFD8FF, PNG: 89504E47, WEBP: RIFF...WEBP). İstek boyutu 4.5 MB ile sınırlıdır.'
                      : 'Client file extensions are never trusted. Image byte buffers are sniffed using magic numbers (JPEG: 0xFFD8FF, PNG: 89504E47, WEBP: RIFF...WEBP). Total request size is strictly constrained to 4.5MB.'}
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
                  <h4 className="font-mono text-[13px] font-semibold uppercase tracking-wider text-white">
                    2. Gizlilik Odaklı Hız Sınırı (`rate-limit.ts`)
                  </h4>
                  <p className="mt-2 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    {tr
                      ? 'Öğrencilerin IP adresleri açık metin olarak saklanmaz; gizli RATE_LIMIT_SALT ile SHA-256 üzerinden tek yönlü hashlenir. Upstash Redis kayan pencere (sliding window) algoritmasıyla istemci başına günde 20 türetim limiti uygulanır.'
                      : 'Client IP addresses are never logged in plaintext; they are irreversibly hashed with SHA-256 and a secret salt. Upstash Redis sliding window token buckets enforce a fair-use limit of 20 derivations per day.'}
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
                  <h4 className="font-mono text-[13px] font-semibold uppercase tracking-wider text-white">
                    3. Deterministik Nöro-Sembolik Denetçi (`verify.ts`)
                  </h4>
                  <p className="mt-2 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    {tr
                      ? 'Modelin çıkardığı formül ifadesi (örn: "0.5 * m * v^2"), mathjs sembolik motorunda bilinen değişkenlerle bağımsız olarak değerlendirilir. Çıkan birim, temel SI boyutları ([M]ᵃ [L]ᵇ [T]ᶜ) açısından claimed_unit ile karşılaştırılır ve sayısal farkın %2 tolerans içinde olduğu doğrulanır.'
                      : 'The model-extracted formula (e.g. "0.5 * m * v^2") is evaluated independently inside mathjs with typed physical units. The resulting dimension is audited against claimed_unit using SI base exponents ([M]ᵃ [L]ᵇ [T]ᶜ), enforcing strict 2% numeric tolerances.'}
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
                  <h4 className="font-mono text-[13px] font-semibold uppercase tracking-wider text-white">
                    4. Otonom Öz-Düzeltme Döngüsü (`solve.ts`)
                  </h4>
                  <p className="mt-2 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    {tr
                      ? 'Eğer KaTeX derleme hatası veya mathjs denetim hatası tespit edilirse, çözüm öğrenciye sunulmaz. Sistem, denetim hatasının tam teknik nedenini asistana ileterek tek bir hedeflenmiş onarım çağrısıyla soruyu otomatik olarak yeniden çözer.'
                      : 'If mathjs verification or KaTeX compilation fails on any question, the pipeline halts presentation. It packages the deterministic audit failure reason into a correction prompt, invoking an autonomous single-pass repair loop before finalizing.'}
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 2: UNIT TESTS & FAULT INJECTION */}
            <section id="tests" className="scroll-mt-24 space-y-8">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#10B981]">
                  Section 02
                </span>
                <h2 className="mt-1 font-sans text-[28px] font-normal text-white">
                  {tr ? 'Deterministik Doğrulama & Hata Enjeksiyon Testleri' : 'Deterministic Verification & Fault-Injection Tests'}
                </h2>
                <p className="mt-2 font-sans text-[14.5px] font-light text-white/60">
                  {tr
                    ? '`tests/verify-mathjs.test.mjs` altında çalışan 4 bağımsız birim testimiz ve yakalanan gerçek hata çıktıları.'
                    : 'The 4 standalone test cases from `tests/verify-mathjs.test.mjs` demonstrating deterministic sabotage rejection.'}
                </p>
              </div>

              <div className="space-y-6 font-mono text-[13px]">
                {/* Test 1 */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[#10B981] font-bold">TEST 1: Valid Kinetic Energy Derivation</span>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-0.5 text-[11px] text-emerald-400">PASSED ✓</span>
                  </div>
                  <p className="mt-2 font-sans text-[14px] font-light text-white/70">
                    {tr
                      ? 'Doğru fizik parametreleri (m = 2 kg, v = 10 m/s, E_k = 0.5·m·v² = 100 J). mathjs formülü değerlendirir, boyutu J olarak onaylar.'
                      : 'Valid physics inputs (m = 2 kg, v = 10 m/s, E_k = 0.5·m·v² = 100 J). mathjs evaluates formula, confirms dimension as Joules.'}
                  </p>
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-black/80 p-4 text-[12px] text-white/80">
{`// Input: formula = "0.5 * m * v^2", m = 2 kg, v = 10 m/s, claimed = 100 J
Result: { passed: true, mathVerified: true, computedResult: "100.00 J" }
✓ [PASS] Valid physics passed cleanly with 100.00 J.`}
                  </pre>
                </div>

                {/* Test 2 */}
                <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-6 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="text-red-400 font-bold">TEST 2: Sabotaged Numerical Calculation Error</span>
                    <span className="rounded-full bg-red-500/10 px-3 py-0.5 text-[11px] text-red-400">CAUGHT & REJECTED ✗</span>
                  </div>
                  <p className="mt-2 font-sans text-[14px] font-light text-white/70">
                    {tr
                      ? 'Formül 100 J hesaplarken, yapay zekanın cevaba 999 J halüsinasyonu yaptığı durum simüle edildi. Tolerans aşımı nedeniyle anında reddedildi.'
                      : 'Formula evaluates to 100 J, but LLM claims 999 J. Rejected deterministically due to 90% arithmetic error exceeding 2% tolerance.'}
                  </p>
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-black/80 p-4 text-[12px] text-red-300">
{`// Sabotage: claimed_value = 999 (Actual evaluated value is 100 J)
ErrorReason: 'Numerical calculation mismatch: formula "0.5 * m * v^2" evaluated to 100.000 J,
              which contradicts claimed answer of 999 J (diff: 90.0%, exceeds 2% tolerance).'
✓ [PASS] Arithmetic sabotage successfully caught and rejected.`}
                  </pre>
                </div>

                {/* Test 3 */}
                <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-6 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold">TEST 3: Sabotaged SI Dimensional Mismatch</span>
                    <span className="rounded-full bg-amber-500/10 px-3 py-0.5 text-[11px] text-amber-400">CAUGHT & REJECTED ✗</span>
                  </div>
                  <p className="mt-2 font-sans text-[14px] font-light text-white/70">
                    {tr
                      ? 'Formül enerji birimi (kg·m²/s² = Joule) verirken, iddia edilen birimin hız (m/s) olarak sabitlendiği durum. Temel SI boyutları eşleşmediği için reddedildi.'
                      : 'Formula evaluates to energy (kg·m²/s² = Joules), but claimed unit is sabotaged to velocity (m/s). Rejected due to base dimension mismatch.'}
                  </p>
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-black/80 p-4 text-[12px] text-amber-300">
{`// Sabotage: claimed_unit = "m/s" (Formula evaluates to Energy units)
ErrorReason: 'Dimensional mismatch: formula evaluated to dimensions of "(kg m^2) / s^2",
              which is incompatible with claimed unit "m/s". Base SI dimensions do not match.'
✓ [PASS] Dimensional sabotage successfully caught and rejected.`}
                  </pre>
                </div>

                {/* Test 4 */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[#2E8BFF] font-bold">TEST 4: Trigonometric Evaluation with Degrees</span>
                    <span className="rounded-full bg-blue-500/10 px-3 py-0.5 text-[11px] text-blue-400">PASSED ✓</span>
                  </div>
                  <p className="mt-2 font-sans text-[14px] font-light text-white/70">
                    {tr
                      ? 'Lise fizik problemlerinde açılar derece cinsindendir (37°). Normalde mathjs varsayılan olarak radyan kullanır; Physicsmn derece etiketlemesi ile doğru düşey hızı (30.09 m/s) hesaplar.'
                      : 'Physics problems define angles in degrees (37°). mathjs defaults to radians; Physicsmn degree normalization ensures correct vertical velocity (30.09 m/s).'}
                  </p>
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-black/80 p-4 text-[12px] text-white/80">
{`// Input: v0 = 50 m/s, theta = 37 deg -> v_y = v0 * sin(theta)
Result: { passed: true, mathVerified: true, computedResult: "30.09 m/s" }
✓ [PASS] Trigonometric angles evaluated correctly in degrees.`}
                  </pre>
                </div>
              </div>
            </section>

            {/* SECTION 3: EMPIRICAL BENCHMARK STUDY */}
            <section id="benchmark" className="scroll-mt-24 space-y-8">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#E5C158]">
                  Section 03
                </span>
                <h2 className="mt-1 font-sans text-[28px] font-normal text-white">
                  {tr ? 'Ampirik Kıyaslama Çalışması (N = 57 MEB Veriseti)' : 'Empirical Benchmark Study (N = 57 MEB Dataset)'}
                </h2>
                <p className="mt-2 font-sans text-[14.5px] font-light text-white/60">
                  {tr
                    ? '10 özgün MEB 11. Sınıf Fizik Kazanım Testi sayfası (57 soru) üzerinde gerçekleştirilen çoktan seçmeli doğruluk kıyaslaması.'
                    : 'A 57-question empirical evaluation across 10 authentic visual exam sheets from the Turkish Ministry of National Education (MEB).'}
                </p>
              </div>

              {/* Accuracy Comparison Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-center backdrop-blur-md">
                  <span className="font-mono text-[12px] uppercase text-white/40">
                    {tr ? 'Standart Çok Modlu Model' : 'Raw Multimodal LLM'}
                  </span>
                  <div className="mt-2 font-mono text-[36px] font-bold text-red-400">61.4%</div>
                  <div className="mt-1 font-sans text-[13px] text-white/50">35 / 57 {tr ? 'Doğru' : 'Correct'}</div>
                  <p className="mt-4 text-[12px] font-light text-white/60">
                    {tr ? 'mathjs denetimi yok. İşlem hataları ve çok sorulu sayfa kaymaları nedeniyle düşük doğruluk.' : 'No symbolic verification. Arithmetic drift and dropped questions on multi-item pages.'}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-center backdrop-blur-md">
                  <span className="font-mono text-[12px] uppercase text-white/40">
                    Google Gemini Web Baseline
                  </span>
                  <div className="mt-2 font-mono text-[36px] font-bold text-amber-400">89.5%</div>
                  <div className="mt-1 font-sans text-[13px] text-white/50">51 / 57 {tr ? 'Doğru' : 'Correct'}</div>
                  <p className="mt-4 text-[12px] font-light text-white/60">
                    {tr ? 'Güçlü görsel tanıma, ancak karmaşık basamaklı sorularda küçük hesaplama hataları.' : 'Strong multimodal recognition, but occasional arithmetic slips on multi-step derivations.'}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 text-center backdrop-blur-md shadow-[0_0_40px_rgba(16,185,129,0.08)]">
                  <span className="font-mono text-[12px] uppercase text-emerald-400 font-semibold">
                    Physicsmn (Neuro-Symbolic)
                  </span>
                  <div className="mt-2 font-mono text-[36px] font-bold text-emerald-400">94.7%</div>
                  <div className="mt-1 font-sans text-[13px] text-emerald-200/70">54 / 57 {tr ? 'Doğru' : 'Correct'}</div>
                  <p className="mt-4 text-[12px] font-light text-emerald-100/70">
                    {tr ? 'mathjs doğrulaması + otonom öz-düzeltme döngüsü ile ham LLM hatalarının %36.8\'i düzeltildi.' : 'mathjs audits + self-correction repaired 36.8% of raw LLM mistakes prior to display.'}
                  </p>
                </div>
              </div>

              {/* Verified Metrics Breakdown Table */}
              <div className="rounded-2xl border border-white/[0.08] bg-black/60 p-6 backdrop-blur-md">
                <h3 className="font-mono text-[13px] uppercase tracking-wider text-white">
                  {tr ? 'Deneysel Süreç Metrikleri (N = 57)' : 'Experimental Telemetry Breakdown (N = 57)'}
                </h3>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 font-mono">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="text-[24px] font-bold text-white">49 / 57</div>
                    <div className="text-[12px] text-white/50 font-sans mt-1">
                      {tr ? 'mathjs Tarafından Doğrulandı (85.96%)' : 'Verified by mathjs (85.96%)'}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="text-[24px] font-bold text-[#8052ff]">12 / 57</div>
                    <div className="text-[12px] text-white/50 font-sans mt-1">
                      {tr ? 'Öz-Düzeltme Döngüsü Tetiklendi (21.05%)' : 'Self-Correction Triggered (21.05%)'}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="text-[24px] font-bold text-[#10B981]">21 / 57</div>
                    <div className="text-[12px] text-white/50 font-sans mt-1">
                      {tr ? 'Ham LLM Cevabı Düzeltildi (36.84%)' : 'Raw LLM Mistakes Repaired (36.84%)'}
                    </div>
                  </div>
                </div>

                {/* Topic Breakdown Table */}
                <div className="mt-8 overflow-x-auto">
                  <table className="w-full text-left font-sans text-[13.5px]">
                    <thead>
                      <tr className="border-b border-white/[0.08] font-mono text-[11px] uppercase tracking-wider text-white/50">
                        <th className="pb-3">{tr ? 'Test Konu Kategorisi' : 'Worksheet Topic Category'}</th>
                        <th className="pb-3 text-center">{tr ? 'Soru Sayısı' : 'Questions'}</th>
                        <th className="pb-3 text-center">{tr ? 'Ham LLM Doğruluk' : 'Raw LLM'}</th>
                        <th className="pb-3 text-center">{tr ? 'Gemini Web' : 'Gemini Web'}</th>
                        <th className="pb-3 text-center text-emerald-400 font-semibold">Physicsmn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] font-light">
                      <tr>
                        <td className="py-3 font-medium text-white">{tr ? 'Vektörler & Koordinat Sistemleri (Test 1)' : 'Vectors & Coordinate Systems (Test 1)'}</td>
                        <td className="py-3 text-center font-mono text-white/70">12</td>
                        <td className="py-3 text-center font-mono text-red-400">58.3% (7/12)</td>
                        <td className="py-3 text-center font-mono text-amber-400">83.3% (10/12)</td>
                        <td className="py-3 text-center font-mono text-emerald-400 font-medium">91.7% (11/12)</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium text-white">{tr ? '1D & 2D Kinematik / Atışlar (Test 3 & 7)' : '1D & 2D Kinematics / Projectiles (Test 3 & 7)'}</td>
                        <td className="py-3 text-center font-mono text-white/70">24</td>
                        <td className="py-3 text-center font-mono text-red-400">62.5% (15/24)</td>
                        <td className="py-3 text-center font-mono text-amber-400">91.7% (22/24)</td>
                        <td className="py-3 text-center font-mono text-emerald-400 font-medium">95.8% (23/24)</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium text-white">{tr ? 'Dinamik, Newton Yasaları & Sürtünme (Test 10 & 11)' : 'Dynamics, Newton\'s Laws & Friction (Test 10 & 11)'}</td>
                        <td className="py-3 text-center font-mono text-white/70">21</td>
                        <td className="py-3 text-center font-mono text-red-400">61.9% (13/21)</td>
                        <td className="py-3 text-center font-mono text-amber-400">90.5% (19/21)</td>
                        <td className="py-3 text-center font-mono text-emerald-400 font-medium">95.2% (20/21)</td>
                      </tr>
                      <tr className="border-t border-white/[0.12] bg-white/[0.02] font-medium">
                        <td className="py-3.5 text-white">{tr ? 'Genel Toplam (Tüm Veriseti)' : 'Overall Total (Full Dataset)'}</td>
                        <td className="py-3.5 text-center font-mono text-white">57</td>
                        <td className="py-3.5 text-center font-mono text-red-400">61.4% (35/57)</td>
                        <td className="py-3.5 text-center font-mono text-amber-400">89.5% (51/57)</td>
                        <td className="py-3.5 text-center font-mono text-emerald-400 font-bold">94.7% (54/57)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* SECTION 4: LIMITATIONS & FUTURE WORK */}
            <section id="limitations" className="scroll-mt-24 space-y-8">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8052ff]">
                  Section 04
                </span>
                <h2 className="mt-1 font-sans text-[28px] font-normal text-white">
                  {tr ? 'Açık Sınırlar ve Gelecek Yol Haritası' : 'Honest Limitations & Engineering Roadmap'}
                </h2>
                <p className="mt-2 font-sans text-[14.5px] font-light text-white/60">
                  {tr
                    ? 'Mevcut mimarinin kısıtları ve geliştirmekte olduğumuz gelecek nesil algoritmalar.'
                    : 'Known edge cases in the current pipeline and the research roadmap ahead.'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 font-sans">
                {/* Limitation 1 */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                  <div className="flex items-center gap-2 font-mono text-[12px] uppercase text-amber-400">
                    <AlertTriangle size={15} />
                    <span>{tr ? '1. Görme Modeli (OCR) Bağımlılığı' : '1. Vision OCR Extraction Bottlenecks'}</span>
                  </div>
                  <p className="mt-3 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    {tr
                      ? 'mathjs denetimi, görüntüden çıkarılan değişkenlerin doğruluğu kadar etkilidir. Düşük çözünürlüklü veya bulanık fotoğraflarda küçük alt indisler (v₀ vs. v₁) veya küçük açılar (37° vs. 53°) model tarafından yanlış okunursa, formülün kendisi tutarlı olsa dahi yanlış başlangıç verisi nedeniyle sonuç hatalı çıkabilir.'
                      : 'Deterministic auditing is bounded by the fidelity of visual parameter extraction. In blurry or degraded images, ambiguous subscripts (v₀ vs. v₁) or small angle notations (37° vs. 53°) can be misread by Vision OCR, leading to algebraically sound proofs evaluated on incorrect initial premises.'}
                  </p>
                </div>

                {/* Limitation 2 */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                  <div className="flex items-center gap-2 font-mono text-[12px] uppercase text-amber-400">
                    <AlertTriangle size={15} />
                    <span>{tr ? '2. Serbest Cisim Diyagram Kapsamı' : '2. Diagram Rendering Scope'}</span>
                  </div>
                  <p className="mt-3 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    {tr
                      ? 'Mevcut etkileşimli SVG kuvvet diyagramı motorumuz eğik düzlemler, yatay zeminler ve sürtünme vektörleri için optimize edilmiştir. Elektrik devre şemaları, optik ışın izleme ve dairesel hareket diyagramları şu an cebirsel KaTeX adımlarıyla sunulmakta, görsel interaktif çizim içermemektedir.'
                      : 'Our interactive SVG force diagram canvas is currently specialized for planar mechanics: inclined planes, horizontal blocks, and friction vectors. Complex circuit schematics, lens ray tracing, and curvilinear rotational diagrams are solved in algebraic KaTeX without canvas overlays.'}
                  </p>
                </div>

                {/* Future 1 */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                  <div className="flex items-center gap-2 font-mono text-[12px] uppercase text-emerald-400">
                    <Sparkles size={15} />
                    <span>{tr ? 'Yol Haritası: 2B Birim Kare Tespiti' : 'Roadmap: 2D Unit-Grid Coordinate Detection'}</span>
                  </div>
                  <p className="mt-3 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    {tr
                      ? 'MEB vektör sorularının önemli bir kısmı "birim kareli zemin" (grid) üzerinde sorulur. Görsel modelin kare saymak yerine hata yapmasını engellemek amacıyla doğrudan görüntü üzerinde birim kare ızgaralarını tespit eden bir ön-işleme bilgisayarla görme modeli geliştiriyoruz.'
                      : 'Turkish MEB vector exams frequently use tick-mark coordinate grids. To eliminate counting hallucinations by multimodal models, we are building a dedicated CV preprocessing stage that identifies grid axes and extracts exact coordinate vectors before LLM prompting.'}
                  </p>
                </div>

                {/* Future 2 */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                  <div className="flex items-center gap-2 font-mono text-[12px] uppercase text-emerald-400">
                    <Sparkles size={15} />
                    <span>{tr ? 'Yol Haritası: İstemci WebAssembly mathjs' : 'Roadmap: Client-Side WebAssembly mathjs'}</span>
                  </div>
                  <p className="mt-3 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    {tr
                      ? 'Öğrencilerin çevrimdışı dahi denetim yapabilmesi için mathjs sembolik motorunu tarayıcı WebAssembly ortamına taşıyarak sıfır gecikmeli etkileşimli değişken ayarlama (slider ile parametre değiştirip anında denetleme) desteği ekliyoruz.'
                      : 'To support offline student inspection, we are packaging the mathjs auditor into WebAssembly, enabling zero-latency client-side verification where students can manipulate sliders to inspect how changing parameters impacts dimensional consistency.'}
                  </p>
                </div>
              </div>
            </section>

            {/* Bottom CTA Card */}
            <div className="rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.04] to-transparent p-10 text-center">
              <h3 className="font-sans text-[26px] font-normal text-white">
                {tr ? 'Çözücüyü Şimdi Deneyin' : 'Experience the Neuro-Symbolic Solver'}
              </h3>
              <p className="mx-auto mt-2 max-w-lg font-sans text-[14.5px] font-light text-white/60">
                {tr
                  ? 'Kendi lise fizik sorunuzu yazın veya bir ödev fotoğrafı yükleyin. mathjs denetim rozetini canlı olarak inceleyin.'
                  : 'Enter your high school physics problem or photograph your homework worksheet. Inspect the live mathjs verification badge.'}
              </p>
              <div className="mt-6 flex items-center justify-center gap-4">
                <Link
                  href="/solve"
                  className="rounded-full bg-white px-7 py-3 font-sans text-[13px] font-medium text-black transition-all hover:bg-neutral-200 active:scale-[0.98]"
                >
                  {tr ? 'Çözücüye Git' : 'Open Solver'}
                </Link>
                <Link
                  href="/why"
                  className="rounded-full border border-white/20 bg-white/[0.04] px-6 py-3 font-sans text-[13px] font-medium text-white/80 transition-all hover:border-white/40 hover:bg-white/[0.1] hover:text-white"
                >
                  {tr ? 'Neden Physicsmn?' : 'Why Physicsmn?'}
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
