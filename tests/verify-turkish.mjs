import fs from 'fs';

const trContent = fs.readFileSync('src/i18n/tr.ts', 'utf-8');
const enContent = fs.readFileSync('src/i18n/en.ts', 'utf-8');

const turkishDiacritics = ['ğ', 'ü', 'ş', 'ı', 'İ', 'ö', 'ç', 'Ğ', 'Ü', 'Ş', 'Ö', 'Ç'];

console.log('=== TURKISH DIACRITICS AUDIT ===');
for (const char of turkishDiacritics) {
  const count = (trContent.match(new RegExp(char, 'g')) || []).length;
  console.log(`Character '${char}' (U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}): ${count} occurrences`);
}

// Check for missing / corrupted characters like '?' or ''
const corruptMatch = trContent.match(/[\uFFFD]/g);
console.log('Corrupted replacement characters (U+FFFD):', corruptMatch ? corruptMatch.length : 0);
