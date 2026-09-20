/**
 * Utility to extract numeric values and formulas from source text
 * and verify that every numeric value is preserved in the target (Hindi) output.
 */

export function extractNumericsAndFormulas(sourceText: string): string[] {
  // Regex to match integers, decimals, scientific notation, percentages
  const numericRegex = /\b\d+(?:\.\d+)?(?:%|e[-+]?\d+)?\b/gi;
  const matches = sourceText.match(numericRegex) || [];

  // Deduplicate
  return Array.from(new Set(matches.map((m) => m.trim())));
}

export function assertNumericsPreserved(
  sourceText: string,
  targetText: string
): { preserved: boolean; missingNumerics: string[] } {
  const numerics = extractNumericsAndFormulas(sourceText);
  const missingNumerics: string[] = [];

  for (const num of numerics) {
    if (!targetText.includes(num)) {
      missingNumerics.push(num);
    }
  }

  return {
    preserved: missingNumerics.length === 0,
    missingNumerics,
  };
}
