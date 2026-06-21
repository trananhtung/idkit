import { describe, it, expect } from "vitest";
import { ulid, monotonicFactory, decodeTime, isUlid } from "../src/index.js";

const CROCKFORD = /^[0-9A-HJKMNP-TV-Z]{26}$/;

describe("ulid", () => {
  it("is 26 Crockford-Base32 characters", () => {
    const id = ulid();
    expect(id).toHaveLength(26);
    expect(CROCKFORD.test(id)).toBe(true);
  });

  it("encodes the seed time in the first 10 characters", () => {
    const t = 1469918176385;
    const id = ulid(t);
    expect(decodeTime(id)).toBe(t);
  });

  it("sorts lexicographically by time", () => {
    const a = ulid(1000);
    const b = ulid(2000);
    const c = ulid(3000);
    expect([c, a, b].sort()).toEqual([a, b, c]);
  });

  it("produces distinct ids within the same millisecond", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 10_000; i++) seen.add(ulid(123456));
    expect(seen.size).toBe(10_000);
  });

  it("rejects out-of-range times", () => {
    expect(() => ulid(-1)).toThrow(RangeError);
    expect(() => ulid(2 ** 48)).toThrow(RangeError);
  });
});

describe("monotonicFactory", () => {
  it("is strictly increasing within one millisecond", () => {
    const next = monotonicFactory();
    const fixed = 1000;
    const ids = Array.from({ length: 100 }, () => next(fixed));
    const sorted = [...ids].sort();
    expect(ids).toEqual(sorted); // already in ascending order
    expect(new Set(ids).size).toBe(100); // all unique
    // each strictly greater than the previous
    for (let i = 1; i < ids.length; i++) expect(ids[i]! > ids[i - 1]!).toBe(true);
  });

  it("resets randomness when the clock advances", () => {
    const next = monotonicFactory();
    const a = next(1000);
    const b = next(2000);
    expect(decodeTime(a)).toBe(1000);
    expect(decodeTime(b)).toBe(2000);
    expect(b > a).toBe(true);
  });

  it("keeps increasing even if the clock goes backwards", () => {
    const next = monotonicFactory();
    const a = next(5000);
    const b = next(4000); // earlier timestamp
    expect(b > a).toBe(true); // monotonicity preserved
  });
});

describe("decodeTime / isUlid", () => {
  it("round-trips Date.now()", () => {
    const t = Date.now();
    expect(decodeTime(ulid(t))).toBe(t);
  });

  it("decodeTime rejects malformed input", () => {
    expect(() => decodeTime("too-short")).toThrow(RangeError);
    expect(() => decodeTime("I".repeat(26))).toThrow(RangeError); // I is not in Crockford
  });

  it("isUlid validates length and alphabet", () => {
    expect(isUlid(ulid())).toBe(true);
    expect(isUlid("01ARZ3NDEKTSV4RRFFQ69G5FAV")).toBe(true);
    expect(isUlid("short")).toBe(false);
    expect(isUlid("I".repeat(26))).toBe(false);
    expect(isUlid(123)).toBe(false);
    expect(isUlid(null)).toBe(false);
  });
});
