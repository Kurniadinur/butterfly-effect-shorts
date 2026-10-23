/**
 * Utility functions for text processing, subtitle cleaning, and kinetic typography.
 */

/**
 * Strips punctuation marks, quotation marks, and special symbols from subtitle words
 * so captions are clean, stationary, and readable without visual clutter.
 */
export function cleanSubtitleWord(rawWord: string): string {
  if (!rawWord) return '';
  return rawWord
    .replace(/[":;?!,()[\]{}…«»“”‘’\\/]/g, '')
    .replace(/\.+/g, '')
    .replace(/^-+|-+$/g, '')
    .trim();
}

/**
 * Partitions a list of items into stationary chunks of 2-3 items.
 */
export function partitionIntoChunks<T>(items: T[]): T[][] {
  const chunks: T[][] = [];
  let i = 0;
  while (i < items.length) {
    const remaining = items.length - i;
    let size = 3;
    if (remaining === 4) {
      size = 2;
    } else if (remaining === 2) {
      size = 2;
    } else if (remaining === 1) {
      if (chunks.length > 0 && chunks[chunks.length - 1].length <= 2) {
        chunks[chunks.length - 1].push(items[i]);
        break;
      }
      size = 1;
    }
    chunks.push(items.slice(i, i + size));
    i += size;
  }
  return chunks;
}
