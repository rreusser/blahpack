/**
* Property-based validation for zpftrs, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `pf` -> HPD in Rectangular Full
* Packed (RFP) storage; `trs` (Cholesky solve, multiple RHS) -> RESIDUAL
* ‖A0*X - B0‖ per RHS against the ORIGINAL full Hermitian A0. The solve consumes
* a factorization produced by the already-validated zpftrf. Driven by the shared
* RFP-PD family harness (test/harness/pffamily.js); swept over
* transr x uplo x N x nrhs and fuzzed for bit-exact RFP x B layout invariance (L3).
*/

import { scalar as S } from '../../../../../test/harness/index.js';
import { family } from '../../../../../test/harness/pffamily.js';
import zpftrs from './../lib/ndarray.js';
import zpftrf from '../../zpftrf/lib/ndarray.js';
import ztrttf from '../../ztrttf/lib/ndarray.js';
import ztfttr from '../../ztfttr/lib/ndarray.js';

const drivers = family(
	S.complex,
	{ 'trttf': ztrttf, 'tfttr': ztfttr },
	{ 'pftrf': zpftrf, 'pftrs': zpftrs },
	[ 'no-transpose', 'conjugate-transpose' ]
);

drivers.pftrs.sweep( 'zpftrs' );
drivers.pftrs.invariance( 'zpftrs' );
