# zlargv: Translation Learnings

## Translation pitfalls

- Both X and Y are Complex128Array in zlargv (unlike the d* counterpart where all arrays are Float64Array). Initial confusion from the prompt suggesting Y was Float64Array.
- The Fortran uses statement functions ABS1(FF) and ABSSQ(FF) -- these must be inlined as local expressions, not separate function calls.
- The GOTO-based overflow/underflow scaling loops translated naturally to while loops. The early-exit GOTO 50 for the g==CZERO case in the underflow branch translates to a `continue` after writing outputs.

## Dependency interface surprises

- dlapy2 is straightforward: `dlapy2(x, y)` returns `sqrt(x^2 + y^2)` safely. No calling convention gotchas.
- No cmplx.js needed for this routine -- all complex arithmetic is addition, subtraction, multiplication by real, and explicit component-wise operations. No complex division or absolute value requiring library calls.

## Automation opportunities

- N/A -- the init_routine.py + gen_test.py pipeline worked well for this routine.

## Coverage gaps

- All branches covered (100% line, 100% branch). The ABS1(F) > 1 branch in the f-small path required carefully constructed inputs with overflow scaling (f=(2,0), g=(1e200,0)) to trigger the combined condition f2 <= max(g2,1)*SAFMIN AND ABS1(f) > 1 after scaling.

## Complex number handling

- All complex arithmetic was inlined (addition, subtraction, multiplication, conjugation, real-scalar scaling). No cmplx.div or cmplx.abs needed since the Fortran source explicitly avoids complex division by using dlapy2 for magnitudes and component-wise division by real scalars.
- The reinterpret pattern works well: `xv = reinterpret(x, 0)` at function entry, then stride*2 and offset*2 for Float64 indexing throughout.
- Complex multiply by real (e.g., `f2srt * fs`) is just two real multiplies on the components.
- Complex conjugation for `conj(gs)` is just negating the imaginary component before multiplying.
