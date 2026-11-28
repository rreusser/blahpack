# dlarnv: Translation Learnings

## Translation pitfalls

- The batch loop iterates by LV/2=64 elements at a time. For idist=3 (normal), 2x as many uniform randoms are needed (Box-Muller), hence il2=2*il.
- The internal U buffer is allocated once (LV=128 elements) and reused per batch.

## Dependency interface surprises

- dlaruv accepts stride/offset for both iseed and x arrays, which allows flexible placement.

## Automation opportunities

- N/A: straightforward translation.

## Coverage gaps

- Large N (>64) that requires multiple batches is not tested. Only N=5 tests were used.

## Complex number handling

- N/A: dlarnv is a real-valued routine.
