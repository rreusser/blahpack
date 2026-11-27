# dlags2: Translation Learnings

## Translation pitfalls

- Pure scalar routine: no arrays, no strides, no offsets. Returns an object with 6 fields.
- dlartg returns [cs, sn, r] in an output array (not an object); remember index 0=cs, 1=sn, 2=r.
- dlasv2 returns an object with fields ssmin, ssmax, snr, csr, snl, csl.
- The upper vs lower branches differ in which SVD result row is used to compute Q (row 1 vs row 2), and the sign assignments to CSU/SNU/CSV/SNV differ correspondingly.

## Dependency interface surprises

- dlartg takes an output array `out`, not separate out params.
- dlasv2 returns an object; the Fortran calls it with separate output arguments.

## Missing automation

- N/A -- straightforward scalar routine.

## Coverage gaps

- The "else" branch in each upper/lower case (lines ~133-174 for upper, ~205-240 for lower) requires inputs where |CSL| < |SNL| AND |CSR| < |SNR| (or the symmetric condition for lower). These represent rare near-degenerate cases in the SVD decomposition. Adding pathological test inputs would improve branch coverage.

## Complex number handling

- N/A -- real-only routine.
