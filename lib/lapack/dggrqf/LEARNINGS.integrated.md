# LEARNINGS: dggrqf

## Translation pitfalls

- N/A -- dggrqf is a thin wrapper that delegates to dgerqf, dormrq, and dgeqrf in sequence. The only subtlety is the offset calculation for the A matrix passed to dormrq: it must point to row max(0, M-N) to select the last min(M,N) rows of A which contain the RQ reflectors.

## Dependency interface surprises

- dormrq takes string arguments ('right', 'transpose') for the side and trans parameters, consistent with the stdlib-js convention of using full descriptive strings rather than single-character Fortran flags.

## Missing automation

- N/A -- the scaffold generator handled the module structure correctly.

## Coverage gaps

- N/A -- all code paths are covered by the test fixtures (basic_3x3, m_lt_n, m_gt_n, m_zero, m_one, p_gt_n).

## Complex number handling

- N/A: dggrqf is a real-valued routine.
