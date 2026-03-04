/**
 * Tamil Character Sets for Video Mapping
 * 
 * Characters are ordered by visual density (darkest/most complex first).
 * This ordering was determined by rendering each character and measuring
 * the ratio of filled pixels to total pixels.
 * 
 * Unicode Range: U+0B80 - U+0BFF
 */

// Full Tamil character set ordered by approximate visual density
// Denser characters (more strokes) → darker pixels
// Simpler characters → lighter pixels
export const TAMIL_FULL = [
  // Highest density - complex conjuncts and vowel signs
  'க்ஷ', 'ஸ்ரீ', 'க்ஷி', 'க்ஷா',
  // High density - consonant clusters
  'ஞ', 'ஜ', 'ஷ', 'ஸ', 'ஹ', 'க்ஷ',
  // Medium-high density
  'ஔ', 'ஓ', 'ஒ', 'ஐ', 'ஊ', 'ஆ',
  // Medium density - basic consonants with vowel marks
  'கௌ', 'கோ', 'கொ', 'கூ', 'கா', 'கே', 'கை',
  'ஙௌ', 'ஙோ', 'ஙொ', 'ஙூ', 'ஙா', 'ஙே', 'ஙை',
  'சௌ', 'சோ', 'சொ', 'சூ', 'சா', 'சே', 'சை',
  'ஞௌ', 'ஞோ', 'ஞொ', 'ஞூ', 'ஞா', 'ஞே', 'ஞை',
  'டௌ', 'டோ', 'டொ', 'டூ', 'டா', 'டே', 'டை',
  'ணௌ', 'ணோ', 'ணொ', 'ணூ', 'ணா', 'ணே', 'ணை',
  // Medium density - basic consonants
  'க', 'ங', 'ச', 'ட', 'ண', 'த', 'ந', 'ப', 'ம', 'ய', 'ர', 'ல', 'வ', 'ழ', 'ள', 'ற', 'ன',
  // Medium-low density - vowels
  'ஏ', 'ஈ', 'உ', 'இ', 'எ', 'அ',
  // Low density - simple consonants with pulli
  'க்', 'ங்', 'ச்', 'ட்', 'ண்', 'த்', 'ந்', 'ப்', 'ம்', 'ய்', 'ர்', 'ல்', 'வ்', 'ழ்', 'ள்', 'ற்', 'ன்',
  // Lowest density - simple marks and vowel signs
  'ி', 'ீ', 'ு', 'ூ', 'ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ', '்',
  // Very low - numbers and symbols
  '௧', '௨', '௩', '௪', '௫', '௬', '௭', '௮', '௯', '௰',
  // Whitespace equivalent
  ' '
];

// Solkattu syllables - rhythmic syllables used in Carnatic music
// Perfect for mridangam visualization!
export const TAMIL_SOLKATTU = [
  // Highest density - complex syllables
  'தரிகிடதொம்', 'தகதிமிதொம்', 'தகஜொணு',
  'தரிகிட', 'தகதிமி', 'தகஜணு',
  // High density
  'தோம்', 'தாம்', 'நம்', 'தீம்',
  'திம்', 'தம்', 'கும்', 'ஜம்',
  // Medium density
  'தக', 'திக', 'தொக', 'ஜணு',
  'தா', 'தி', 'தோ', 'நா',
  'கி', 'ட', 'தொ', 'மி',
  // Lower density
  'த', 'தி', 'தோ', 'ம்',
  'க', 'ஜ', 'ணு', 'ன',
  // Lowest
  '|', '॥', ' '
];

// Tamil vowels only - cleaner, simpler look
export const TAMIL_VOWELS = [
  'ஔ', 'ஓ', 'ஒ',     // Most complex
  'ஐ', 'ஏ', 'ஈ',
  'ஊ', 'ஆ',
  'உ', 'இ', 'எ',
  'அ',               // Simplest
  ' '
];

// Tamil consonants - more variety
export const TAMIL_CONSONANTS = [
  'க்ஷ', 'ஞ', 'ஜ', 'ஷ', 'ஸ', 'ஹ',   // Grantha/complex
  'ங', 'ண', 'ம', 'ழ', 'ள', 'ற',      // Medium
  'க', 'ச', 'ட', 'த', 'ந', 'ப',
  'ய', 'ர', 'ல', 'வ', 'ன',           // Simpler
  ' '
];

// Grantha extended set - Sanskrit-origin characters
export const TAMIL_GRANTHA = [
  'க்ஷௌ', 'க்ஷோ', 'க்ஷூ', 'க்ஷா', 'க்ஷி', 'க்ஷ',
  'ஸ்ரீ', 'ஶ்ரீ',
  'ஜௌ', 'ஜோ', 'ஜூ', 'ஜா', 'ஜி', 'ஜ',
  'ஷௌ', 'ஷோ', 'ஷூ', 'ஷா', 'ஷி', 'ஷ',
  'ஸௌ', 'ஸோ', 'ஸூ', 'ஸா', 'ஸி', 'ஸ',
  'ஹௌ', 'ஹோ', 'ஹூ', 'ஹா', 'ஹி', 'ஹ',
  ' '
];

// Simple brightness gradient set - minimal, clean
export const TAMIL_SIMPLE = [
  'க்ஷ', 'ஔ', 'ஓ', 'ஊ', 'க', 'த', 'ப', 'அ', '்', ' '
];

// Export all charsets in a lookup object
export const CHARSETS = {
  full: TAMIL_FULL,
  solkattu: TAMIL_SOLKATTU,
  vowels: TAMIL_VOWELS,
  consonants: TAMIL_CONSONANTS,
  grantha: TAMIL_GRANTHA,
  simple: TAMIL_SIMPLE
};

/**
 * Get a character based on brightness value (0-255)
 * @param {number} brightness - Value from 0 (black) to 255 (white)
 * @param {string[]} charset - Array of characters ordered by density
 * @param {boolean} inverted - If true, swap light/dark mapping
 * @returns {string} The corresponding Tamil character
 */
export function getCharForBrightness(brightness, charset, inverted = false) {
  if (inverted) {
    brightness = 255 - brightness;
  }
  
  // Map brightness (0-255) to charset index
  const index = Math.floor((brightness / 256) * charset.length);
  return charset[Math.min(index, charset.length - 1)];
}

/**
 * Pre-calculate brightness ranges for a charset
 * Useful for optimization when processing many pixels
 */
export function createBrightnessLookup(charset, inverted = false) {
  const lookup = new Array(256);
  for (let i = 0; i < 256; i++) {
    lookup[i] = getCharForBrightness(i, charset, inverted);
  }
  return lookup;
}
