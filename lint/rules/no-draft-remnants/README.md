# `no-draft-remnants`

Disallow drafting remnants in comments.

**Files:** every linted module source file

Rejects comments written in drafting voice ("Let me redo", "Actually, …",
"Wait -", "Hmm", "wrong:", "need to fix"), left over from working a
translation out in place. Such a comment marks code written by trial and
error, and the code needs checking, not just the comment. In `zhbgst`, a
"wrong:" draft line still ran before its replacement and corrupted a result
(ticket 0054; `test/harness/LEARNINGS.md`, 2026-11-20).

To fix: check the code the comment describes against the Fortran, then
replace the working-out with its conclusion (e.g. "Fortran: II = II - I - 1,
with Fortran I = i + 1").

Examples of accepted and rejected code are in [`fixtures/pass`](fixtures/pass) and
[`fixtures/fail`](fixtures/fail). Run `node --test lint/rules/no-draft-remnants/test.cjs`.
