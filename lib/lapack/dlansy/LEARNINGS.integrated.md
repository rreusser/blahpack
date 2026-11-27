# dlansy: Translation Learnings

## Translation pitfalls

- Frobenius norm requires counting off-diagonal elements twice (`SUM = 2*SUM`
  in Fortran). The diagonal is accumulated separately via `dlassq` with
  stride `LDA+1` (translated to `strideA1 + strideA2`).
- For the one-norm/infinity-norm path with UPLO='U', the Fortran initializes
  `WORK(I)` implicitly by the first assignment `WORK(J) = SUM + ...` on the
  diagonal. Translated to JS, the WORK array is zero-initialized by
  Float64Array constructor, so off-diagonal accumulations into `WORK[i]`
  start from 0. This is correct because each column j in the upper-triangle
  loop sets `WORK[j] = sum + |A(j,j)|` (resetting it), while `WORK[i]` for
  `i < j` is only incremented.

## Dependency interface surprises

- `dlassq` returns `{ scl, sumsq }` object (not mutated arguments). This is
  consistent with how zlassq is called in zlange. No surprises here.
- `dlassq` takes real Float64Array directly (no reinterpret needed), unlike
  zlassq which takes Complex128Array.

## Automation opportunities

- The `init_routine.py` deps file generator does not include `la_constants`
  and `la_xisnan` module dependencies required by `dlassq.f90`. Had to
  manually add them to `deps_dlansy.txt`. Consider auto-detecting `.f90`
  module `USE` statements in the dep tree.

## Coverage gaps

- Lines 166-167 (the fallback `else` branch for unknown norm character)
  are not covered. This is intentional -- passing an invalid norm is
  undefined behavior per the LAPACK spec.
- `dlassq` coverage is lower (69%) because the Blue's scaling edge cases
  (overflow/underflow accumulators) are not exercised by dlansy's test
  inputs. That's fine -- dlassq has its own dedicated tests.

## Complex number handling

- N/A -- dlansy is a real-valued routine. No complex arithmetic needed.
