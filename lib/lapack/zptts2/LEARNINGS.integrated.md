# zptts2: Translation Learnings

## Translation pitfalls

- The Fortran IUPLO convention is inverted from what you might expect: IUPLO=1 means upper (U^H*D*U), IUPLO=0 means lower (L*D*L^H). This is an integer, not a character like most LAPACK routines.
- The Fortran has two code paths per IUPLO value: one for NRHS<=2 (using a GOTO-based j-loop) and one for NRHS>2 (using a DO j-loop). Both produce identical results; the JS implementation unifies them into a single j-loop per IUPLO value, which is simpler and equally correct.
- The conjugation pattern differs between upper and lower: upper conjugates E in the forward substitution (solving U^H) and uses E directly in the backward substitution (solving U); lower uses E directly in the forward substitution (solving L) and conjugates E in the backward substitution (solving L^H).

## Dependency interface surprises

- zdscal takes complex-element strides and offsets (not Float64-based), matching the convention used here for B's strides. The N=1 quick return delegates to zdscal to scale all NRHS columns, using strideB2 as the stride (column stride in complex elements).

## Automation opportunities

- N/A. The translation was straightforward from dptts2 reference. The main work was adding complex arithmetic inline (safe: only multiplication, addition, subtraction, and real division).

## Coverage gaps

- 100% line and 100% branch coverage achieved. All code paths exercised: IUPLO=0, IUPLO=1, NRHS=1, NRHS=2, NRHS=3, N=0, N=1.

## Complex number handling

- D is Float64Array (real diagonal), E and B are Complex128Array. Used reinterpret() at function entry to get Float64 views, then multiplied strides/offsets by 2 for Float64 indexing.
- Complex multiplication inlined throughout (safe: (a+bi)(c+di) = (ac-bd)+(ad+bc)i). No complex division, absolute value, or square root needed.
- Conjugation is a simple sign flip on the imaginary part of the E element, inlined as `ei = -ev[ie+1]`.
- Real division of complex B elements by real D is just dividing both re and im parts by the same real scalar.
