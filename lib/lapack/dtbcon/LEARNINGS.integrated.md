# dtbcon: Translation Learnings

## Translation pitfalls

- dtbcon is almost identical to dtrcon but uses band storage (dlantb, dlatbs) instead of full storage (dlantr, dlatrs).
- WORK layout uses three N-sized regions: x (dlacn2/dlatbs RHS), v (dlacn2 workspace), CNORM (dlatbs column norms).
- The Fortran ISAVE(3) array for dlacn2 state must be allocated separately (Int32Array) rather than sharing IWORK.

## Dependency interface surprises

- dlatbs returns info via the return value (not a separate parameter) and uses a Float64Array(1) for the scale factor, consistent with dlatrs.
- dlacn2 uses KASE and EST as single-element typed arrays for reverse communication state.

## Automation opportunities

- The pattern of reverse-communication condition estimation (dlacn2 loop + dlatbs/dlatrs + drscl) is shared by dtrcon, dtpcon, dpbcon, dtbcon. Could be extracted into a shared helper.

## Coverage gaps

- Singular matrices (anorm=0 path) are implicitly covered by the rcond=0.0 early return but not explicitly tested.
- The overflow-guard path (scale < xnorm*smlnum) is hard to trigger without extreme matrices.

## Complex number handling

- N/A: dtbcon is a real-valued routine.
