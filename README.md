# idkit

> Tiny, secure id toolkit — **URL-safe random ids** (nanoid-style) and **lexicographically sortable ULIDs** with a monotonic factory. **Zero dependencies**.

[![CI](https://github.com/trananhtung/idkit/actions/workflows/ci.yml/badge.svg)](https://github.com/trananhtung/idkit/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@billdaddy/idkit.svg)](https://www.npmjs.com/package/@billdaddy/idkit)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@billdaddy/idkit)](https://bundlephobia.com/package/@billdaddy/idkit)
[![types](https://img.shields.io/npm/types/@billdaddy/idkit.svg)](https://www.npmjs.com/package/@billdaddy/idkit)
[![license](https://img.shields.io/npm/l/@billdaddy/idkit.svg)](./LICENSE)

Two kinds of id cover almost everything: a **short, random, URL-safe** one for
public handles and tokens, and a **time-sortable** one for database keys that you
want to order by creation without a separate timestamp column. `idkit` gives you
both — backed by the Web Crypto RNG, with no modulo bias — in one
**zero-dependency** package that runs in Node and the browser.

```ts
import { nanoid, ulid } from "@billdaddy/idkit";

nanoid();  // "V1StGXR8_Z5jdHi6B-myT"          → public ids, tokens
ulid();    // "01ARZ3NDEKTSV4RRFFQ69G5FAV"     → sortable primary keys
```

## Why idkit?

- **Secure by default.** Every byte comes from `crypto.getRandomValues`; alphabets
  use masked rejection sampling, so each character is uniformly distributed.
- **Random *and* sortable.** `nanoid` for compact random ids; `ulid` for ids that
  sort by time as plain strings.
- **Monotonic ULIDs.** A factory that guarantees strictly increasing ids even
  within the same millisecond.
- **Inspectable.** `decodeTime` reads the timestamp back out of a ULID; `isUlid`
  validates one.
- **Custom alphabets.** Build a generator over any alphabet (numeric OTPs, hex
  tokens, your own symbol set).
- **Zero dependencies**, ESM + CJS + types, Node 18+ and modern browsers.

## Install

```bash
npm install @billdaddy/idkit
# or: pnpm add @billdaddy/idkit  /  yarn add @billdaddy/idkit  /  bun add @billdaddy/idkit
```

## Random ids

```ts
import { nanoid, customAlphabet } from "@billdaddy/idkit";

nanoid();    // 21 chars, ~121 bits of entropy (UUID-class collision odds)
nanoid(10);  // shorter when you don't need as much

// Custom alphabets — uniform, no bias even for non-power-of-two lengths:
const otp = customAlphabet("0123456789", 6);
otp();       // "473829"

const token = customAlphabet("0123456789abcdef");
token(32);   // 32-char hex
```

## Sortable ids (ULID)

A [ULID](https://github.com/ulid/spec) is a 26-character Crockford Base32 string:
a 48-bit millisecond timestamp followed by 80 bits of randomness. It sorts by
creation time as a string and is case-insensitive.

```ts
import { ulid, monotonicFactory, decodeTime, isUlid } from "@billdaddy/idkit";

ulid();              // "01ARZ3NDEKTSV4RRFFQ69G5FAV"
ulid(1469918176385); // pin the timestamp

decodeTime("01ARZ3NDEKTSV4RRFFQ69G5FAV"); // 1469918176385
isUlid(someString);                        // boolean

// Strictly increasing ids, even in a tight loop within one millisecond:
const nextId = monotonicFactory();
nextId();
nextId(); // sorts strictly after the previous
```

### When to use which

| Need | Use |
| --- | --- |
| Public-facing handle, share token, short id | `nanoid()` |
| Database primary key you can sort by time | `ulid()` |
| Guaranteed ordering across rapid inserts | `monotonicFactory()` |
| Fixed-format code (OTP, hex, custom) | `customAlphabet()` |

## Pairs well with

| Need | Use |
| --- | --- |
| Validate ids in typed config / env | [`envguard`](https://www.npmjs.com/package/envguard) |
| Redact ids/secrets from logs | [`scrubtext`](https://www.npmjs.com/package/scrubtext) |

## License

[MIT](./LICENSE) © Tung Tran
