/**
* Property-based validation for dpftrs, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `pf` -> SPD in Rectangular Full
* Packed (RFP) storage; `trs` (Cholesky solve, multiple RHS) -> RESIDUAL
* ‖A0*X - B0‖ per RHS against the ORIGINAL full symmetric A0. The solve consumes
* a factorization produced by the already-validated dpftrf. Driven by the shared
* RFP-PD family harness (test/harness/pffamily.js); swept over
* transr x uplo x N x nrhs and fuzzed for bit-exact RFP x B layout invariance (L3).
*/

import { scalar as S } from '../../../../../test/harness/index.js';
import { family } from '../../../../../test/harness/pffamily.js';
import dpftrs from './../lib/ndarray.js';
import dpftrf from '../../dpftrf/lib/ndarray.js';
import dtrttf from '../../dtrttf/lib/ndarray.js';
import dtfttr from '../../dtfttr/lib/ndarray.js';

var drivers = family(
	S.real,
	{ 'trttf': dtrttf, 'tfttr': dtfttr },
	{ 'pftrf': dpftrf, 'pftrs': dpftrs },
	[ 'no-transpose', 'transpose' ]
);

drivers.pftrs.sweep( 'dpftrs' );
drivers.pftrs.invariance( 'dpftrs' );
