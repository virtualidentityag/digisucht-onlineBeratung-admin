/**
 * Converts a hyphen-delimited range string (e.g. "1000-1010;1020-1030;")
 * into a comma-delimited text (with newlines).
 *
 * @param postcodeRanges - A hyphen-delimited `postcodeRanges` string.
 * @returns A transformed string with ranges formatted as "FROM,TO" (or a single FROM if no TO),
 *          separated by `";\n"` and ending with a single semicolon.
 */
export function transformPostcodeRanges(postcodeRanges: string): string {
    return `${postcodeRanges
        .replace(/;$/, '') // Remove trailing semicolon if it exists
        .split(';') // Split by semicolons
        .filter(Boolean) // Remove empty entries
        .map((range) => {
            const regex = /^(\d+)(?:-(\d+))?$/;
            const match = regex.exec(range);
            if (!match) {
                return '';
            }
            const [, from, to] = match;
            return to ? `${from},${to}` : from; // "FROM-TO" => "FROM,TO"
        })
        .join(';\n')};`; // Rejoin and ensure exactly one final semicolon
}
