# zhesv: Translation Learnings

## Translation pitfalls
- Simple driver: zhetrf then zhetrs or zhetrs2 depending on workspace size.
- When lwork >= N, uses zhetrs2 (faster, uses zsyconv); otherwise zhetrs.

## Dependency interface surprises
- zhetrs does not take WORK parameter; zhetrs2 does.

## Missing automation
- N/A.

## Coverage gaps
- Both zhetrs and zhetrs2 paths tested (lwork >= N triggers zhetrs2, which is the LWMAX=256 case).

## Complex number handling
- Delegates to zhetrf/zhetrs/zhetrs2.
