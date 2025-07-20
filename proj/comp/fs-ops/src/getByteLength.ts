/**
 * Calculate UTF-8 byte length of a string
 * @param content - String content to measure
 * @returns Number of bytes in UTF-8 encoding
 */
export function getByteLength(content: string): number {
  return Buffer.byteLength(content, 'utf8');
}