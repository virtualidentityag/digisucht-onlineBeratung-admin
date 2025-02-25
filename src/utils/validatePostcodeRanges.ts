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
export function parsePostcodeRanges(formatted: string): string {
    // Validate input type
    if (typeof formatted !== 'string') {
        throw new Error('Input must be a string');
    }

    // Split into lines, filter out empty lines
    const rawLines = formatted.split('\n').filter((line) => line.trim() !== '');
    const errors: string[] = [];
    const parsedRanges: string[] = [];

    // If no valid lines found after filtering
    if (rawLines.length === 0) {
        throw new Error('Input must contain at least one postal code');
    }

    rawLines.forEach((rawLine, index) => {
        // Line index for error messages
        const lineNumber = index + 1;

        // 1) Trim leading/trailing spaces
        const line = rawLine.trim();

        // If the line is empty after trimming, treat as an error
        if (!line) {
            errors.push(`Line ${lineNumber} is empty. Each line must contain a postal code followed by a semicolon.`);
            return;
        }

        // 2) Must end with exactly one semicolon, no others allowed
        if (!line.endsWith(';')) {
            errors.push(`Line ${lineNumber} must end with exactly one semicolon (e.g., "12345;").`);
            return; // Stop further checks on this line
        }

        // Remove the trailing semicolon to inspect content
        const content = line.slice(0, -1);

        // Check if there's any other semicolon left in 'content'
        if (content.includes(';')) {
            errors.push(`Line ${lineNumber} has more than one semicolon. Only one semicolon is allowed, at the end.`);
            return;
        }

        // 3) Split by comma => must have 1 or 2 parts (single or paired code)
        const parts = content.split(',');
        if (parts.length === 0 || parts.length > 2) {
            errors.push(`Line ${lineNumber} has ${parts.length} code(s). Only 1 or 2 codes allowed per line.`);
            return;
        }

        // 4) Validate each part is exactly 5 digits
        const codes = parts.map((part, partIndex) => {
            const trimmedPart = part.trim();
            if (!/^\d{5}$/.test(trimmedPart)) {
                errors.push(
                    `Line ${lineNumber}, part ${partIndex + 1}: "${trimmedPart}" must be a 5-digit postal code.`,
                );
            }
            return trimmedPart;
        });

        // Build the "FROM-TO" string
        // If there's only 1 code, "TO" is the same as "FROM"
        if (codes.length === 1) {
            parsedRanges.push(`${codes[0]}-${codes[0]}`);
        } else {
            parsedRanges.push(`${codes[0]}-${codes[1]}`);
        }
    });

    // If any errors were collected, throw them all at once
    if (errors.length > 0) {
        throw new Error(`Validation failed:\n${errors.join('\n')}`);
    }

    // If valid, join everything with semicolons and add one final semicolon
    return `${parsedRanges.join(';')};`;
}
