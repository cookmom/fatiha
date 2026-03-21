# Quran Mathematics — Generative Art Data Sources

## Word Count Symmetries (for data viz layers)
| Word Pair | Count | Real-World Correlation |
|---|---|---|
| Day (يوم) | 365 | Days in a year |
| Month (شهر) | 12 | Months in a year |
| Days plural (أيام) | 30 | Days in a month |
| Man (رجل) | 24 | = Woman (امرأة) 24 |
| Sea (بحر) | 32 | 71.1% of 45 total |
| Land (بر) | 13 | 28.9% of 45 total (≈ Earth ratio) |
| Life (حياة) | 145 | = Death (موت) 145 |
| Angels (ملائكة) | 88 | = Devils (شياطين) 88 |
| This world (دنيا) | 115 | = Hereafter (آخرة) 115 |

## The Number 19 System
- Bismillah: 19 Arabic letters
- 114 surahs = 19 × 6
- First revelation (96:1-5): 19 words, 76 letters (19 × 4)
- Surah 96 = 19 verses
- "Bismillah" total across all surahs: 114 = 19 × 6
- Quran 74:30: "Over it are nineteen"

## Golden Ratio (φ = 1.618...)
- 114 / 70.449 ≈ 1.618
- Al-Fatiha position in the golden ratio of the Quran's structure
- Fibonacci in verse groupings

## Abjad Numerals (letter → number mapping)
| Letter | Value | Letter | Value | Letter | Value |
|---|---|---|---|---|---|
| ا | 1 | ح | 8 | س | 60 |
| ب | 2 | ط | 9 | ع | 70 |
| ج | 3 | ي | 10 | ف | 80 |
| د | 4 | ك | 20 | ص | 90 |
| ه | 5 | ل | 30 | ق | 100 |
| و | 6 | م | 40 | ر | 200 |
| ز | 7 | ن | 50 | ش | 300 |

## Per-Surah Generative Parameters
For each surah, derive:
- `verse_count` → number of concentric rings/layers
- `word_count` → stroke density
- `abjad_sum` → color temperature (cool → warm)
- `surah_number % 19` → symmetry fold (0-18)
- `verse_count / word_count` → aspect ratio of composition
- `unique_letters` → palette size
- `longest_verse / shortest_verse` → contrast ratio

## Al-Fatiha Specific
- 7 verses, 29 words, 139 letters
- Abjad sum: computable per verse
- Verse 4 (مالك يوم الدين) is the structural center
- Divides into 3+1+3: praise (1-3), pivot (4), prayer (5-7)
- This 3-1-3 structure → visual symmetry with distinct center

## Art Generation Approach
The math DETERMINES the visual:
1. Surah's abjad sum → selects from Islamic color palette
2. Verse count → number of geometric layers
3. Word pairs/symmetries → bilateral composition elements
4. 19-relationships → geometric symmetry type
5. Golden ratio → spiral/proportion framework
6. Word frequencies → data visualization overlays (subtle HUD-like elements)
