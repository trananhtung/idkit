# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-21

### Added

- `nanoid(size?)` — secure, URL-safe random id from the 64-char alphabet
  (default length 21), backed by `crypto.getRandomValues`.
- `customAlphabet(alphabet, defaultSize?)` — id generator over any alphabet,
  using masked rejection sampling for unbiased output.
- `ulid(seedTime?)` — 26-char Crockford Base32 ULID: lexicographically sortable
  48-bit timestamp + 80 bits of randomness.
- `monotonicFactory()` — strictly increasing ULIDs within the same millisecond.
- `decodeTime(id)` and `isUlid(value)` helpers.
- ESM + CJS builds, types, and CI across Node 18 / 20 / 22.
