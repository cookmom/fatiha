// بسم الله الرحمن الرحيم
// Compute visual DNA for all 114 surahs from Quran text API
// Output: surah-data.json — generative art parameters per surah

const fs = require('fs');

const API_BASE = 'https://api.alquran.cloud/v1';

// Arabic letter set for frequency analysis
const ARABIC_LETTERS = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي';

async function fetchJSON(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${url}`);
  return resp.json();
}

async function computeSurahData(surahNum) {
  // Fetch surah text (Arabic, Uthmani script)
  const data = await fetchJSON(`${API_BASE}/surah/${surahNum}/quran-uthmani`);
  const surah = data.data;
  
  const result = {
    number: surah.number,
    name: surah.name,           // Arabic name
    englishName: surah.englishName,
    englishNameTranslation: surah.englishNameTranslation,
    revelationType: surah.revelationType, // Meccan or Medinan
    numberOfAyahs: surah.numberOfAyahs,
    
    // ============================================================
    // 1. RHYTHM SIGNATURE — verse lengths as waveform
    // ============================================================
    verseLengths: [],       // word count per verse
    verseCharLengths: [],   // character count per verse
    rhythmWaveform: [],     // normalized 0..1
    rhythmEnergy: 0,        // variance of verse lengths (high = dynamic)
    rhythmBalance: 0,       // symmetry score
    
    // ============================================================
    // 2. LETTER FREQUENCY SPECTRUM — unique fingerprint
    // ============================================================
    letterFrequency: {},    // count per Arabic letter
    letterSpectrum: [],     // normalized frequency array (28 values)
    dominantLetters: [],    // top 5 letters
    rareLetter: '',         // least used letter
    
    // ============================================================
    // 3. TEMPERATURE — Meccan/Medinan + chronological position
    // ============================================================
    temperature: 0,         // 0 (cool/Medinan) to 1 (hot/early Meccan)
    
    // ============================================================
    // 4. STRUCTURAL SYMMETRY — ring composition score
    // ============================================================
    symmetryScore: 0,       // -1 to 1 (correlation of first/second half)
    pivotVerse: 0,          // center verse index
    
    // ============================================================
    // 5. GEOMETRIC SYSTEM — derived from verse count
    // ============================================================
    geometryFold: 0,        // suggested n-fold symmetry
    geometryType: '',       // description
    
    // ============================================================
    // 6. BREATH PATTERN — verse duration curve
    // ============================================================
    breathCurve: [],        // 0..1 per verse (word count / max)
    totalWords: 0,
    totalLetters: 0,
    
    // ============================================================
    // 7. DENSITY — words per verse average + variance
    // ============================================================
    avgWordsPerVerse: 0,
    densityVariance: 0,
  };
  
  // Process each verse
  let totalWords = 0;
  let totalLetters = 0;
  const letterCounts = {};
  ARABIC_LETTERS.split('').forEach(l => letterCounts[l] = 0);
  
  for (const ayah of surah.ayahs) {
    const text = ayah.text;
    
    // Word count (split on whitespace)
    const words = text.trim().split(/\s+/);
    const wordCount = words.length;
    result.verseLengths.push(wordCount);
    result.verseCharLengths.push(text.length);
    totalWords += wordCount;
    
    // Letter frequency
    for (const char of text) {
      // Normalize: remove diacritics for base letter counting
      const base = char.replace(/[\u064B-\u065F\u0670]/g, '');
      if (letterCounts[base] !== undefined) {
        letterCounts[base]++;
        totalLetters++;
      }
    }
  }
  
  result.totalWords = totalWords;
  result.totalLetters = totalLetters;
  result.letterFrequency = letterCounts;
  
  // --- Rhythm waveform (normalized) ---
  const maxVL = Math.max(...result.verseLengths);
  result.rhythmWaveform = result.verseLengths.map(v => v / maxVL);
  
  // Rhythm energy = coefficient of variation
  const mean = totalWords / result.numberOfAyahs;
  const variance = result.verseLengths.reduce((s, v) => s + (v - mean) ** 2, 0) / result.numberOfAyahs;
  result.rhythmEnergy = Math.sqrt(variance) / mean; // CV: 0 = uniform, >1 = very dynamic
  result.avgWordsPerVerse = Math.round(mean * 10) / 10;
  result.densityVariance = Math.round(variance * 10) / 10;
  
  // --- Letter spectrum (normalized, 28 values) ---
  const letters = ARABIC_LETTERS.split('');
  const maxLC = Math.max(...letters.map(l => letterCounts[l]));
  result.letterSpectrum = letters.map(l => Math.round((letterCounts[l] / (maxLC || 1)) * 1000) / 1000);
  
  // Top 5 and rarest
  const sorted = letters.slice().sort((a, b) => letterCounts[b] - letterCounts[a]);
  result.dominantLetters = sorted.slice(0, 5);
  result.rareLetter = sorted[sorted.length - 1];
  
  // --- Symmetry score ---
  const vl = result.verseLengths;
  const half = Math.floor(vl.length / 2);
  if (half >= 2) {
    const firstHalf = vl.slice(0, half);
    const secondHalf = vl.slice(-half).reverse();
    // Pearson correlation
    const n = firstHalf.length;
    const mean1 = firstHalf.reduce((a, b) => a + b, 0) / n;
    const mean2 = secondHalf.reduce((a, b) => a + b, 0) / n;
    let num = 0, den1 = 0, den2 = 0;
    for (let i = 0; i < n; i++) {
      const d1 = firstHalf[i] - mean1;
      const d2 = secondHalf[i] - mean2;
      num += d1 * d2;
      den1 += d1 * d1;
      den2 += d2 * d2;
    }
    result.symmetryScore = den1 && den2 ? Math.round((num / Math.sqrt(den1 * den2)) * 1000) / 1000 : 0;
  }
  result.pivotVerse = Math.floor(vl.length / 2);
  
  // --- Temperature ---
  // Revelation order (approximate) — early Meccan = hot, late Medinan = cool
  // Using a simplified chronological mapping
  const chronOrder = CHRONOLOGICAL_ORDER[surahNum] || surahNum;
  result.temperature = Math.round((1 - chronOrder / 114) * 1000) / 1000;
  
  // --- Geometric system ---
  const vc = result.numberOfAyahs;
  if (vc <= 4) { result.geometryFold = 4; result.geometryType = 'square/cross'; }
  else if (vc <= 6) { result.geometryFold = 6; result.geometryType = 'hexagonal'; }
  else if (vc === 7) { result.geometryFold = 7; result.geometryType = 'heptagonal (rare/special)'; }
  else if (vc <= 10) { result.geometryFold = 8; result.geometryType = 'octagonal'; }
  else if (vc <= 15) { result.geometryFold = 10; result.geometryType = 'decagonal (girih)'; }
  else if (vc <= 30) { result.geometryFold = 12; result.geometryType = 'dodecagonal'; }
  else if (vc <= 60) { result.geometryFold = 16; result.geometryType = '16-fold complex'; }
  else if (vc <= 120) { result.geometryFold = 24; result.geometryType = '24-fold radial'; }
  else { result.geometryFold = 36; result.geometryType = '36-fold dense radial'; }
  
  // --- Breath curve ---
  result.breathCurve = result.verseLengths.map(v => Math.round((v / maxVL) * 1000) / 1000);
  
  return result;
}

// Approximate chronological revelation order (surah number → chronological position)
// Source: standard Islamic scholarship, widely accepted ordering
const CHRONOLOGICAL_ORDER = {
  1:5, 2:87, 3:89, 4:92, 5:112, 6:55, 7:39, 8:88, 9:113, 10:51,
  11:52, 12:53, 13:96, 14:72, 15:54, 16:70, 17:50, 18:69, 19:44, 20:45,
  21:73, 22:103, 23:74, 24:102, 25:42, 26:47, 27:48, 28:49, 29:85, 30:84,
  31:57, 32:75, 33:90, 34:58, 35:43, 36:41, 37:56, 38:38, 39:59, 40:60,
  41:61, 42:62, 43:63, 44:64, 45:65, 46:66, 47:95, 48:111, 49:106, 50:34,
  51:67, 52:76, 53:23, 54:37, 55:97, 56:46, 57:94, 58:105, 59:101, 60:91,
  61:109, 62:110, 63:104, 64:108, 65:99, 66:107, 67:77, 68:2, 69:78, 70:79,
  71:71, 72:40, 73:3, 74:4, 75:31, 76:98, 77:33, 78:80, 79:81, 80:24,
  81:7, 82:82, 83:86, 84:83, 85:27, 86:36, 87:8, 88:68, 89:10, 90:35,
  91:26, 92:9, 93:11, 94:12, 95:28, 96:1, 97:25, 98:100, 99:93, 100:14,
  101:30, 102:16, 103:13, 104:32, 105:19, 106:29, 107:17, 108:15, 109:18, 110:114,
  111:6, 112:22, 113:20, 114:21
};

async function main() {
  console.log('Computing visual DNA for 114 surahs...');
  console.log('Source: api.alquran.cloud (Uthmani script)');
  console.log('');
  
  const allSurahs = [];
  
  for (let i = 1; i <= 114; i++) {
    try {
      const data = await computeSurahData(i);
      allSurahs.push(data);
      
      // Progress
      const bar = '█'.repeat(Math.floor(i / 114 * 30)) + '░'.repeat(30 - Math.floor(i / 114 * 30));
      process.stdout.write(`\r[${bar}] ${i}/114 ${data.englishName} (${data.numberOfAyahs}v, ${data.totalWords}w, sym:${data.symmetryScore}, temp:${data.temperature})`);
      
      // Rate limit: 200ms between requests
      await new Promise(r => setTimeout(r, 200));
    } catch (e) {
      console.error(`\nError on surah ${i}: ${e.message}`);
      // Retry once
      await new Promise(r => setTimeout(r, 1000));
      try {
        const data = await computeSurahData(i);
        allSurahs.push(data);
      } catch (e2) {
        console.error(`Failed surah ${i}: ${e2.message}`);
      }
    }
  }
  
  console.log('\n\nWriting surah-data.json...');
  fs.writeFileSync('surah-data.json', JSON.stringify(allSurahs, null, 2));
  
  // Summary stats
  console.log(`\n=== SUMMARY ===`);
  console.log(`Surahs processed: ${allSurahs.length}`);
  console.log(`Total verses: ${allSurahs.reduce((s, d) => s + d.numberOfAyahs, 0)}`);
  console.log(`Total words: ${allSurahs.reduce((s, d) => s + d.totalWords, 0)}`);
  
  // Most/least symmetric
  const bySym = allSurahs.slice().sort((a, b) => b.symmetryScore - a.symmetryScore);
  console.log(`\nMost symmetric: ${bySym[0].englishName} (${bySym[0].symmetryScore})`);
  console.log(`Least symmetric: ${bySym[bySym.length-1].englishName} (${bySym[bySym.length-1].symmetryScore})`);
  
  // Most/least rhythmic energy
  const byEnergy = allSurahs.slice().sort((a, b) => b.rhythmEnergy - a.rhythmEnergy);
  console.log(`\nMost dynamic rhythm: ${byEnergy[0].englishName} (CV:${byEnergy[0].rhythmEnergy.toFixed(2)})`);
  console.log(`Most uniform rhythm: ${byEnergy[byEnergy.length-1].englishName} (CV:${byEnergy[byEnergy.length-1].rhythmEnergy.toFixed(2)})`);
  
  // Temperature extremes
  const byTemp = allSurahs.slice().sort((a, b) => b.temperature - a.temperature);
  console.log(`\nHottest (earliest): ${byTemp[0].englishName} (${byTemp[0].temperature})`);
  console.log(`Coolest (latest): ${byTemp[byTemp.length-1].englishName} (${byTemp[byTemp.length-1].temperature})`);
  
  console.log(`\nSaved to surah-data.json (${(fs.statSync('surah-data.json').size / 1024).toFixed(0)}KB)`);
}

main().catch(console.error);
