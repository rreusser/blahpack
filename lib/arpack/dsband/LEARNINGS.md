# dsband: Translation Learnings

dsband is the banded symmetric driver from arpack-ng's `EXAMPLES/BAND`. Unlike
the rest of the closure it is NOT reverse-communication to its caller: it runs
the entire `dsaupd`/`dseupd` loop internally, applying the banded operators with
`dgbtrf`/`dgbtrs`/`dgbmv`, and returns once converged. So `ido`/`ipntr` are
allocated internally and there is no `state` parameter.

## The tol pass-by-reference gotcha (info = -17)

The single subtlest bug: Fortran `dsaupd` defaults `tol` to `dlamch('EPS')` when
`tol <= 0`, and because Fortran passes `tol` by reference this mutates the
driver's shared `tol`, so `dsband` later hands the SAME defaulted value to
`dseupd`. `dseupd` uses that `tol` in its reordering convergence test
(`bounds <= tol*temp1`). In JS `tol` is passed by value, so a naive translation
leaves `dsband`'s `tol` at 0, `dseupd` counts zero converged Ritz values, and
returns `info = -17` (numcnv != nconv). The fix that preserves the data flow:
`dsaupd` stores the effective (defaulted) tol on its state, and `dsband` reads
`saupd.tol` for the `dseupd` call rather than re-defaulting. First write a
verification that FAILS on the naive version (it returns -17 with d = 0), then
apply the fix.

## Fortran fixed-form operator precedence

`type .eq. 2 .or. type .eq. 6 .and. bmat .eq. 'I'` parses as
`type==2 || (type==6 && bmat=='I')` because `.and.` binds tighter than `.or.`.
Same for the `type==4 || type==5 || (type==6 && bmat=='G')` factor branch. Get
the parenthesization right or the wrong band matrix gets factored.

## Band storage and the dgbmv view offset

`AB`/`MB`/`RFAC` use LAPACK band storage with `lda = 2*kl+ku+1`: rows `1..kl`
are reserved for `dgbtrf` fill-in, the band proper lives in rows `kl+1..lda`,
and the diagonal is at row `imid = kl+ku+1`. `dgbtrf`/`dgbtrs` are passed the
array from row 1 (they expect the fill rows), but `dgbmv` is passed the view
starting at `AB(itop,1)` (offset `(kl)*strideRow`), i.e. the band WITHOUT the
fill rows. Getting these two offsets right is essential.

## ipntr conventions

The internal `ipntr` array follows the same mixed convention as the closure:
`ipntr[0..2]` are 0-based offsets into `workd` (written by `dsaupd`/`dsaitr`),
so the operator applications index `workd` at `ipntr[0]`/`ipntr[1]` directly,
and the generalized shift-invert `ido=1` path reads `B*x` at `ipntr[2]`.
`dseupd` reads the 1-based workl pointers from the same array. The verification
covers types 1 (regular standard), 2 (shift-invert standard), and 4
(shift-invert generalized) end to end; all match Fortran to ~2.6e-13 in the
eigenvalues and ~3e-15 in the (sign-aligned) eigenvectors.

## Dependencies

`dsaupd`, `dseupd` (ARPACK), plus banded LAPACK `dgbtrf`/`dgbtrs`/`dlacpy` and
BLAS `dcopy`/`daxpy`/`dgbmv`. The Fortran fixture also needs `dseupd` listed as
an explicit dep (it is a callee here, not the routine under test). Note that
`bin/scaffold.py`'s fparser front-end rejects the `c \BeginDoc` header of the
`EXAMPLES/BAND` sources, so the module skeleton was created by hand rather than
via `init_routine.py`.
