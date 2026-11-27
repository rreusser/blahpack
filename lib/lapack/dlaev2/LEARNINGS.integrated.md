# dlaev2: Translation Learnings

## Translation pitfalls

- Returns four values (rt1, rt2, cs1, sn1) via Fortran output parameters. In JS, return an object `{ rt1, rt2, cs1, sn1 }` following the dlanv2/dlartg pattern. This causes a signature-conformance lint warning (3 params vs Fortran's 7) which is expected.
- The eigenvector computation has a sign correction step at the end (`if sgn1 === sgn2, swap cs1 and sn1 with sign flip`). Easy to miss.
- The `ab === 0` guard (when both b=0 and cs=0) prevents division by zero. Must be checked before computing `tn = -cs / tb`.
- The hypot-style computation of `rt = sqrt(df^2 + (2b)^2)` has three branches (adf > ab, adf < ab, adf === ab) to avoid overflow. The third branch also handles the adf === ab === 0 case.

## Dependency interface surprises

- N/A - dlaev2 has no dependencies. It is a leaf routine.

## Automation opportunities

- The eigenvalue portion of dlaev2 is identical to dlae2. A future refactor could share this code, but the Fortran reference keeps them separate.

## Coverage gaps

- 100% line and branch coverage achieved. All branches are covered: eigenvalue computation (sm < 0, sm > 0, sm = 0), hypot branches (adf > ab, adf < ab, adf === ab), eigenvector computation (acs > ab, ab = 0, else), and sign correction (sgn1 = sgn2 vs not).

## Complex number handling

- N/A - real-only routine. The complex analogue is zlaev2.
