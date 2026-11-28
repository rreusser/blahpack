# dgbcon: Translation Learnings

## Translation pitfalls

- The AB storage for dgbcon is the dgbtrf output format (2*KL+KU+1 rows), not the original banded input format. The upper triangular factor U occupies the top KL+KU+1 rows, and the L multipliers occupy rows KD+1..2*KL+KU below the main diagonal.
- The main diagonal in dgbtrf output is at row KL+KU (0-based), or KL+KU+1 in Fortran. This is critical for dlatbs which receives `kd = kl+ku` and expects the main diagonal at row `kd` in the upper triangular banded storage.
- IPIV from dgbtrf is 0-based in JS (unlike Fortran's 1-based). The pivot swap `JP !== J` comparison uses 0-based indices directly.

## Dependency interface surprises

- dlatbs requires `normin` as a raw character ('N' or 'Y'), not a long-form string. This is consistent with how dlatrs handles it in dgecon. The first call uses 'N' to compute CNORM, subsequent calls use 'Y'.
- dlacn2's reverse-communication interface uses KASE[0] as both input and output. Setting KASE[0]=0 before the first call triggers initialization.

## Automation opportunities

- The dgbcon/dpbcon/dgecon routines all share the same dlacn2 reverse-communication loop pattern. A template or shared helper could reduce duplication.

## Coverage gaps

- The scale overflow bailout path (scale < |WORK[ix]| * SMLNUM) is not exercised because standard test matrices are well-conditioned.
- Lines 158-160 and 185-202 are uncovered (the `lnoti=false` fast path when KL=0, and some bail conditions).

## Complex number handling

- N/A: dgbcon is a real-valued routine.
