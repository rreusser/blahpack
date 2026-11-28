# zgecon: Translation Learnings

## Translation pitfalls

- Direct complex mirror of dgecon. The main difference is zlacn2 does NOT have an ISGN parameter (unlike dlacn2), so zgecon does not need IWORK at all. This is a key API difference from dgecon.
- WORK is Complex128Array (2*N complex elements) vs Float64Array (4*N) in dgecon. RWORK is Float64Array (2*N) for the CNORM workspace used by zlatrs.
- The `cabs1` helper (|re|+|im|) is needed for the overflow check on WORK elements after izamax returns.
- izamax returns a 0-based index, so the Float64 view index must be computed as `(offset + ix * stride) * 2`.

## Dependency interface surprises

- zlatrs uses long-form strings ('upper', 'lower', 'no-transpose', 'conjugate-transpose', 'unit', 'non-unit') consistently. The Fortran 'Conjugate transpose' maps to 'conjugate-transpose'.
- zlacn2 signature differs from dlacn2: no ISGN array, fewer parameters.

## Missing automation

- N/A. Pattern was well-established from dgecon.

## Coverage gaps

- The bail-out path (scale overflow causing early exit) is hard to trigger with well-conditioned test matrices. Would need a near-singular matrix with extreme scaling.

## Complex number handling

- Only uses cabs1 inline (safe: just addition of absolute values). No complex division or multiplication needed in this routine.
