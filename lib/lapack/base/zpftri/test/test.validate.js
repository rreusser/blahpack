/**
* Property-based validation for zpftri, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `pf` -> HPD in Rectangular Full
* Packed (RFP) storage; `tri` (inverse from the Cholesky factor) ->
* RECONSTRUCTION A0 * inv(A0) = I (backward-error residual). The factor is
* produced by the already-validated zpftrf; the inverse is conjugate-mirrored to
* a full Hermitian matrix via the RFP<->TR converters ztrttf/ztfttr. Driven by
* the shared RFP-PD family harness (test/harness/pffamily.js); swept over
* transr x uplo x N and fuzzed for bit-exact RFP layout invariance (L3).
*/

import { scalar as S } from '../../../../../test/harness/index.js';
import { family } from '../../../../../test/harness/pffamily.js';
import zpftri from './../lib/ndarray.js';
import zpftrf from '../../zpftrf/lib/ndarray.js';
import ztrttf from '../../ztrttf/lib/ndarray.js';
import ztfttr from '../../ztfttr/lib/ndarray.js';

var drivers = family(
	S.complex,
	{ 'trttf': ztrttf, 'tfttr': ztfttr },
	{ 'pftrf': zpftrf, 'pftri': zpftri },
	[ 'no-transpose', 'conjugate-transpose' ]
);

drivers.pftri.sweep( 'zpftri' );
drivers.pftri.invariance( 'zpftri' );
