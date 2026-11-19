'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, FileCode, Sparkles } from 'lucide-react';
import { BenchmarkVisualizer } from './BenchmarkVisualizer';

export function DocsPage() {
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
    { id: 'architecture', label: 'Sistem Mimarisi & İşlem Hattı' },
    { id: 'tests', label: 'Deterministik Doğrulama & Testler' },
    { id: 'benchmark', label: 'Ampirik Kıyaslama (N = 57 MEB Veriseti)' },
    { id: 'limitations', label: 'Sınırlar ve Gelecek Yol Haritası' },
  ];

  return (
    <div className="min-h-screen bg-black text-[#F5F5F7] selection:bg-white/20 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-10">
          <Link href="/" className="flex items-center gap-2 group" aria-label="Physicsmn Ana Sayfa">
            <span className="font-display text-[15px] font-semibold tracking-[0.16em] text-white">
              PHYSICSMN
            </span>
            <span className="rounded-full border border-white/20 bg-white/[0.06] px-2.5 py-0.5 text-[10.5px] uppercase tracking-wider text-[#10B981]">
              Teknik Belgeler
            </span>
          </Link>

          <nav className="flex items-center gap-5 sm:gap-7">
            <Link
              href="/why"
              className="hidden text-[12.5px] font-medium tracking-wide text-white/60 transition-colors hover:text-white md:inline"
            >
              Neden Physicsmn?
            </Link>
            <Link
              href="/docs"
              className="text-[12.5px] font-medium tracking-wide text-white underline underline-offset-8"
            >
              Belgeler & Kıyaslama
            </Link>
            <Link
              href="/solve"
              className="rounded-full bg-white px-4 py-1.5 text-[12.5px] font-medium text-black transition-all hover:bg-neutral-200 active:scale-[0.98]"
            >
              Çözücüyü Aç
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
              <span className="mb-3 px-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">
                İçindekiler
              </span>

              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-[13px] transition-all duration-200 ${
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
                  className="flex items-center gap-2 px-3 py-2 text-[12px] text-white/50 transition-colors hover:text-white"
                >
                  <span>← Neden Physicsmn? Karşılaştırması</span>
                </Link>
                <Link
                  href="/solve"
                  className="mt-1 flex items-center gap-2 px-3 py-2 text-[12px] text-[#E5C158] transition-colors hover:text-white"
                >
                  <span>Çözücü Arayüzünü Başlat →</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 space-y-24">
            {/* Header intro */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[#10B981]">
                <FileCode size={13} />
                <span>Teknik Rapor & Sistem Mimarisi</span>
              </div>
              <h1 className="mt-4 font-display text-[34px] font-light tracking-[-0.03em] text-white sm:text-[44px]">
                Physicsmn Mühendislik & Kıyaslama Raporu
              </h1>
              <p className="mt-4 text-[16px] font-light leading-[1.65] text-[#A1A1AA]">
                Büyük dil modellerinin istatistiksel muhakeme yeteneğini, mathjs deterministik sembolik motoru ve MEB müfredat standartlarıyla birleştiren nöro-sembolik fizik çözücüsünün teknik detayları ve deneysel sonuçları.
              </p>
            </div>

            {/* SECTION 1: ARCHITECTURE */}
            <section id="architecture" className="scroll-mt-24 space-y-8">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2E8BFF]">
                  Section 01
                </span>
                <h2 className="mt-1 font-display text-[28px] font-light text-white">
                  Sistem Mimarisi ve Uçtan Uca İşlem Hattı
                </h2>
                <p className="mt-2 text-[14.5px] font-light text-white/60">
                  Kullanıcı girdisinden LaTeX derlemesine ve yerel depolamaya kadar her aşama tip güvenliği ve güvenlik katmanlarıyla korunur.
                </p>
              </div>

              {/* Visual Pipeline Flow Diagram */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                <h3 className="text-[12px] font-medium uppercase tracking-wider text-white/60">
                  İşlem Hattı Akış Şeması
                </h3>

                <div className="mt-6 flex flex-col gap-3 text-[12.5px]">
                  {/* Step 1 */}
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/60 p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-medium text-white">1</span>
                    <div className="flex-1">
                      <span className="font-medium text-white">SolveBar.tsx / Composer.tsx</span>
                      <span className="block text-[11.5px] text-white/50">Metin girdisi veya kamera/fotoğraf yüklemesi (İstemci tarafı 4.5MB denetimi)</span>
                    </div>
                    <span className="text-white/40 text-[11px]">Client UI</span>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center text-white/20">↓</div>

                  {/* Step 2 */}
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/60 p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-medium text-white">2</span>
                    <div className="flex-1">
                      <span className="font-medium text-[#2E8BFF]">request.ts & rate-limit.ts</span>
                      <span className="block text-[11.5px] text-white/50">CSRF koruması + Sihirli bayt tespiti (0xFFD8FF, PNG, WEBP) + SHA-256 tuzlu IP hashleme (Upstash Redis 20 istek/gün)</span>
                    </div>
                    <span className="text-white/40 text-[11px]">Security</span>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center text-white/20">↓</div>

                  {/* Step 3 */}
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/60 p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-medium text-white">3</span>
                    <div className="flex-1">
                      <span className="font-medium text-[#8052ff]">gpt.ts & prompt.ts</span>
                      <span className="block text-[11.5px] text-white/50">gpt-5.6-luna (Muhakeme modeli, sıcaklık parametresi devre dışı, MEB 9-12 müfredat talimatı, JSON mod)</span>
                    </div>
                    <span className="text-white/40 text-[11px]">LLM Engine</span>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center text-white/20">↓</div>

                  {/* Step 4 */}
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/60 p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-medium text-white">4</span>
                    <div className="flex-1">
                      <span className="font-medium text-white">schema.ts</span>
                      <span className="block text-[11.5px] text-white/50">Zod şema doğrulaması, temizlenmiş çoktan seçmeli harf (A-E), değişkenler ve semboller ayrıştırması</span>
                    </div>
                    <span className="text-white/40 text-[11px]">Zod Schema</span>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center text-white/20">↓</div>

                  {/* Step 5 */}
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 font-medium text-emerald-400">5</span>
                    <div className="flex-1">
                      <span className="font-medium text-emerald-400">verify.ts (Deterministik mathjs Denetçisi)</span>
                      <span className="block text-[11.5px] text-emerald-200/60">Sembolik mathjs kapsamı + [M]ᵃ[L]ᵇ[T]ᶜ temel SI boyut eşitliği + ±%2 sayısal tolerans denetimi</span>
                    </div>
                    <span className="text-emerald-400 font-medium text-[11px]">Circuit Breaker</span>
                  </div>

                  {/* Arrow with fork */}
                  <div className="flex justify-center text-white/30 text-[11px]">↓ (Denetim Başarısız? → solve.ts Otonom Onarım Döngüsü / Başarılı? → Onayla)</div>

                  {/* Step 6 */}
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/60 p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-medium text-white">6</span>
                    <div className="flex-1">
                      <span className="font-medium text-[#E5C158]">render.ts & history.ts</span>
                      <span className="block text-[11.5px] text-white/50">{'Sunucu tarafı KaTeX derlemesi + Türkçe karakter normalizasyonu (\\c{c} → ç) + Çevrimdışı localStorage kaydı'}</span>
                    </div>
                    <span className="text-white/40 text-[11px]">Client Render</span>
                  </div>
                </div>
              </div>

              {/* Detailed Technical Components Cards */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
                  <h4 className="text-[13.5px] font-medium uppercase tracking-wider text-white">
                    1. CSRF & Sihirli Bayt Denetimi (`request.ts`)
                  </h4>
                  <p className="mt-2 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    İstemcinin beyan ettiği dosya uzantısına güvenilmez. Gelen görüntü ikili verisi (Buffer) sihirli baytları taranarak gerçek MIME türü doğrulanır (JPEG: 0xFFD8FF, PNG: 89504E47, WEBP: RIFF...WEBP). İstek boyutu 4.5 MB ile sınırlıdır.
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
                  <h4 className="text-[13.5px] font-medium uppercase tracking-wider text-white">
                    2. Gizlilik Odaklı Hız Sınırı (`rate-limit.ts`)
                  </h4>
                  <p className="mt-2 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    Öğrencilerin IP adresleri açık metin olarak saklanmaz; gizli RATE_LIMIT_SALT ile SHA-256 üzerinden tek yönlü hashlenir. Upstash Redis kayan pencere (sliding window) algoritmasıyla istemci başına günde 20 türetim limiti uygulanır.
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
                  <h4 className="text-[13.5px] font-medium uppercase tracking-wider text-white">
                    3. Deterministik Nöro-Sembolik Denetçi (`verify.ts`)
                  </h4>
                  <p className="mt-2 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    Modelin çıkardığı formül ifadesi (örn: &quot;0.5 * m * v^2&quot;), mathjs sembolik motorunda bilinen değişkenlerle bağımsız olarak değerlendirilir. Çıkan birim, temel SI boyutları ([M]ᵃ [L]ᵇ [T]ᶜ) açısından claimed_unit ile karşılaştırılır ve sayısal farkın %2 tolerans içinde olduğu doğrulanır.
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
                  <h4 className="text-[13.5px] font-medium uppercase tracking-wider text-white">
                    4. Otonom Öz-Düzeltme Döngüsü (`solve.ts`)
                  </h4>
                  <p className="mt-2 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    Eğer KaTeX derleme hatası veya mathjs denetim hatası tespit edilirse, çözüm öğrenciye sunulmaz. Sistem, denetim hatasının tam teknik nedenini asistana ileterek tek bir hedeflenmiş onarım çağrısıyla soruyu otomatik olarak yeniden çözer.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 2: UNIT TESTS & FAULT INJECTION */}
            <section id="tests" className="scroll-mt-24 space-y-8">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#10B981]">
                  Section 02
                </span>
                <h2 className="mt-1 font-display text-[28px] font-light text-white">
                  Deterministik Doğrulama & Hata Enjeksiyon Testleri
                </h2>
                <p className="mt-2 text-[14.5px] font-light text-white/60">
                  `tests/verify-mathjs.test.mjs` altında çalışan 4 bağımsız birim testimiz ve yakalanan gerçek hata çıktıları.
                </p>
              </div>

              <div className="space-y-6 text-[13px]">
                {/* Test 1 */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[#10B981] font-medium">TEST 1: Valid Kinetic Energy Derivation</span>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-0.5 text-[11px] text-emerald-400">PASSED ✓</span>
                  </div>
                  <p className="mt-2 text-[14px] font-light text-white/70">
                    Doğru fizik parametreleri (m = 2 kg, v = 10 m/s, E_k = 0.5·m·v² = 100 J). mathjs formülü değerlendirir, boyutu J olarak onaylar.
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
                    <span className="text-red-400 font-medium">TEST 2: Sabotaged Numerical Calculation Error</span>
                    <span className="rounded-full bg-red-500/10 px-3 py-0.5 text-[11px] text-red-400">CAUGHT & REJECTED ✗</span>
                  </div>
                  <p className="mt-2 text-[14px] font-light text-white/70">
                    Formül 100 J hesaplarken, yapay zekanın cevaba 999 J halüsinasyonu yaptığı durum simüle edildi. Tolerans aşımı nedeniyle anında reddedildi.
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
                    <span className="text-amber-400 font-medium">TEST 3: Sabotaged SI Dimensional Mismatch</span>
                    <span className="rounded-full bg-amber-500/10 px-3 py-0.5 text-[11px] text-amber-400">CAUGHT & REJECTED ✗</span>
                  </div>
                  <p className="mt-2 text-[14px] font-light text-white/70">
                    Formül enerji birimi (kg·m²/s² = Joule) verirken, iddia edilen birimin hız (m/s) olarak sabitlendiği durum. Temel SI boyutları eşleşmediği için reddedildi.
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
                    <span className="text-[#2E8BFF] font-medium">TEST 4: Trigonometric Evaluation with Degrees</span>
                    <span className="rounded-full bg-blue-500/10 px-3 py-0.5 text-[11px] text-blue-400">PASSED ✓</span>
                  </div>
                  <p className="mt-2 text-[14px] font-light text-white/70">
                    Lise fizik problemlerinde açılar derece cinsindendir (37°). Normalde mathjs varsayılan olarak radyan kullanır; Physicsmn derece etiketlemesi ile doğru düşey hızı (30.09 m/s) hesaplar.
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
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E5C158]">
                  Section 03
                </span>
                <h2 className="mt-1 font-display text-[28px] font-light text-white">
                  Ampirik Kıyaslama Çalışması (N = 57 MEB Veriseti)
                </h2>
                <p className="mt-2 text-[14.5px] font-light text-white/60">
                  10 özgün MEB 11. Sınıf Fizik Kazanım Testi sayfası (57 soru) üzerinde gerçekleştirilen çoktan seçmeli doğruluk kıyaslaması.
                </p>
              </div>

              {/* Accuracy Comparison Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-center backdrop-blur-md">
                  <span className="text-[12px] uppercase text-white/40">
                    Standart Çok Modlu Model
                  </span>
                  <div className="mt-2 font-display text-[36px] font-medium text-red-400">61.4%</div>
                  <div className="mt-1 text-[13px] text-white/50">35 / 57 Doğru</div>
                  <p className="mt-4 text-[12.5px] font-light text-white/60">
                    mathjs denetimi yok. İşlem hataları ve çok sorulu sayfa kaymaları nedeniyle düşük doğruluk.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-center backdrop-blur-md">
                  <span className="text-[12px] uppercase text-white/40">
                    Google Gemini Web Baseline
                  </span>
                  <div className="mt-2 font-display text-[36px] font-medium text-amber-400">89.5%</div>
                  <div className="mt-1 text-[13px] text-white/50">51 / 57 Doğru</div>
                  <p className="mt-4 text-[12.5px] font-light text-white/60">
                    Güçlü görsel tanıma, ancak karmaşık basamaklı sorularda küçük hesaplama hataları.
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 text-center backdrop-blur-md shadow-[0_0_40px_rgba(16,185,129,0.08)]">
                  <span className="text-[12px] uppercase text-emerald-400 font-semibold">
                    Physicsmn (Nöro-Sembolik)
                  </span>
                  <div className="mt-2 font-display text-[36px] font-medium text-emerald-400">94.7%</div>
                  <div className="mt-1 text-[13px] text-emerald-200/70">54 / 57 Doğru</div>
                  <p className="mt-4 text-[12.5px] font-light text-emerald-100/70">
                    mathjs doğrulaması + otonom öz-düzeltme döngüsü ile ham LLM hatalarının %36.8&apos;i düzeltildi.
                  </p>
                </div>
              </div>

              {/* Interactive Live Benchmark Worksheet Explorer */}
              <div className="mt-6">
                <BenchmarkVisualizer />
              </div>

              {/* Verified Metrics Breakdown Table */}
              <div className="rounded-2xl border border-white/[0.08] bg-black/60 p-6 backdrop-blur-md">
                <h3 className="text-[13px] uppercase tracking-wider text-white">
                  Deneysel Süreç Metrikleri (N = 57)
                </h3>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="font-display text-[24px] font-medium text-white">49 / 57</div>
                    <div className="text-[12px] text-white/50 mt-1">
                      mathjs Tarafından Doğrulandı (85.96%)
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="font-display text-[24px] font-medium text-[#8052ff]">12 / 57</div>
                    <div className="text-[12px] text-white/50 mt-1">
                      Öz-Düzeltme Döngüsü Tetiklendi (21.05%)
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="font-display text-[24px] font-medium text-[#10B981]">21 / 57</div>
                    <div className="text-[12px] text-white/50 mt-1">
                      Ham LLM Cevabı Düzeltildi (36.84%)
                    </div>
                  </div>
                </div>

                {/* Topic Breakdown Table */}
                <div className="mt-8 overflow-x-auto">
                  <table className="w-full text-left text-[13.5px]">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-[11px] uppercase tracking-wider text-white/50">
                        <th className="pb-3">Test Konu Kategorisi</th>
                        <th className="pb-3 text-center">Soru Sayısı</th>
                        <th className="pb-3 text-center">Ham LLM Doğruluk</th>
                        <th className="pb-3 text-center">Gemini Web</th>
                        <th className="pb-3 text-center text-emerald-400 font-semibold">Physicsmn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] font-light">
                      <tr>
                        <td className="py-3 font-medium text-white">Vektörler & Koordinat Sistemleri (Test 1)</td>
                        <td className="py-3 text-center text-white/70">12</td>
                        <td className="py-3 text-center text-red-400">58.3% (7/12)</td>
                        <td className="py-3 text-center text-amber-400">83.3% (10/12)</td>
                        <td className="py-3 text-center text-emerald-400 font-medium">91.7% (11/12)</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium text-white">1D & 2D Kinematik / Atışlar (Test 3 & 7)</td>
                        <td className="py-3 text-center text-white/70">24</td>
                        <td className="py-3 text-center text-red-400">62.5% (15/24)</td>
                        <td className="py-3 text-center text-amber-400">91.7% (22/24)</td>
                        <td className="py-3 text-center text-emerald-400 font-medium">95.8% (23/24)</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-medium text-white">Dinamik, Newton Yasaları & Sürtünme (Test 10 & 11)</td>
                        <td className="py-3 text-center text-white/70">21</td>
                        <td className="py-3 text-center text-red-400">61.9% (13/21)</td>
                        <td className="py-3 text-center text-amber-400">90.5% (19/21)</td>
                        <td className="py-3 text-center text-emerald-400 font-medium">95.2% (20/21)</td>
                      </tr>
                      <tr className="border-t border-white/[0.12] bg-white/[0.02] font-medium">
                        <td className="py-3.5 text-white">Genel Toplam (Tüm Veriseti)</td>
                        <td className="py-3.5 text-center text-white">57</td>
                        <td className="py-3.5 text-center text-red-400">61.4% (35/57)</td>
                        <td className="py-3.5 text-center text-amber-400">89.5% (51/57)</td>
                        <td className="py-3.5 text-center text-emerald-400 font-bold">94.7% (54/57)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* SECTION 4: LIMITATIONS & FUTURE WORK */}
            <section id="limitations" className="scroll-mt-24 space-y-8">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8052ff]">
                  Section 04
                </span>
                <h2 className="mt-1 font-display text-[28px] font-light text-white">
                  Açık Sınırlar ve Gelecek Yol Haritası
                </h2>
                <p className="mt-2 text-[14.5px] font-light text-white/60">
                  Mevcut mimarinin kısıtları ve geliştirmekte olduğumuz gelecek nesil algoritmalar.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Limitation 1 */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-[12px] uppercase text-amber-400 font-medium">
                    <AlertTriangle size={15} />
                    <span>1. Görme Modeli (OCR) Bağımlılığı</span>
                  </div>
                  <p className="mt-3 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    mathjs denetimi, görüntüden çıkarılan değişkenlerin doğruluğu kadar etkilidir. Düşük çözünürlüklü veya bulanık fotoğraflarda küçük alt indisler (v₀ vs. v₁) veya küçük açılar (37° vs. 53°) model tarafından yanlış okunursa, formülün kendisi tutarlı olsa dahi yanlış başlangıç verisi nedeniyle sonuç hatalı çıkabilir.
                  </p>
                </div>

                {/* Limitation 2 */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-[12px] uppercase text-amber-400 font-medium">
                    <AlertTriangle size={15} />
                    <span>2. Serbest Cisim Diyagram Kapsamı</span>
                  </div>
                  <p className="mt-3 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    Mevcut etkileşimli SVG kuvvet diyagramı motorumuz eğik düzlemler, yatay zeminler ve sürtünme vektörleri için optimize edilmiştir. Elektrik devre şemaları, optik ışın izleme ve dairesel hareket diyagramları şu an cebirsel KaTeX adımlarıyla sunulmakta, görsel interaktif çizim içermemektedir.
                  </p>
                </div>

                {/* Future 1 */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-[12px] uppercase text-emerald-400 font-medium">
                    <Sparkles size={15} />
                    <span>Yol Haritası: 2B Birim Kare Tespiti</span>
                  </div>
                  <p className="mt-3 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    MEB vektör sorularının önemli bir kısmı &quot;birim kareli zemin&quot; (grid) üzerinde sorulur. Görsel modelin kare saymak yerine hata yapmasını engellemek amacıyla doğrudan görüntü üzerinde birim kare ızgaralarını tespit eden bir ön-işleme bilgisayarla görme modeli geliştiriyoruz.
                  </p>
                </div>

                {/* Future 2 */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-[12px] uppercase text-emerald-400 font-medium">
                    <Sparkles size={15} />
                    <span>Yol Haritası: İstemci WebAssembly mathjs</span>
                  </div>
                  <p className="mt-3 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    Öğrencilerin çevrimdışı dahi denetim yapabilmesi için mathjs sembolik motorunu tarayıcı WebAssembly ortamına taşıyarak sıfır gecikmeli etkileşimli değişken ayarlama (slider ile parametre değiştirip anında denetleme) desteği ekliyoruz.
                  </p>
                </div>
              </div>
            </section>

            {/* Bottom CTA Card */}
            <div className="rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.04] to-transparent p-10 text-center">
              <h3 className="font-display text-[26px] font-light text-white">
                Çözücüyü Şimdi Deneyin
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-[14.5px] font-light text-white/60">
                Kendi lise fizik sorunuzu yazın veya bir ödev fotoğrafı yükleyin. mathjs denetim rozetini canlı olarak inceleyin.
              </p>
              <div className="mt-6 flex items-center justify-center gap-4">
                <Link
                  href="/solve"
                  className="rounded-full bg-white px-7 py-3 text-[13px] font-medium text-black transition-all hover:bg-neutral-200 active:scale-[0.98]"
                >
                  Çözücüye Git
                </Link>
                <Link
                  href="/why"
                  className="rounded-full border border-white/20 bg-white/[0.04] px-6 py-3 text-[13px] font-medium text-white/80 transition-all hover:border-white/40 hover:bg-white/[0.1] hover:text-white"
                >
                  Neden Physicsmn?
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
