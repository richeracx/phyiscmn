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
import { AsciiCosmos } from '@/components/shared/AsciiCosmos';
import { CircuitBreakerDemo } from './CircuitBreakerDemo';
import { VectorPlayground } from './VectorPlayground';

export function WhyPage() {
  return (
    <div className="min-h-screen bg-black text-[#F5F5F7] selection:bg-white/20 font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-10">
          <Link href="/" className="flex items-center gap-2 group" aria-label="Physicsmn Ana Sayfa">
            <span className="font-display text-[15px] font-semibold tracking-[0.16em] text-white">
              PHYSICSMN
            </span>
            <span className="rounded-full border border-white/20 bg-white/[0.06] px-2.5 py-0.5 text-[10.5px] uppercase tracking-wider text-white/70">
              Neden Physicsmn
            </span>
          </Link>

          <nav className="flex items-center gap-5 sm:gap-7">
            <Link
              href="/"
              className="hidden text-[12.5px] font-medium tracking-wide text-white/60 transition-colors hover:text-white md:inline"
            >
              Giriş
            </Link>
            <Link
              href="/why"
              className="text-[12.5px] font-medium tracking-wide text-white underline underline-offset-8"
            >
              Neden Physicsmn?
            </Link>
            <Link
              href="/docs"
              className="text-[12.5px] font-medium tracking-wide text-white/60 transition-colors hover:text-white"
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

      {/* Hero Section with Cosmic ASCII Canvas */}
      <section className="relative overflow-hidden border-b border-white/[0.06] px-6 py-16 sm:px-10 md:py-24">
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#8052ff]/15 via-transparent to-transparent blur-3xl" />

        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[#E5C158] backdrop-blur-md">
            <Scale size={13} className="text-[#E5C158]" />
            <span>Nöro-Sembolik Mimari vs. Olasılıksal Dil Modelleri</span>
          </div>

          <h1 className="font-display text-[clamp(2.5rem,5.5vw,4.5rem)] font-light leading-[1.04] tracking-[-0.03em] text-white">
            Fizik tahmin edilemez, <br className="hidden sm:inline" />
            <span className="text-white/60">ispat edilir ve denetlenir.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-[16.5px] font-light leading-[1.65] text-[#A1A1AA] sm:text-[18.5px]">
            Standart üretken yapay zekalar (ChatGPT, Gemini) kelimeleri istatistiksel olasılıkla tamamlar; bu da aritmetik ve birimsel halüsinasyonlara yol açar. Physicsmn ise yapay zekayı deterministik mathjs sembolik denetimi ve otonom öz-düzeltme döngüsü ile birleştirir.
          </p>

          {/* Interactive ASCII Physics Canvas */}
          <div className="mt-10">
            <AsciiCosmos height={240} />
          </div>

          {/* Key Metric Pills (Minimalist Typography) */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center backdrop-blur-sm">
              <div className="font-display text-[26px] font-medium text-white sm:text-[30px]">94.7%</div>
              <div className="mt-1 text-[12px] font-light text-white/60">
                MEB Görsel Doğruluk
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center backdrop-blur-sm">
              <div className="font-display text-[26px] font-medium text-[#10B981] sm:text-[30px]">±2%</div>
              <div className="mt-1 text-[12px] font-light text-white/60">
                Deterministik Tolerans
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center backdrop-blur-sm">
              <div className="font-display text-[26px] font-medium text-[#E5C158] sm:text-[30px]">
                [M]<sup>a</sup>[L]<sup>b</sup>[T]<sup>c</sup>
              </div>
              <div className="mt-1 text-[12px] font-light text-white/60">
                SI Temel Boyut Eşitliği
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center backdrop-blur-sm">
              <div className="font-display text-[26px] font-medium text-white sm:text-[30px]">100%</div>
              <div className="mt-1 text-[12px] font-light text-white/60">
                Yerel Gizlilik (Sıfır İzleme)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Section */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <div className="mb-14 text-center">
          <span className="text-[12px] font-medium uppercase tracking-[0.2em] text-white/50">
            01 // MİMARİ KARŞILAŞTIRMA
          </span>
          <h2 className="mt-2 font-display text-[30px] font-light tracking-[-0.02em] text-white sm:text-[38px]">
            Dört Temel Fark: Neden Farklı Sonuç Alıyoruz?
          </h2>
          <p className="mt-3 text-[16px] font-light text-white/60 max-w-2xl mx-auto">
            Standart bir dil modeli ile fizik için özel olarak inşa edilmiş nöro-sembolik sistem arasındaki farklar.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Difference 1 */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 backdrop-blur-md transition-all hover:border-white/20">
            <div>
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#10B981]">
                <Binary size={22} />
              </div>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-white/40">
                Pillar 01
              </span>
              <h3 className="mt-1 font-display text-[22px] font-normal text-white">
                Olasılıksal Tahmin vs. Deterministik mathjs Denetimi
              </h3>
              <p className="mt-3 text-[14.5px] font-light leading-[1.65] text-[#A1A1AA]">
                Standart üretken modeller sayıları ve formülleri ardışık metin belirteçleri (tokens) olarak tamamlar. Çarpma ve kare alma gibi temel işlemlerde bile sayısal halüsinasyon yapabilirler. Physicsmn ise çıkarılan tüm değişkenleri sembolik mathjs kapsamına yükler, temel SI birimlerini ([M] kütle, [L] uzunluk, [T] zaman) denetler ve sonucu %2 toleransla matematiksel olarak doğrular.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/60 p-4 text-[12.5px]">
              <div className="flex items-center gap-2 text-red-400">
                <X size={14} />
                <span>Standart Model: 0.5 × 2 × 10² = 999 J (Kör Kabul)</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-emerald-400">
                <Check size={14} />
                <span>Physicsmn: mathjs Denetimi → 100.00 J [M·L²·T⁻²] ✓ Onaylandı</span>
              </div>
            </div>
          </div>

          {/* Difference 2 */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 backdrop-blur-md transition-all hover:border-white/20">
            <div>
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#8052ff]">
                <RefreshCw size={22} />
              </div>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-white/40">
                Pillar 02
              </span>
              <h3 className="mt-1 font-display text-[22px] font-normal text-white">
                Otonom Öz-Düzeltme (Self-Correction) Döngüsü
              </h3>
              <p className="mt-3 text-[14.5px] font-light leading-[1.65] text-[#A1A1AA]">
                Standart bir arayüz ilk üretilen cevabı öğrenciye doğrudan gösterir; hata varsa fark edilmez. Physicsmn ise hata kesici devreye (circuit breaker) sahiptir: mathjs denetiminde birim veya hesaplama uyumsuzluğu tespit edildiğinde, sistem öğrenciye göstermeden önce hatanın tam nedenini modele geri besleyerek düzeltilmiş tam çözümü otonom olarak tekrar türetir.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/60 p-4 text-[12.5px]">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle size={14} />
                <span>Denetim: &quot;%90 sapma (999 J vs 100 J). Aritmetiği düzeltin.&quot;</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-emerald-400">
                <Check size={14} />
                <span>Döngü: 2. geçişte otomatik onarıldı → mathVerified: true</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Interactive Neuro-Symbolic Circuit-Breaker Visualizer */}
        <div className="mt-12">
          <CircuitBreakerDemo />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Difference 3 */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 backdrop-blur-md transition-all hover:border-white/20">
            <div>
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#2E8BFF]">
                <Layers size={22} />
              </div>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-white/40">
                Pillar 03
              </span>
              <h3 className="mt-1 font-display text-[22px] font-normal text-white">
                Çok Sorulu MEB Sayfalarını Ayrıştırma
              </h3>
              <p className="mt-3 text-[14.5px] font-light leading-[1.65] text-[#A1A1AA]">
                Gerçek test sayfaları genellikle 5 ila 7 soru içerir. Standart yapay zekalar sayfayı tek bir metin yığını olarak okuyarak soruları birbirine karıştırır veya yarıda kesilir. Physicsmn, sayfadaki tüm soruları bağımsız nesneler olarak tespit eder; her birini sekmelere (Soru 1, Soru 2...) ayırır ve her soru için bağımsız doğrulama rozeti üretir.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/60 p-4 text-[12.5px]">
              <div className="flex items-center gap-2 text-white/80">
                <FileCheck2 size={14} className="text-[#2E8BFF]" />
                <span>Test Sayfası → Soru 1, Soru 2, Soru 3... bağımsız sekmeler</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-emerald-400">
                <Check size={14} />
                <span>Her soru için ayrı &quot;mathVerified: true&quot; rozeti</span>
              </div>
            </div>
          </div>

          {/* Difference 4 */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 backdrop-blur-md transition-all hover:border-white/20">
            <div>
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#E5C158]">
                <ShieldCheck size={22} />
              </div>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-white/40">
                Pillar 04
              </span>
              <h3 className="mt-1 font-display text-[22px] font-normal text-white">
                MEB Müfredat Uyumu ve Yerel Gizlilik
              </h3>
              <p className="mt-3 text-[14.5px] font-light leading-[1.65] text-[#A1A1AA]">
                Genel yapay zekalar lise öğrencilerine üniversite kalkülüsü (türev/integral), emperyal birimler veya yabancı kabuller sunar. Physicsmn ise MEB 9–12. sınıf müfredatına sadıktır (g = 10 m/s², sin 37° = 0.6, trigonometri ve vektörler). Ayrıca öğrenci verileri merkezi veritabanlarında saklanmaz; çözüm geçmişi yalnızca cihazınızın localStorage belleğinde kalır.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/60 p-4 text-[12.5px]">
              <div className="flex items-center gap-2 text-white/80">
                <Lock size={14} className="text-[#E5C158]" />
                <span>localStorage Tarihçesi · Sıfır Sunucu Kaydı</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-emerald-400">
                <Check size={14} />
                <span>g = 10 m/s², sin 37° = 0,6 tam MEB standartları</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive MEB Vector & Angle Canvas */}
        <div className="mt-12">
          <VectorPlayground />
        </div>
      </section>

      {/* Side-by-Side Comparison Matrix */}
      <section className="border-t border-white/[0.06] bg-white/[0.01] px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="text-[12px] font-medium uppercase tracking-[0.2em] text-white/50">
              02 // KARŞILAŞTIRMA MATRİSİ
            </span>
            <h2 className="mt-2 font-display text-[28px] font-light tracking-[-0.02em] text-white sm:text-[34px]">
              Physicsmn ile Standart Yapay Zeka Karşılaştırması
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-black/60 backdrop-blur-md">
            <table className="w-full text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11.5px] uppercase tracking-wider text-white/60">
                  <th className="px-6 py-4">Özellik / Yetenek</th>
                  <th className="px-6 py-4 text-white/40">Standart Yapay Zeka (ChatGPT / Gemini)</th>
                  <th className="px-6 py-4 text-emerald-400 font-semibold">Physicsmn (Nöro-Sembolik)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] font-light">
                <tr>
                  <td className="px-6 py-4 font-medium text-white">Sayısal Doğrulama</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">Olasılıksal tahmin; sık aritmetik hata</td>
                  <td className="px-6 py-4 text-emerald-300 font-medium">mathjs ile ±%2 kesin sayısal denetim</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-white">SI Birim ve Boyut Analizi</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">Yüzeysel metin kontrolü; birim çelişkilerini atlar</td>
                  <td className="px-6 py-4 text-emerald-300 font-medium">[M]ᵃ[L]ᵇ[T]ᶜ temel SI boyut eşitliği doğrulaması</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-white">Otonom Öz-Düzeltme (Self-Correction)</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">Yok; ilk üretilen yanlış cevap sunulur</td>
                  <td className="px-6 py-4 text-emerald-300 font-medium">Denetim hatası modele bildirilerek otomatik onarım</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-white">Çok Sorulu Test Sayfası Desteği</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">Tek parça metin; soruları atlar veya karıştırır</td>
                  <td className="px-6 py-4 text-emerald-300 font-medium">Her soru için bağımsız sekme ve çözüm ayrıştırma</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-white">MEB Lise Müfredat Uyumu</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">Üniversite kalkülüsü ve yabancı sabitler</td>
                  <td className="px-6 py-4 text-emerald-300 font-medium">9–12. sınıf MEB formülleri ve kabul standartları</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-white">Kuvvet Diyagramı Görselleştirmesi</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">Görsel çizim üretmez (yalnızca metin)</td>
                  <td className="px-6 py-4 text-emerald-300 font-medium">Etkileşimli SVG serbest cisim diyagramı</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-white">Öğrenci Gizliliği</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">Sorular sunucu veritabanlarında saklanır ve eğitilir</td>
                  <td className="px-6 py-4 text-emerald-300 font-medium">Yalnızca cihazınızın localStorage belleği; sıfır takip</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Honest Scientific Limitations Section */}
      <section className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 text-left backdrop-blur-md">
          <div className="flex items-center gap-2.5 text-[12px] font-medium uppercase tracking-wider text-[#E5C158]">
            <Scale size={16} />
            <span>Bilimsel Dürüstlük ve Sınırlarımız</span>
          </div>
          <h3 className="mt-3 font-display text-[20px] font-normal text-white">
            &quot;%100 Kusursuz&quot; İddiasında Bulunmuyoruz.
          </h3>
          <p className="mt-3 text-[14.5px] font-light leading-[1.65] text-[#A1A1AA]">
            Yapay zeka sistemleri için &quot;asla hata yapmaz&quot; demek bilimsel olarak gerçekçi değildir. Eğer öğrencinin yüklediği fotoğraf aşırı bulanıksa veya küçük bir indis görme modeli (Vision OCR) tarafından yanlış okunursa, başlangıç verisi hatalı olabilir. Physicsmn&apos;in garanti ettiği şey şudur: Bir çözüm &quot;mathVerified: true&quot; rozetine sahipse, formülün cebirsel tutarlılığı, SI temel birim eşitliği ve sayısal hesaplaması mathjs tarafından deterministik olarak doğrulanmıştır.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 border-t border-white/[0.08] pt-6 text-[12px]">
            <Link
              href="/docs#benchmark"
              className="inline-flex items-center gap-1.5 text-white underline underline-offset-4 transition-colors hover:text-[#E5C158]"
            >
              <span>57 Soruluk MEB Kıyaslama Raporunu İncele</span>
              <ArrowRight size={13} />
            </Link>
            <Link
              href="/docs#tests"
              className="inline-flex items-center gap-1.5 text-white/60 transition-colors hover:text-white"
            >
              <span>Hata Enjeksiyon Testleri</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="border-t border-white/[0.08] px-6 py-16 text-center sm:px-10">
        <h2 className="font-display text-[26px] font-light text-white sm:text-[32px]">
          Fizik Probleminizi Şimdi Denetleyin.
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-[15px] font-light text-white/60">
          Bir soru yazın veya ödev sayfanızın fotoğrafını yükleyin. Adım adım MEB türetimini inceleyin.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/solve"
            className="rounded-full bg-white px-7 py-3 text-[13.5px] font-medium text-black transition-all hover:bg-neutral-200 active:scale-[0.98]"
          >
            Çözücüyü Başlat
          </Link>
          <Link
            href="/docs"
            className="rounded-full border border-white/20 bg-white/[0.04] px-6 py-3 text-[13.5px] font-medium text-white/80 backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/[0.1] hover:text-white"
          >
            Teknik Belgeler
          </Link>
        </div>
      </footer>
    </div>
  );
}
