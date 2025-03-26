import { translationService } from '../services/translationService';

/**
 * Parses a multi-line string expected to contain 5-digit postal codes in either:
 *   - Single code form: "12345;"
 *   - Paired code form: "12345,67890;"
 *
 * Format Rules (per line):
 *  1) Each postal code entry must end with a semicolon.
 *  2) One or two codes separated by a single comma (no more).
 *  3) Each code is exactly 5 digits (e.g., "12345").
 *  4) No leading or trailing spaces (trimmed automatically).
 *
 * Lines are typically separated by "\n".
 *
 * Example Valid Input:
 *   12345;67890;
 *   12345,67890;22222;
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
        throw new Error(translationService.translate('message.error.postcode.inputMustBeString'));
    }

    // Split into lines, filter out empty lines
    const rawLines = formatted.split('\n').filter((line) => line.trim() !== '');
    const errors: string[] = [];
    const parsedRanges: string[] = [];

    // If no valid lines found after filtering
    if (rawLines.length === 0) {
        throw new Error(translationService.translate('message.error.postcode.inputMustContainPostalCode'));
    }

    rawLines.forEach((rawLine, index) => {
        // Line index for error messages
        const lineNumber = index + 1;

        // 1) Trim leading/trailing spaces
        const line = rawLine.trim();

        // If the line is empty after trimming, treat as an error
        if (!line) {
            errors.push(translationService.translate('message.error.postcode.emptyLine', { lineNumber }));
            return;
        }

        // Split the line by semicolons to process multiple entries
        const entries = line.split(';').filter((entry) => entry.trim() !== '');

        entries.forEach((entry, entryIndex) => {
            // 2) Each entry must have content
            if (!entry.trim()) {
                errors.push(
                    translationService.translate('message.error.postcode.emptyEntry', {
                        lineNumber,
                        entryNumber: entryIndex + 1,
                    }),
                );
                return;
            }

            // 3) Split by comma => must have 1 or 2 parts (single or paired code)
            const parts = entry.split(',');
            if (parts.length === 0 || parts.length > 2) {
                errors.push(
                    translationService.translate('message.error.postcode.invalidCodeCount', {
                        lineNumber,
                        entryNumber: entryIndex + 1,
                        count: parts.length,
                    }),
                );
                return;
            }

            // 4) Validate each part is exactly 5 digits
            const codes = parts.map((part, partIndex) => {
                const trimmedPart = part.trim();
                if (!/^\d{5}$/.test(trimmedPart)) {
                    errors.push(
                        translationService.translate('message.error.postcode.invalidPostalCode', {
                            lineNumber,
                            entryNumber: entryIndex + 1,
                            partIndex: partIndex + 1,
                            code: trimmedPart,
                        }),
                    );
                }
                return trimmedPart;
            });

            // 5) If it's a range (two postcodes), validate that the second is greater than the first
            if (codes.length === 2 && /^\d{5}$/.test(codes[0]) && /^\d{5}$/.test(codes[1])) {
                const firstCode = parseInt(codes[0], 10);
                const secondCode = parseInt(codes[1], 10);

                if (secondCode <= firstCode) {
                    errors.push(
                        translationService.translate('message.error.postcode.invalidRange', {
                            lineNumber,
                            entryNumber: entryIndex + 1,
                            firstCode: codes[0],
                            secondCode: codes[1],
                        }),
                    );
                }
            }

            // Build the "FROM-TO" string
            // If there's only 1 code, "TO" is the same as "FROM"
            if (codes.length === 1) {
                parsedRanges.push(`${codes[0]}-${codes[0]}`);
            } else {
                parsedRanges.push(`${codes[0]}-${codes[1]}`);
            }
        });
    });

    // If any errors were collected, throw them all at once
    if (errors.length > 0) {
        throw new Error(`${errors.join('\n')}`);
    }

    // If valid, join everything with semicolons and add one final semicolon
    return `${parsedRanges.join(';')};`;
}

/**
 * Validates and transforms a postcode range string for use in agency settings.
 * Wraps the parsePostcodeRanges function and returns the properly formatted string.
 *
 * @param rangeString - The postcode range string to validate
 * @returns A validated and formatted postcode range string
 */
export function validatePostcodeRanges(rangeString: string): string {
    return parsePostcodeRanges(rangeString);
}
