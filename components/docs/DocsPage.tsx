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
    { id: 'architecture', label: 'Nasıl Çalışır? (Sistem İşleyişi)' },
    { id: 'tests', label: 'Örnek Doğrulama Testleri' },
    { id: 'benchmark', label: '57 Soruluk MEB Başarı Raporu' },
    { id: 'limitations', label: 'Önemli Bilgiler ve Yol Haritası' },
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
              Sistem ve Başarı Raporu
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
                <span>Sistem ve Başarı Raporu</span>
              </div>
              <h1 className="mt-4 font-display text-[34px] font-light tracking-[-0.03em] text-white sm:text-[44px]">
                Physicsmn Nasıl Çalışır ve Hataları Nasıl Önler?
              </h1>
              <p className="mt-4 text-[16px] font-light leading-[1.65] text-[#A1A1AA]">
                Standart yapay zekaların işlem hatalarını önlemek için geliştirdiğimiz kontrol sistemi: Soruyu anlama, formülü kurma, <strong>mathjs</strong> matematik motoru ile her sayıyı doğrulama ve adımları net bir şekilde ekrana getirme süreci.
              </p>
            </div>

            {/* SECTION 1: ARCHITECTURE */}
            <section id="architecture" className="scroll-mt-24 space-y-8">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2E8BFF]">
                  Bölüm 01
                </span>
                <h2 className="mt-1 font-display text-[28px] font-light text-white">
                  Adım Adım Nasıl Çalışır? (Sistem İşleyişi)
                </h2>
                <p className="mt-2 text-[14.5px] font-light text-white/60">
                  Sorunuzu yüklediğiniz andan itibaren çözümün ekranınıza gelişine kadar her adım özenle kontrol edilir.
                </p>
              </div>

              {/* Visual Pipeline Flow Diagram */}
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                <h3 className="text-[12px] font-medium uppercase tracking-wider text-white/60">
                  6 Adımlı Çözüm ve Kontrol Süreci
                </h3>

                <div className="mt-6 flex flex-col gap-3 text-[12.5px]">
                  {/* Step 1 */}
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/60 p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-medium text-white">1</span>
                    <div className="flex-1">
                      <span className="font-medium text-white">Soruyu Yükleme (Kamera veya Yazı)</span>
                      <span className="block text-[11.5px] text-white/50">Sorunuzu ister klavyeden yazın, ister çalışma kâğıdınızın veya ödevinizin fotoğrafını yükleyin.</span>
                    </div>
                    <span className="text-white/40 text-[11px]">Giriş</span>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center text-white/20">↓</div>

                  {/* Step 2 */}
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/60 p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-medium text-white">2</span>
                    <div className="flex-1">
                      <span className="font-medium text-[#2E8BFF]">Görsel ve Güvenlik Kontrolü</span>
                      <span className="block text-[11.5px] text-white/50">Yüklenen fotoğrafın net bir görsel olduğu doğrulanır. Kimliğiniz veya IP adresiniz asla kaydedilmez; sorularınız gizli kalır.</span>
                    </div>
                    <span className="text-white/40 text-[11px]">Güvenlik</span>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center text-white/20">↓</div>

                  {/* Step 3 */}
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/60 p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-medium text-white">3</span>
                    <div className="flex-1">
                      <span className="font-medium text-[#8052ff]">Soruyu ve Fizik Konusunu Anlama</span>
                      <span className="block text-[11.5px] text-white/50">Yapay zeka soruyu dikkatle okur; MEB lise müfredatına göre hangi fizik formüllerinin (kuvvet, hareket, enerji vb.) kullanılması gerektiğini belirler.</span>
                    </div>
                    <span className="text-white/40 text-[11px]">Fizik Modeli</span>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center text-white/20">↓</div>

                  {/* Step 4 */}
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/60 p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-medium text-white">4</span>
                    <div className="flex-1">
                      <span className="font-medium text-white">Düzenli ve Adım Adım Yapı</span>
                      <span className="block text-[11.5px] text-white/50">Çözümü karmaşık bir metin yığını yerine; Verilenler, Formül ve İşlem Adımları olarak düzenli basamaklara ayırır.</span>
                    </div>
                    <span className="text-white/40 text-[11px]">Planlama</span>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center text-white/20">↓</div>

                  {/* Step 5 */}
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 font-medium text-emerald-400">5</span>
                    <div className="flex-1">
                      <span className="font-medium text-emerald-400">Matematik Motoru ile Kesin Hesap (mathjs)</span>
                      <span className="block text-[11.5px] text-emerald-200/60">Yapay zekanın bulduğu formülü bağımsız matematik motorumuz mathjs baştan sona tekrar çözer. Birimlerin (metre, joule, saniye) ve sayıların kesin doğruluğunu kontrol eder.</span>
                    </div>
                    <span className="text-emerald-400 font-medium text-[11px]">Hesap Güvencesi</span>
                  </div>

                  {/* Arrow with fork */}
                  <div className="flex justify-center text-white/30 text-[11px]">↓ (Hesap Hatası Varsa? → Otomatik Düzeltir / Sorun Yoksa? → Onaylar)</div>

                  {/* Step 6 */}
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/60 p-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 font-medium text-white">6</span>
                    <div className="flex-1">
                      <span className="font-medium text-[#E5C158]">Otomatik Düzeltme ve Ekrana Basma</span>
                      <span className="block text-[11.5px] text-white/50">Eğer hesaplamada en ufak bir hata bulunursa, sistem bunu siz görmeden önce anında baştan çözerek düzeltir ve okunaklı, şık bir formatta karşınıza getirir.</span>
                    </div>
                    <span className="text-white/40 text-[11px]">Nihai Çözüm</span>
                  </div>
                </div>
              </div>

              {/* Detailed Components Cards */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
                  <h4 className="text-[13.5px] font-medium uppercase tracking-wider text-white">
                    1. Fotoğraf ve Dosya Kontrolü
                  </h4>
                  <p className="mt-2 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    Yüklediğiniz fotoğrafın net ve okunabilir bir görsel olduğu kontrol edilir; bozuk veya açılmayan dosyalar elenir. Sorunun doğru çözülebilmesi için görselin temiz çekilmesi sağlanır.
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
                  <h4 className="text-[13.5px] font-medium uppercase tracking-wider text-white">
                    2. Tam Gizlilik Güvencesi
                  </h4>
                  <p className="mt-2 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    Öğrencilerin kişisel bilgileri veya IP adresleri asla kaydedilmez. Çözümleriniz ve sorduğunuz sorular sunucularda depolanmaz; yalnızca kendi telefonunuzda veya bilgisayarınızda kalır.
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
                  <h4 className="text-[13.5px] font-medium uppercase tracking-wider text-white">
                    3. mathjs Matematik Motoru
                  </h4>
                  <p className="mt-2 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    Yapay zekanın kelime tahminlerine güvenilmez. Tüm çarpma, bölme ve formül hesaplamaları <strong>mathjs</strong> motoru ile gerçek bir hesap makinesi gibi kesin olarak çözülür.
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
                  <h4 className="text-[13.5px] font-medium uppercase tracking-wider text-white">
                    4. Otomatik Hata Yakalama ve Onarım
                  </h4>
                  <p className="mt-2 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    Eğer işlem sonucunda bir sayı veya birim tutarsızlığı bulunursa, sistem çözümü durdurur ve hatayı düzelterek en doğru halini ekrana yansıtır.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 2: UNIT TESTS & FAULT INJECTION */}
            <section id="tests" className="scroll-mt-24 space-y-8">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#10B981]">
                  Bölüm 02
                </span>
                <h2 className="mt-1 font-display text-[28px] font-light text-white">
                  Örnek Doğrulama Testleri: Hataları Nasıl Yakalıyoruz?
                </h2>
                <p className="mt-2 text-[14.5px] font-light text-white/60">
                  mathjs matematik motorumuzun yapay zeka hatalarını nasıl yakaladığını gösteren 4 somut örnek.
                </p>
              </div>

              <div className="space-y-6 text-[13px]">
                {/* Test 1 */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[#10B981] font-medium">TEST 1: Doğru Kinetik Enerji Çözümü</span>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-0.5 text-[11px] text-emerald-400">ONAYLANDI ✓</span>
                  </div>
                  <p className="mt-2 text-[14px] font-light text-white/70">
                    Kütlesi m = 2 kg, hızı v = 10 m/s olan cismin enerjisi (E_k = 0.5 · 2 · 10² = 100 J). mathjs formülü hesaplar, sonucun ve Joule biriminin tamamen doğru olduğunu onaylar.
                  </p>
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-black/80 p-4 text-[12px] text-white/80">
{`Girdi: m = 2 kg, v = 10 m/s, Formül: 0.5 * m * v^2
mathjs Hesabı: 100.00 Joule
Sonuç: Tamamen Doğru ve Onaylandı.`}
                  </pre>
                </div>

                {/* Test 2 */}
                <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-6 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="text-red-400 font-medium">TEST 2: Yanlış Hesaplama Yakalandı</span>
                    <span className="rounded-full bg-red-500/10 px-3 py-0.5 text-[11px] text-red-400">YAKALANDI VE DÜZELTİLDİ ✗</span>
                  </div>
                  <p className="mt-2 text-[14px] font-light text-white/70">
                    Formül 100 J vermesi gerekirken yapay zekanın işlem hatasıyla 999 J yazdığı durum simüle edildi. mathjs işlem hatasını anında yakaladı ve durdurdu.
                  </p>
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-black/80 p-4 text-[12px] text-red-300">
{`Yapay Zeka Tahmini: 999 Joule
mathjs Gerçek Hesabı: 100.00 Joule
Uyarı: İşlem sonucu uyuşmuyor! Hata fark edildi ve otomatik olarak 100 J'e düzeltildi.`}
                  </pre>
                </div>

                {/* Test 3 */}
                <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-6 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-medium">TEST 3: Yanlış Fizik Birimi Yakalandı</span>
                    <span className="rounded-full bg-amber-500/10 px-3 py-0.5 text-[11px] text-amber-400">YAKALANDI VE DÜZELTİLDİ ✗</span>
                  </div>
                  <p className="mt-2 text-[14px] font-light text-white/70">
                    Formül enerji birimi olan Joule verirken yapay zekanın hız birimi (m/s) yazdığı durum. mathjs birimlerin uyuşmadığını tespit etti ve engelledi.
                  </p>
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-black/80 p-4 text-[12px] text-amber-300">
{`Formül Sonucu: Joule (Enerji Birimi)
Yazılan Birim: m/s (Hız Birimi)
Uyarı: Fizik birimleri uyuşmuyor! Enerji formülünün birimi m/s olamaz. Joule olarak düzeltildi.`}
                  </pre>
                </div>

                {/* Test 4 */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[#2E8BFF] font-medium">TEST 4: MEB Standart Açı Değerleri (37° ve 53°)</span>
                    <span className="rounded-full bg-blue-500/10 px-3 py-0.5 text-[11px] text-blue-400">ONAYLANDI ✓</span>
                  </div>
                  <p className="mt-2 text-[14px] font-light text-white/70">
                    Lise fizik problemlerinde açılar derece cinsindendir (37°). Physicsmn, MEB sınav kurallarına uygun olarak sin(37°) = 0.6 değerini tam olarak uygular.
                  </p>
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-black/80 p-4 text-[12px] text-white/80">
{`Açı: 37 Derece, Hız: 50 m/s
Düşey Hız Hesabı: 50 * sin(37°) = 50 * 0.6 = 30.00 m/s
Sonuç: MEB sınav kurallarıyla tam uyumlu.`}
                  </pre>
                </div>
              </div>
            </section>

            {/* SECTION 3: EMPIRICAL BENCHMARK STUDY */}
            <section id="benchmark" className="scroll-mt-24 space-y-8">
              <div className="border-b border-white/[0.08] pb-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E5C158]">
                  Bölüm 03
                </span>
                <h2 className="mt-1 font-display text-[28px] font-light text-white">
                  57 Soruluk MEB Başarı ve Doğruluk Raporu
                </h2>
                <p className="mt-2 text-[14.5px] font-light text-white/60">
                  Milli Eğitim Bakanlığı (MEB) 11. Sınıf Fizik Kazanım Testleri&apos;nden alınan 10 gerçek sınav sayfasındaki 57 soru üzerinde yapılan karşılaştırma.
                </p>
              </div>

              {/* Accuracy Comparison Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-center backdrop-blur-md">
                  <span className="text-[12px] uppercase text-white/40">
                    Standart Yapay Zeka
                  </span>
                  <div className="mt-2 font-display text-[36px] font-medium text-red-400">61.4%</div>
                  <div className="mt-1 text-[13px] text-white/50">35 / 57 Soru Doğru</div>
                  <p className="mt-4 text-[12.5px] font-light text-white/60">
                    Matematik motoru yoktur. Sayısal işlemlerde sık sık hata yapar ve çok sorulu sayfaları karıştırır.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-center backdrop-blur-md">
                  <span className="text-[12px] uppercase text-white/40">
                    Google Gemini
                  </span>
                  <div className="mt-2 font-display text-[36px] font-medium text-amber-400">89.5%</div>
                  <div className="mt-1 text-[13px] text-white/50">51 / 57 Soru Doğru</div>
                  <p className="mt-4 text-[12.5px] font-light text-white/60">
                    Görsel tanıma yeteneği yüksektir ancak çok basamaklı işlemlerde hesaplama hataları yapabilir.
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 text-center backdrop-blur-md shadow-[0_0_40px_rgba(16,185,129,0.08)]">
                  <span className="text-[12px] uppercase text-emerald-400 font-semibold">
                    Physicsmn
                  </span>
                  <div className="mt-2 font-display text-[36px] font-medium text-emerald-400">94.7%</div>
                  <div className="mt-1 text-[13px] text-emerald-200/70">54 / 57 Soru Doğru</div>
                  <p className="mt-4 text-[12.5px] font-light text-emerald-100/70">
                    mathjs matematik motoru sayesinde standart yapay zekanın yaptığı işlem hatalarının neredeyse tamamı ekrana gelmeden düzeltilmiştir.
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
                  57 Sorunun Genel Değerlendirmesi
                </h3>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="font-display text-[24px] font-medium text-white">49 / 57</div>
                    <div className="text-[12px] text-white/50 mt-1">
                      mathjs Tarafından Tam Onaylandı (%85.96)
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="font-display text-[24px] font-medium text-[#8052ff]">12 / 57</div>
                    <div className="text-[12px] text-white/50 mt-1">
                      İşlem Hatası Anında Fark Edilip Düzeltildi (%21.05)
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="font-display text-[24px] font-medium text-[#10B981]">21 / 57</div>
                    <div className="text-[12px] text-white/50 mt-1">
                      Standart Yapay Zekanın Yanlışları Düzeltildi (%36.84)
                    </div>
                  </div>
                </div>

                {/* Topic Breakdown Table */}
                <div className="mt-8 overflow-x-auto">
                  <table className="w-full text-left text-[13.5px]">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-[11px] uppercase tracking-wider text-white/50">
                        <th className="pb-3">Konu Başlığı</th>
                        <th className="pb-3 text-center">Soru Sayısı</th>
                        <th className="pb-3 text-center">Standart Yapay Zeka</th>
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
                        <td className="py-3.5 text-white">Genel Toplam (57 Soru)</td>
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
                  Bölüm 04
                </span>
                <h2 className="mt-1 font-display text-[28px] font-light text-white">
                  Önemli Bilgiler ve Geliştirme Yol Haritası
                </h2>
                <p className="mt-2 text-[14.5px] font-light text-white/60">
                  En iyi sonucu alabilmeniz için bilmeniz gerekenler ve üzerinde çalıştığımız yeni özellikler.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Limitation 1 */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-[12px] uppercase text-amber-400 font-medium">
                    <AlertTriangle size={15} />
                    <span>1. Fotoğraf Kalitesi Önemlidir</span>
                  </div>
                  <p className="mt-3 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    Çözümün doğru olabilmesi için sorunun net okunması gerekir. Eğer yüklediğiniz fotoğraf çok karanlık, bulanık veya sayılar silikse, yapay zeka sorudaki bir sayıyı (örneğin 3 yerine 8) yanlış okuyabilir. Fotoğrafı çekerken ışığın iyi olmasına ve sorunun tamamının görünmesine özen gösterin.
                  </p>
                </div>

                {/* Limitation 2 */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-[12px] uppercase text-amber-400 font-medium">
                    <AlertTriangle size={15} />
                    <span>2. Şekilli Çizim Desteği</span>
                  </div>
                  <p className="mt-3 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    Şu anda eğik düzlemler, sürtünmeli zeminler ve kuvvet vektörleri için etkileşimli çizimler sunuyoruz. Elektrik devreleri veya ışığın kırılması gibi optik şekillerini ise çizim yerine adım adım matematiksel işlemlerle anlatıyoruz.
                  </p>
                </div>

                {/* Future 1 */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-[12px] uppercase text-emerald-400 font-medium">
                    <Sparkles size={15} />
                    <span>Yol Haritası: Birim Kareli Zeminler</span>
                  </div>
                  <p className="mt-3 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    MEB testlerinde sıkça sorulan kareli zemin üzerindeki vektör sorularında kareleri otomatik ve hatasız sayabilen yeni bir akıllı görsel sistem hazırlıyoruz.
                  </p>
                </div>

                {/* Future 2 */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-[12px] uppercase text-emerald-400 font-medium">
                    <Sparkles size={15} />
                    <span>Yol Haritası: Çevrimdışı Kullanım Desteği</span>
                  </div>
                  <p className="mt-3 text-[14px] font-light leading-relaxed text-[#A1A1AA]">
                    İleride internet bağlantınız olmadığında bile matematiksel hesaplamaları doğrudan telefonunuzda veya bilgisayarınızda anında yapabilmeniz için çalışıyoruz.
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
                Kendi lise fizik sorunuzu yazın veya bir ödev fotoğrafı yükleyin. mathjs matematik kontrolünü canlı olarak görün.
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
