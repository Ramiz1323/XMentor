/**
 * Deterministically shuffles an array based on a string seed.
 * This ensures the same user always gets the same question order for the same test,
 * maintaining stability across pauses and resumes.
 */
export const deterministicShuffle = (array, seed) => {
  if (!array || !Array.isArray(array)) return [];
  if (!seed) return [...array];

  // Create a copy to avoid mutating the original
  const shuffled = [...array];
  
  // Hash the seed to a numeric value
  let seedNum = 0;
  for (let i = 0; i < seed.length; i++) {
    seedNum = ((seedNum << 5) - seedNum) + seed.charCodeAt(i);
    seedNum = seedNum >>> 0; // Convert to unsigned 32bit integer
  }

  // Linear Congruential Generator (simple PRNG)
  const random = () => {
    seedNum = (seedNum * 1664525 + 1013904223) >>> 0;
    return seedNum / 4294967296;
  };

  // Fisher-Yates Shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};
