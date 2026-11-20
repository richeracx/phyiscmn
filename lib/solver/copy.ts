import type { SolverErrorCode } from './errors';
import type { Stage } from './schema';

export interface SolverCopy {
  kicker: string;
  title: string;
  subtitle: string;
  placeholder: string;
  characters: (used: number, max: number) => string;
  addPhoto: string;
  replacePhoto: string;
  removePhoto: string;
  photoHint: string;
  dropHere: string;
  preparingPhoto: string;
  photoAlt: string;
  solve: string;
  shortcut: string;
  cancel: string;
  examplesLabel: string;
  examples: ReadonlyArray<{ label: string; problem: string }>;
  back: string;
  newProblem: string;
  edit: string;
  stages: Record<Stage, { title: string; detail: string }>;
  elapsed: (seconds: number) => string;
  grade: (grade: number) => string;
  sections: {
    problem: string;
    given: string;
    find: string;
    assumptions: string;
    principles: string;
    solution: string;
    step: (n: number) => string;
    result: string;
    choice: string;
    check: string;
    diagram: string;
    mathVerifiedBadge: string;
  };
  disclaimer: string;
  retry: string;
  retryIn: (seconds: number) => string;
  history: {
    button: string;
    title: string;
    empty: string;
    emptyDetail: string;
    clearAll: string;
    clearConfirm: string;
    questionsCount: (n: number) => string;
    justNow: string;
    minutesAgo: (m: number) => string;
    hoursAgo: (h: number) => string;
    daysAgo: (d: number) => string;
    restore: string;
    delete: string;
    verified: string;
  };
  errors: Record<SolverErrorCode, { title: string; body: string }>;
}

