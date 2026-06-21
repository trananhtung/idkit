import { describe, it, expect } from "vitest";
import { nanoid, customAlphabet, urlAlphabet } from "../src/index.js";

describe("nanoid", () => {
  it("returns 21 characters by default", () => {
    expect(nanoid()).toHaveLength(21);
  });

  it("honours a custom length", () => {
    expect(nanoid(10)).toHaveLength(10);
    expect(nanoid(40)).toHaveLength(40);
    expect(nanoid(0)).toBe("");
  });

  it("only uses the URL-safe alphabet", () => {
    const id = nanoid(200);
    for (const ch of id) expect(urlAlphabet).toContain(ch);
  });

  it("is effectively collision-free across many draws", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50_000; i++) seen.add(nanoid());
    expect(seen.size).toBe(50_000);
  });

  it("uses all 64 symbols given enough output (no obvious bias)", () => {
    const counts = new Map<string, number>();
    const big = nanoid(64 * 200);
    for (const ch of big) counts.set(ch, (counts.get(ch) ?? 0) + 1);
    expect(counts.size).toBe(64); // every symbol appears
  });
});

describe("customAlphabet", () => {
  it("generates ids from the given alphabet only", () => {
    const numeric = customAlphabet("0123456789", 6);
    const id = numeric();
    expect(id).toHaveLength(6);
    expect(/^[0-9]{6}$/.test(id)).toBe(true);
  });

  it("respects a per-call size override", () => {
    const hex = customAlphabet("0123456789abcdef");
    expect(hex(32)).toHaveLength(32);
    expect(/^[0-9a-f]{32}$/.test(hex(32))).toBe(true);
  });

  it("works with a non-power-of-two alphabet length", () => {
    const a = customAlphabet("abcde", 100); // length 5
    const id = a();
    expect(id).toHaveLength(100);
    expect(/^[abcde]{100}$/.test(id)).toBe(true);
  });

  it("rejects empty or oversized alphabets", () => {
    expect(() => customAlphabet("")).toThrow(RangeError);
    expect(() => customAlphabet("x".repeat(257))).toThrow(RangeError);
  });
});
