# `spec-ld-bounds`

**Every leading-dimension bound a layout wrapper (`<routine>.js`) throws on is
a spec check, or the array's storage extent from the spec.** (CONVENTIONS V5,
V11; ticket 0087.)

`spec-prologue` generates the reference's own LD checks (`INFO = -k`). Many
wrappers also throw on LD bounds the reference never checks, often scaffold
defaults (`max( 1, M )` / `max( 1, N )`). Those can be wrong in either
direction:

- **Too strict.** `dlangb` rejected `LDAB < max( 1, N )`, but band storage has
  `KL+KU+1` rows, so it refused calls LAPACK accepts. The `.ndarray` form took
  the same data without complaint.
- **Too lax.** `zlarcm` checked row-major `LDB < max( 1, M )`, but row-major B
  (M by N) needs N.

The rule accepts an `if ( <test> ) { throw … }` whose test reads an LD argument
(`LDX <`) only when it is one of these:

| Accepted | Example |
| --- | --- |
| A generated prologue check (`lint/lib/prologue.cjs`), with its row-major restatement | `order === 'column-major' && LDA < max( 1, M )` from `LDA.LT.MAX(1,M)` |
| A check on an LD that the reference checks but the spec could not translate (`js: null`) or reduce (a 2-D workspace LD noted `workspace check for LDWORK …`) | dgghrd `( ILQ .AND. LDQ.LT.N ) .OR. LDQ.LT.1`; dtrsna `LDWORK` |
| `LDX < max( 1, R )` with R the array's `rows` (column-major) or `cols` (row-major) from `spec/<routine>.json` | dlangb `order === 'column-major' && LDAB < max( 1, KL + KU + 1 )` |
| The same bound with no layout guard, when rows and cols are the same expression | `LDA < max( 1, N )` for an N by N A |

The layout is read from a leading `order === '<layout>' &&` in the test, or from
an enclosing `if ( order === '<layout>' )`, whose `else` is the other layout. A
spec extent already written `max( N, 1 )` counts as `N`. Names compare the
way the wrapper spells them (S7), so `m` and `M` are the same argument.

Reports:

- **`bound`**: the bound is not the array's extent, or the test is more than a
  single `LDX < max( 1, … )`. Make it the spec bound, or remove it.
- **`layout`**: one bound for both layouts on a non-square array. It is too
  strict in one of them. Check each layout, or remove the check.
- **`nobound`**: the spec gives no rows (or cols) for the array, so no bound
  can be derived. Remove the check. The reference does not check it either, so
  that is faithful. Fix the spec if the bound matters.

**What the rule cannot see.** The spec records one extent per array. When the
reference makes the extent depend on an option (STOREV, SIDE, WANTZ/WANTQ), a
check that matches the spec can still be wrong for the other case. dtprfb's
`LDV`, for example, is M, N or K depending on STOREV and SIDE. Leave those
arrays unchecked (ticket 0088).

Fix: there is no codemod. Make the check the bound the message names, or
delete it.
