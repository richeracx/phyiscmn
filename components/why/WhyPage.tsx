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
            <span>Tahmin Değil, Gerçek Matematik ve Fizik</span>
          </div>

          <h1 className="font-display text-[clamp(2.5rem,5.5vw,4.5rem)] font-light leading-[1.04] tracking-[-0.03em] text-white">
            Fizik tahmin edilemez, <br className="hidden sm:inline" />
            <span className="text-white/60">hesaplanır ve doğrulanır.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-[16.5px] font-light leading-[1.65] text-[#A1A1AA] sm:text-[18.5px]">
            Standart yapay zekalar (ChatGPT, Gemini) bir hesap makinesi değildir; sadece kelimeleri tahmin ederler ve basit işlemlerde bile hata yapabilirler. Physicsmn ise soruyu anladıktan sonra tüm hesaplamaları bağımsız matematik motorumuz <strong>mathjs</strong> ile gerçek bir hesap makinesi gibi baştan sona kontrol eder.
          </p>

          {/* Interactive ASCII Physics Canvas */}
          <div className="mt-10">
            <AsciiCosmos height={240} />
          </div>

          {/* Key Metric Pills (Plain Human Explanations) */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center backdrop-blur-sm">
              <div className="font-display text-[26px] font-medium text-white sm:text-[30px]">94.7%</div>
              <div className="mt-1 text-[12px] font-light text-white/60">
                MEB Testlerinde Doğruluk
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center backdrop-blur-sm">
              <div className="font-display text-[26px] font-medium text-[#10B981] sm:text-[30px]">mathjs</div>
              <div className="mt-1 text-[12px] font-light text-white/60">
                Bağımsız Matematik Motoru
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center backdrop-blur-sm">
              <div className="font-display text-[26px] font-medium text-[#E5C158] sm:text-[30px]">
                SI Birimleri
              </div>
              <div className="mt-1 text-[12px] font-light text-white/60">
                Joule, Newton, Metre Uyumu
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center backdrop-blur-sm">
              <div className="font-display text-[26px] font-medium text-white sm:text-[30px]">100%</div>
              <div className="mt-1 text-[12px] font-light text-white/60">
                Gizlilik (Verileriniz Kaydedilmez)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Section */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10">
        <div className="mb-14 text-center">
          <span className="text-[12px] font-medium uppercase tracking-[0.2em] text-white/50">
            01 // NEDEN FARKLIYIZ?
          </span>
          <h2 className="mt-2 font-display text-[30px] font-light tracking-[-0.02em] text-white sm:text-[38px]">
            Dört Temel Fark: Neden Yanlış Cevap Vermiyoruz?
          </h2>
          <p className="mt-3 text-[16px] font-light text-white/60 max-w-2xl mx-auto">
            Sıradan bir sohbet botu ile fizik soruları için özel olarak matematik motoruyla güçlendirilmiş bir sistem arasındaki farklar.
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
                Fark 01
              </span>
              <h3 className="mt-1 font-display text-[22px] font-normal text-white">
                Kelimeleri Tahmin Etmek Yerine mathjs ile Gerçek Hesap
              </h3>
              <p className="mt-3 text-[14.5px] font-light leading-[1.65] text-[#A1A1AA]">
                Standart yapay zekalar hesap makinesi değildir; sadece kelimelerin devamını tahmin ederler. Bu yüzden basit bir çarpma veya kare alma işleminde bile saçma sonuçlar yazabilirler. Physicsmn ise formüldeki tüm sayıları ve SI birimlerini (metre, saniye, joule) bağımsız matematik motorumuz <strong>mathjs</strong>&apos;e aktarır ve işlemi gerçek bir hesap makinesi gibi kesin olarak çözer.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/60 p-4 text-[12.5px]">
              <div className="flex items-center gap-2 text-red-400">
                <X size={14} />
                <span>Standart Yapay Zeka: 0.5 × 2 × 10² = 999 J (İşlem Hatası Fark Edilmedi)</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-emerald-400">
                <Check size={14} />
                <span>Physicsmn: mathjs ile Hesaplandı → 100.00 J (Joule Birimi Onaylandı) ✓</span>
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
                Fark 02
              </span>
              <h3 className="mt-1 font-display text-[22px] font-normal text-white">
                Otomatik Hata Düzeltme Mekanizması
              </h3>
              <p className="mt-3 text-[14.5px] font-light leading-[1.65] text-[#A1A1AA]">
                Normal bir sohbette yapay zeka işlem hatası yapsa bile bunu fark edemez ve yanlış cevabı doğrudan karşınıza çıkarır. Physicsmn ise akıllı bir hata yakalama devresine sahiptir: mathjs motorumuz hesapta veya birimlerde en ufak bir uyumsuzluk bulursa, sistem siz daha cevabı görmeden hatayı anında yapay zekaya bildirir ve soruyu baştan çözerek hatasız tam sonucu sunar.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/60 p-4 text-[12.5px]">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle size={14} />
                <span>mathjs Uyarısı: &quot;Çarpma sonucu 100 J olmalı, yazılan 999 J hatalı.&quot;</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-emerald-400">
                <Check size={14} />
                <span>Sonuç: Sistem siz görmeden hatayı fark etti ve 100 J olarak düzeltti ✓</span>
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
                Fark 03
              </span>
              <h3 className="mt-1 font-display text-[22px] font-normal text-white">
                Çok Sorulu Test Sayfalarını Tek Tek Ayırma
              </h3>
              <p className="mt-3 text-[14.5px] font-light leading-[1.65] text-[#A1A1AA]">
                Okulda çözdüğünüz test sayfalarında genellikle 5 ila 7 soru bir arada bulunur. Standart yapay zekalar sayfayı tek bir metin yığını gibi okuyup soruları birbirine karıştırabilir ya da yarım bırakabilir. Physicsmn, sayfadaki her soruyu tek tek bağımsız olarak tespit eder; &quot;Soru 1&quot;, &quot;Soru 2&quot; şeklinde sekmelere ayırır ve her soru için ayrı bir onay rozeti verir.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/60 p-4 text-[12.5px]">
              <div className="flex items-center gap-2 text-white/80">
                <FileCheck2 size={14} className="text-[#2E8BFF]" />
                <span>Test Sayfası → Soru 1, Soru 2, Soru 3... bağımsız sekmeler</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-emerald-400">
                <Check size={14} />
                <span>Her soru için ayrı onay rozeti ve adım adım çözüm</span>
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
                Fark 04
              </span>
              <h3 className="mt-1 font-display text-[22px] font-normal text-white">
                MEB Müfredatına Tam Uyum ve Tam Gizlilik
              </h3>
              <p className="mt-3 text-[14.5px] font-light leading-[1.65] text-[#A1A1AA]">
                Genel yapay zekalar lise öğrencilerine üniversite düzeyinde karmaşık formüller veya müfredat dışı kabuller sunabilir. Physicsmn ise 9–12. sınıf MEB lise fizik müfredatına sadıktır (yerçekimi ivmesi g = 10 m/s², sin 37° = 0.6 gibi MEB sınav kuralları). Ayrıca sorularınız veya fotoğraflarınız sunucularda depolanmaz; çözümleriniz yalnızca kendi cihazınızda kalır.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-white/[0.06] bg-black/60 p-4 text-[12.5px]">
              <div className="flex items-center gap-2 text-white/80">
                <Lock size={14} className="text-[#E5C158]" />
                <span>Tam Gizlilik · Sorularınız sunucularda kaydedilmez</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-emerald-400">
                <Check size={14} />
                <span>g = 10 m/s², sin 37° = 0,6 tam MEB lise sınav standartları</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Side-by-Side Comparison Matrix */}
      <section className="border-t border-white/[0.06] bg-white/[0.01] px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="text-[12px] font-medium uppercase tracking-[0.2em] text-white/50">
              02 // KARŞILAŞTIRMA TABLOSU
            </span>
            <h2 className="mt-2 font-display text-[28px] font-light tracking-[-0.02em] text-white sm:text-[34px]">
              Physicsmn ile Standart Yapay Zeka Karşılaştırması
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-black/60 backdrop-blur-md">
            <table className="w-full text-left text-[13.5px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11.5px] uppercase tracking-wider text-white/60">
                  <th className="px-6 py-4">Özellik</th>
                  <th className="px-6 py-4 text-white/40">Standart Yapay Zeka (ChatGPT / Gemini)</th>
                  <th className="px-6 py-4 text-emerald-400 font-semibold">Physicsmn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] font-light">
                <tr>
                  <td className="px-6 py-4 font-medium text-white">Matematiksel Hesaplama</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">Kelimeleri tahmin eder; sık işlem hatası yapar</td>
                  <td className="px-6 py-4 text-emerald-300 font-medium">mathjs matematik motoru ile her işlem baştan sona hesaplanır</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-white">Fizik Birimleri (SI)</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">Yüzeysel metin kontrolü; birim çelişkilerini atlar</td>
                  <td className="px-6 py-4 text-emerald-300 font-medium">SI fizik birimlerinin (joule, newton, metre) tam uyumunu denetler</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-white">Otomatik Hata Düzeltme</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">Yok; ilk çıkan yanlış cevabı doğrudan gösterir</td>
                  <td className="px-6 py-4 text-emerald-300 font-medium">mathjs bir hata bulursa siz görmeden önce otomatik düzeltir</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-white">Çok Sorulu Test Sayfaları</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">Soruları birbirine karıştırır veya yarıda kesilir</td>
                  <td className="px-6 py-4 text-emerald-300 font-medium">Her soruyu ayrı sekmede (Soru 1, Soru 2...) bağımsız çözer</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-white">MEB Müfredat Uyumu</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">Üniversite formülleri ve yabancı sabitler kullanabilir</td>
                  <td className="px-6 py-4 text-emerald-300 font-medium">9–12. sınıf MEB lise formülleri ve sınav kabulleri</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-white">Çözüm Anlatımı</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">Tek parça metin anlatımı</td>
                  <td className="px-6 py-4 text-emerald-300 font-medium">Adım adım formüller ve açıklamalı basamaklar</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-white">Gizlilik ve Güvenlik</td>
                  <td className="px-6 py-4 text-[#A1A1AA]">Sorularınız sunucu veri tabanlarında kaydedilebilir</td>
                  <td className="px-6 py-4 text-emerald-300 font-medium">Hiçbir kayıt tutulmaz; çözümler sadece cihazınızda kalır</td>
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
            <span>Dürüstlük ve Netlik İlkesi</span>
          </div>
          <h3 className="mt-3 font-display text-[20px] font-normal text-white">
            Neden Soruların Net Çekilmesi Önemlidir?
          </h3>
          <p className="mt-3 text-[14.5px] font-light leading-[1.65] text-[#A1A1AA]">
            Yapay zekanın bir problemi doğru çözebilmesi için fotoğrafın net okunabilmesi şarttır. Eğer yüklenen fotoğraf çok bulanıksa veya küçük bir sayı (örneğin 3 ile 8) silik çıkmışsa, yapay zeka soruyu yanlış okuyabilir. Bizim güvencemiz şudur: Sorudaki sayılar doğru okunduğu andan itibaren, <strong>mathjs</strong> matematik motorumuz sayesinde hiçbir işlem hatası yapılmaz ve çözüm adım adım doğrulanır.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 border-t border-white/[0.08] pt-6 text-[12px]">
            <Link
              href="/docs#benchmark"
              className="inline-flex items-center gap-1.5 text-white underline underline-offset-4 transition-colors hover:text-[#E5C158]"
            >
              <span>57 Soruluk MEB Başarı Raporunu İncele</span>
              <ArrowRight size={13} />
            </Link>
            <Link
              href="/docs#tests"
              className="inline-flex items-center gap-1.5 text-white/60 transition-colors hover:text-white"
            >
              <span>Örnek Doğrulama Testleri</span>
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
