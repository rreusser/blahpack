# dtrexc: Translation Learnings

## Translation pitfalls

- IFST and ILST are modified on input: they snap to the first row of 2x2 blocks. Must track both as mutable values.
- IFST and ILST are 1-based throughout.
- The routine returns an object `{ info, ifst, ilst }` because all three are outputs.
- The COMPQ parameter 'V' means "update Q"; 'N' means "don't". Matched by checking for 'V' or 'v'.
- The NBF variable can take value 3 to indicate that a 2x2 block split into two 1x1 blocks during movement. This special case is handled with different dlaexc calls.

## Dependency interface surprises

- dlaexc returns a plain integer (info), not an object. Returns 1 on failure, 0 on success.

## Automation opportunities

- N/A

## Coverage gaps

- Only forward movement (ifst < ilst) with N1=1 blocks tested. Backward movement and 2x2 block cases exercised indirectly through dlaqr2.

## Complex number handling

- N/A: real routine only.
