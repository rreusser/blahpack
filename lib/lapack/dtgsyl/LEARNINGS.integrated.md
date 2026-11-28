# dtgsyl: Translation Learnings

## Translation pitfalls

- Block partitioning uses GOTO loops in Fortran; translated to while loops with boundary adjustment when a 2x2 block straddles a block boundary (A(i,i-1) != 0 or B(j,j-1) != 0).
- The IWORK array is shared with dtgsy2: dtgsyl fills indices 0..q+1 with block boundaries, then passes offsetIWORK + (q+2)*stride to dtgsy2 for its own IWORK usage.
- ISOLVE=2 (IJOB=1 or 2) requires saving/restoring C and F via WORK array, solving twice.
- ILAENV block sizes replaced with hardcoded MB=NB=32. With small test matrices (M,N < 32), the unblocked dtgsy2 path is taken directly.
- The SCALOC != 1 scaling in the blocked path is more complex than in dtgsy2: it carefully avoids double-scaling the current block by scaling the four regions (before-cols, above-rows, below-rows, after-cols) separately.

## Dependency interface surprises

- dtgsy2 output parameters (scale, rdsum, rdscal, pq) are all array-wrapped: Float64Array for scalars, Int32Array for pq.
- dlacpy and dlaset use long-form strings ('full', 'upper', 'lower').

## Automation opportunities

- dtgsyl is structurally similar to other blocked LAPACK drivers (zunmqr, dormqr). The block partitioning pattern could be templated.

## Coverage gaps

- IJOB >= 1 paths (DIF estimation, two-solve rounds) require dlatdf in dtgsy2. Not tested.
- IJOB >= 3 paths (zero-out C,F then solve for DIF) also untested.
- The reference's block sizes are MB = ILAENV( 2, 'DTGSYL' ) = 2 and NB = ILAENV( 5 ) = 2, so the blocked path runs for any M > 2 or N > 2 (the JS used to hard-code 32). Its partition loop leaves when the 1-based I reaches M (`IF( I.GE.M )`), so a last single row/column joins the previous block; the JS loop used to make it its own block.
- The TRANS blocked path is structurally similar to NOTRAN but iterates in different order.

## Complex number handling

- N/A: dtgsyl is a real-valued routine.
