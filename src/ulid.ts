/** Crockford's Base32 — no I, L, O, or U, so ids stay unambiguous. */
const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const TIME_LEN = 10;
const RANDOM_LEN = 16;
const ULID_LEN = TIME_LEN + RANDOM_LEN; // 26

function randomBytes(size: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(size));
}

function encodeTime(time: number): string {
  if (!Number.isInteger(time) || time < 0 || time > 0xffffffffffff) {
    throw new RangeError("ulid: time must be an integer in [0, 2^48)");
  }
  let str = "";
  for (let i = TIME_LEN - 1; i >= 0; i--) {
    const mod = time % 32;
    str = ENCODING[mod] + str;
    time = (time - mod) / 32;
  }
  return str;
}

function randomChars(): number[] {
  const bytes = randomBytes(RANDOM_LEN);
  // 256 is divisible by 32, so `& 31` is a uniform 5-bit draw.
  return Array.from(bytes, (b) => b & 31);
}

function encodeChars(indices: readonly number[]): string {
  let str = "";
  for (const i of indices) str += ENCODING[i];
  return str;
}

/**
 * Generate a [ULID](https://github.com/ulid/spec): a 26-character, Crockford
 * Base32, **lexicographically sortable** id — a 48-bit millisecond timestamp
 * followed by 80 bits of crypto randomness. Sorts by creation time as a string.
 *
 * ```ts
 * ulid();          // "01ARZ3NDEKTSV4RRFFQ69G5FAV"
 * ulid(1469918176385);  // pin the timestamp
 * ```
 */
export function ulid(seedTime: number = Date.now()): string {
  return encodeTime(seedTime) + encodeChars(randomChars());
}

/**
 * Create a **monotonic** ULID generator: if called multiple times in the same
 * millisecond, the random component is incremented by one so each id is strictly
 * greater than the last. Guarantees sort order even within a tight loop.
 *
 * ```ts
 * const next = monotonicFactory();
 * next(); next(); // second id sorts strictly after the first
 * ```
 */
export function monotonicFactory(): (seedTime?: number) => string {
  let lastTime = -1;
  let lastRand: number[] = [];

  return (seedTime: number = Date.now()): string => {
    if (seedTime <= lastTime) {
      // Same (or backwards) clock tick: increment the 80-bit random with carry.
      const rand = lastRand.slice();
      let i = RANDOM_LEN - 1;
      for (; i >= 0; i--) {
        if (rand[i]! === 31) rand[i] = 0;
        else {
          rand[i]!++;
          break;
        }
      }
      if (i < 0) throw new Error("ulid: monotonic random overflow");
      lastRand = rand;
      return encodeTime(lastTime) + encodeChars(rand);
    }
    lastTime = seedTime;
    lastRand = randomChars();
    return encodeTime(seedTime) + encodeChars(lastRand);
  };
}

/** Recover the millisecond timestamp encoded in a ULID. */
export function decodeTime(id: string): number {
  if (id.length !== ULID_LEN) throw new RangeError("decodeTime: not a 26-char ULID");
  let time = 0;
  for (let i = 0; i < TIME_LEN; i++) {
    const index = ENCODING.indexOf(id[i]!.toUpperCase());
    if (index === -1) throw new RangeError(`decodeTime: invalid character "${id[i]}"`);
    time = time * 32 + index;
  }
  return time;
}

/** True if `value` is a syntactically valid ULID (26 Crockford-Base32 chars). */
export function isUlid(value: unknown): value is string {
  if (typeof value !== "string" || value.length !== ULID_LEN) return false;
  for (const ch of value) if (ENCODING.indexOf(ch.toUpperCase()) === -1) return false;
  return true;
}
