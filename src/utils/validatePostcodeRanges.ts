/**
 * Parses a multi-line string expected to contain 5-digit postal codes in either:
 *   - Single code form: "12345;"
 *   - Paired code form: "12345,67890;"
 *
 * Format Rules (per line):
 *  1) Exactly one semicolon at the end (no other semicolons).
 *  2) One or two codes separated by a single comma (no more).
 *  3) Each code is exactly 5 digits (e.g., "12345").
 *  4) No leading or trailing spaces (trimmed automatically).
 *
 * Lines are typically separated by "\n".
 *
 * Example Valid Input:
 *   12345;
 *   12345,67890;
 *
 * Returns a string in the format: "12345-67890;22222-22222;"
 *
 * Throws an Error if any line is invalid, listing *all* issues found.
 *
 * @param formatted - The multi-line string containing postal code(s).
 * @returns A string of postal code ranges in the format "FROM-TO;" 
 */
export function validatePostcodeRanges(formatted: string): string {
  // Existing implementation...
  // Copy the entire function body from validate.ts
} 