/** Fill `size` bytes with cryptographically strong randomness (Web Crypto). */
function randomBytes(size: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(size));
}

/**
 * The default URL-safe 64-character alphabet (`A-Za-z0-9_-`), arranged exactly
 * as upstream nanoid for byte-compatible output. 64 divides 256, so masking a
 * byte with `& 63` is perfectly uniform — no modulo bias.
 */
export const urlAlphabet =
  "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

/**
 * Generate a secure, URL-safe random id. Default length 21 gives a collision
 * probability comparable to a UUID v4 while being shorter and URL-friendly.
 *
 * ```ts
 * nanoid();    // "V1StGXR8_Z5jdHi6B-myT"
 * nanoid(10);  // "IRFa-VaY2b"
 * ```
 */
export function nanoid(size = 21): string {
  let id = "";
  const bytes = randomBytes(size);
  for (let i = 0; i < size; i++) {
    // `urlAlphabet` has exactly 64 chars, so the index is always defined.
    id += urlAlphabet[bytes[i]! & 63];
  }
  return id;
}

/**
 * Build an id generator over a custom alphabet. Uses masked rejection sampling
 * so every character is equally likely even when the alphabet length is not a
 * power of two (avoids the modulo bias of `bytes[i] % alphabet.length`).
 *
 * ```ts
 * const numeric = customAlphabet("0123456789", 6);
 * numeric();   // "479106"
 * const hex = customAlphabet("0123456789abcdef");
 * hex(32);     // 32-char lowercase hex token
 * ```
 */
export function customAlphabet(
  alphabet: string,
  defaultSize = 21,
): (size?: number) => string {
  if (alphabet.length === 0 || alphabet.length > 256) {
    throw new RangeError("customAlphabet: alphabet must have 1–256 characters");
  }
  // Smallest power-of-two-minus-one mask that covers all indices.
  const mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1;

  return (size = defaultSize): string => {
    if (size <= 0) return "";
    // Over-allocate so most ids finish in a single random read.
    const step = Math.ceil((1.6 * mask * size) / alphabet.length);
    let id = "";
    for (;;) {
      const bytes = randomBytes(step);
      for (let i = 0; i < step; i++) {
        const index = bytes[i]! & mask;
        const char = alphabet[index];
        if (char !== undefined) {
          id += char;
          if (id.length === size) return id;
        }
      }
    }
  };
}
