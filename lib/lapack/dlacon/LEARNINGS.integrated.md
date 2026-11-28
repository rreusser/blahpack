# dlacon: Translation Learnings

## Translation pitfalls

- dlacon is nearly identical to dlacn2 but uses Fortran `SAVE` statement for persistent state (JUMP, J, ITER) instead of an ISAVE array parameter. In JS, these become module-level variables.
- JLAST from Fortran is only used within the JUMP=4 case block (set and consumed in the same invocation), so it can remain a local variable rather than module-level state.
- The routine is **not reentrant** because of the module-level state. Only one norm estimation can be in progress at a time. dlacn2 should be preferred for new code.

## Dependency interface surprises

- idamax returns a 0-based index in the stdlib-js convention (unlike Fortran's 1-based), which is already handled correctly since dlacn2 established this pattern.

## Automation opportunities

- dlacon and dlacn2 share identical algorithmic logic; could potentially generate dlacon as a thin wrapper that manages its own ISAVE array internally and delegates to dlacn2's base. However, keeping them as independent implementations matches the LAPACK reference structure.

## Coverage gaps

- The Fortran SAVE state means test ordering could theoretically matter, but since KASE=0 fully reinitializes state, the tests are order-independent in practice.
- Test fixtures confirmed identical results between dlacon and dlacn2 for the same matrix inputs.

## Complex number handling

- N/A: dlacon is a real-valued routine.