export const solverCopy: Record<'en' | 'tr', SolverCopy> = {
  en: {
    kicker: 'Physicsmn · Solver',
    title: 'Write it down, or photograph it.',
    subtitle:
      'Solved the way the MEB high-school curriculum teaches it: givens, the governing law, every step with units, and a final check.',
    placeholder: 'Type the problem exactly as written, including any answer options…',
    characters: (used, max) => `${used.toLocaleString('en')} / ${max.toLocaleString('en')}`,
    addPhoto: 'Add photo',
    replacePhoto: 'Replace',
    removePhoto: 'Remove photo',
    photoHint: 'JPG, PNG or WebP · drop or paste',
    dropHere: 'Drop the photo to attach it',
    preparingPhoto: 'Preparing photo…',
    photoAlt: 'Attached problem photo',
    solve: 'Solve',
    shortcut: 'Ctrl + Enter',
    cancel: 'Cancel',
    examplesLabel: 'Try one',
    examples: [
      {
        label: 'Force at an angle',
        problem:
          'A 2 kg block on a horizontal floor is pulled by a 20 N force at 37° above the horizontal. The coefficient of kinetic friction is 0.5. Find the acceleration of the block. (g = 10 m/s², sin 37° = 0.6, cos 37° = 0.8)',
      },
      {
        label: 'Horizontal throw',
        problem:
          'A ball is thrown horizontally at 20 m/s from the top of a 45 m tall building. How long does it take to reach the ground, and how far from the building does it land? (g = 10 m/s²)',
      },
      {
        label: 'Parallel resistors',
        problem: 'Resistors of 6 Ω and 3 Ω are connected in parallel across a 12 V battery. Find the current drawn from the battery.',
      },
    ],
    back: 'Back to the cosmos',
    newProblem: 'New problem',
    edit: 'Edit problem',
    stages: {
      read: { title: 'Reading the problem', detail: 'Givens, unknowns and units' },
      laws: { title: 'Choosing the laws', detail: 'Matching the MEB unit and principle' },
      derive: { title: 'Deriving', detail: 'Step by step, units carried throughout' },
      verify: { title: 'Verifying', detail: 'Units, arithmetic and every equation' },
    },
    elapsed: (s) => `${s}s`,
    grade: (g) => `Grade ${g}`,
    sections: {
      problem: 'Problem',
      given: 'Given',
      find: 'Find',
      assumptions: 'Assumptions',
      principles: 'Governing laws',
      solution: 'Solution',
      step: (n) => `Step ${String(n).padStart(2, '0')}`,
      result: 'Result',
      choice: 'Correct option',
      check: 'Check',
      diagram: 'Free-body diagram',
      mathVerifiedBadge: 'Numerically & Unit Audited via mathjs',
    },
    disclaimer: 'Physicsmn can make mistakes. Follow each step and check it against your notes.',
    retry: 'Try again',
    retryIn: (s) => `Try again in ${s}s`,
    history: {
      button: 'History',
      title: 'Solution Vault',
      empty: 'No solved problems yet',
      emptyDetail: 'Problems you solve will automatically be saved here on your device.',
      clearAll: 'Clear All',
      clearConfirm: 'Are you sure you want to clear your solution history?',
      questionsCount: (n) => `${n} ${n === 1 ? 'question' : 'questions'}`,
      justNow: 'Just now',
      minutesAgo: (m) => `${m}m ago`,
      hoursAgo: (h) => `${h}h ago`,
      daysAgo: (d) => `${d}d ago`,
      restore: 'Open solution',
      delete: 'Delete',
      verified: 'mathjs Verified',
    },
    errors: {
      empty_input: { title: 'Nothing to solve yet', body: 'Type the problem or attach a photo of it.' },
      text_too_long: { title: 'The problem is too long', body: 'Keep the text under 4,000 characters, or attach a photo instead.' },
      image_too_large: { title: 'The photo is too large', body: 'Use a photo under 4 MB. A closer, cropped shot of the problem works best.' },
      image_type: { title: 'This file can’t be used', body: 'Attach a JPG, PNG or WebP photo. Screenshots work too.' },
      request_too_large: { title: 'The upload is too large', body: 'Send a smaller photo or shorten the text.' },
      bad_request: { title: 'The request was malformed', body: 'Reload the page and try again.' },
      forbidden: { title: 'Request blocked', body: 'The solver only accepts requests from this site. Reload the page and try again.' },
      rate_limited: { title: 'Daily limit reached', body: 'You’ve reached the limit of 20 derivations per day. Please return tomorrow.' },
      not_physics: { title: 'This doesn’t look like a physics problem', body: 'Physicsmn solves MEB lise physics problems.' },
      unreadable: { title: 'The photo couldn’t be read reliably', body: 'Retake it in good light, straight on, with the whole problem in frame.' },
      insufficient_data: { title: 'Some information is missing', body: 'The problem doesn’t give enough data for a single answer. Check that nothing was cut off.' },
      model_busy: { title: 'The solver is busy', body: 'The AI service is under heavy load. Wait a moment and try again.' },
      model_timeout: { title: 'This took too long', body: 'The solution didn’t finish in time. Try again; shorter problems finish faster.' },
      model_blocked: { title: 'This request can’t be answered', body: 'The content was declined by the AI service’s safety filters.' },
      model_output: { title: 'The solution didn’t pass verification', body: 'Physicsmn rejected an answer that was incomplete or contained invalid equations. Try again.' },
      not_configured: { title: 'The solver is offline', body: 'The service isn’t configured yet. Please try again later.' },
      network: { title: 'Connection lost', body: 'Check your internet connection and try again.' },
      internal: { title: 'Something went wrong', body: 'An unexpected error occurred on our side. Try again.' },
    },
  },
  tr: {
    kicker: 'Physicsmn · Çözücü',
    title: 'Yaz ya da fotoğrafını çek.',
    subtitle:
      'MEB lise programının öğrettiği şekilde çözülür: verilenler, kullanılan yasa, birimleriyle her adım ve son kontrol.',
    placeholder: 'Problemi seçenekleriyle birlikte yazıldığı gibi gir…',
    characters: (used, max) => `${used.toLocaleString('tr')} / ${max.toLocaleString('tr')}`,
    addPhoto: 'Fotoğraf ekle',
    replacePhoto: 'Değiştir',
    removePhoto: 'Fotoğrafı kaldır',
    photoHint: 'JPG, PNG, WebP · sürükle ya da yapıştır',
    dropHere: 'Eklemek için fotoğrafı bırak',
    preparingPhoto: 'Fotoğraf hazırlanıyor…',
    photoAlt: 'Eklenen problem fotoğrafı',
    solve: 'Çöz',
    shortcut: 'Ctrl + Enter',
    cancel: 'İptal',
    examplesLabel: 'Örnek dene',
    examples: [
      {
        label: 'Eğik kuvvet',
        problem:
          'Yatay zemindeki 2 kg kütleli bir cisim, yatayla 37° açı yapan 20 N büyüklüğündeki kuvvetle çekiliyor. Kinetik sürtünme katsayısı 0,5 olduğuna göre cismin ivmesi kaç m/s² olur? (g = 10 m/s², sin 37° = 0,6, cos 37° = 0,8)',
      },
      {
        label: 'Yatay atış',
        problem:
          '45 m yüksekliğindeki bir binanın tepesinden 20 m/s hızla yatay olarak atılan top kaç saniyede yere düşer ve binadan ne kadar uzağa düşer? (g = 10 m/s²)',
      },
      {
        label: 'Paralel dirençler',
        problem: '6 Ω ve 3 Ω’luk dirençler 12 V’luk bir üretece paralel bağlanıyor. Üreteçten çekilen akım kaç amperdir?',
      },
    ],
    back: 'Kozmosa dön',
    newProblem: 'Yeni problem',
    edit: 'Problemi düzenle',
    stages: {
      read: { title: 'Problem okunuyor', detail: 'Verilenler, istenenler ve birimler' },
      laws: { title: 'Yasalar seçiliyor', detail: 'MEB ünitesi ve ilkesi eşleştiriliyor' },
      derive: { title: 'Çözülüyor', detail: 'Adım adım, formüllerle hesaplanıyor' },
      verify: { title: 'Doğrulanıyor', detail: 'Birimler, işlemler ve her denklem' },
    },
    elapsed: (s) => `${s} sn`,
    grade: (g) => `${g}. Sınıf`,
    sections: {
      problem: 'Problem',
      given: 'Verilenler',
      find: 'İstenenler',
      assumptions: 'Kabuller',
      principles: 'Kullanılan yasalar',
      solution: 'Çözüm',
      step: (n) => `Adım ${String(n).padStart(2, '0')}`,
      result: 'Sonuç',
      choice: 'Doğru seçenek',
      check: 'Kontrol',
      diagram: 'Serbest cisim diyagramı',
      mathVerifiedBadge: 'Sayısal ve Birim Doğrulaması Yapıldı (mathjs)',
    },
    disclaimer: 'Physicsmn hata yapabilir. Her adımı takip et ve notlarınla karşılaştır.',
    retry: 'Tekrar dene',
    retryIn: (s) => `${s} sn sonra tekrar dene`,
    history: {
      button: 'Geçmiş',
      title: 'Çözüm Geçmişi',
      empty: 'Henüz çözülmüş soru yok',
      emptyDetail: 'Çözdüğünüz sorular otomatik olarak bu cihazda güvenle saklanır.',
      clearAll: 'Tümünü Temizle',
      clearConfirm: 'Tüm soru geçmişini silmek istediğinize emin misiniz?',
      questionsCount: (n) => `${n} Soru`,
      justNow: 'Az önce',
      minutesAgo: (m) => `${m} dk önce`,
      hoursAgo: (h) => `${h} sa önce`,
      daysAgo: (d) => `${d} gün önce`,
      restore: 'Çözümü Aç',
      delete: 'Sil',
      verified: 'mathjs Doğrulandı',
    },
    errors: {
      empty_input: { title: 'Henüz çözülecek bir şey yok', body: 'Problemi yaz ya da fotoğrafını ekle.' },
      text_too_long: { title: 'Problem metni çok uzun', body: 'Metni 4.000 karakterin altında tut ya da fotoğraf ekle.' },
      image_too_large: { title: 'Fotoğraf çok büyük', body: '4 MB’tan küçük bir fotoğraf kullan. Probleme yakın, kırpılmış bir çekim en iyisidir.' },
      image_type: { title: 'Bu dosya kullanılamıyor', body: 'JPG, PNG veya WebP bir fotoğraf ekle. Ekran görüntüleri de olur.' },
      request_too_large: { title: 'Yükleme çok büyük', body: 'Daha küçük bir fotoğraf gönder ya da metni kısalt.' },
      bad_request: { title: 'İstek hatalı', body: 'Sayfayı yenileyip tekrar dene.' },
      forbidden: { title: 'İstek engellendi', body: 'Çözücü yalnızca bu siteden gelen istekleri kabul eder. Sayfayı yenileyip tekrar dene.' },
      rate_limited: { title: 'Günlük limit doldu', body: 'Günde en fazla 20 fizik sorusu çözebilirsiniz. Lütfen yarın tekrar deneyin.' },
      not_physics: { title: 'Bu bir fizik problemi gibi görünmüyor', body: 'Physicsmn, MEB lise fizik problemlerini çözer.' },
      unreadable: { title: 'Fotoğraf güvenilir şekilde okunamadı', body: 'İyi ışıkta, karşıdan ve problemin tamamı görünecek şekilde yeniden çek.' },
      insufficient_data: { title: 'Bazı bilgiler eksik', body: 'Problem tek bir cevap için yeterli veri içermiyor. Kesilen bir kısım olmadığından emin ol.' },
      model_busy: { title: 'Çözücü şu an yoğun', body: 'Yapay zekâ hizmeti yoğun. Biraz bekleyip tekrar dene.' },
      model_timeout: { title: 'Çözüm çok uzun sürdü', body: 'Çözüm zamanında tamamlanamadı. Tekrar dene; kısa problemler daha hızlı biter.' },
      model_blocked: { title: 'Bu istek yanıtlanamıyor', body: 'İçerik, yapay zekâ hizmetinin güvenlik filtrelerince reddedildi.' },
      model_output: { title: 'Çözüm doğrulamadan geçemedi', body: 'Physicsmn eksik ya da geçersiz denklem içeren bir cevabı reddetti. Tekrar dene.' },
      not_configured: { title: 'Çözücü çevrim dışı', body: 'Hizmet henüz yapılandırılmadı. Lütfen daha sonra tekrar dene.' },
      network: { title: 'Bağlantı koptu', body: 'İnternet bağlantını kontrol edip tekrar dene.' },
      internal: { title: 'Bir şeyler ters gitti', body: 'Bizim tarafımızda beklenmeyen bir hata oluştu. Tekrar dene.' },
    },
  },
};
