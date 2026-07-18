/**
* Property-based validation for zpftrf, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `pf` -> HPD in Rectangular Full
* Packed (RFP) storage; `trf` (Cholesky) -> RECONSTRUCTION A = FᴴF (upper) /
* F Fᴴ (lower). RFP is a storage format only, so we bridge RFP<->dense TR with
* the already-validated converters ztrttf/ztfttr and validate by the same
* property as the dense sibling zpotrf. Driven by the shared RFP-PD family
* harness (test/harness/pffamily.js); swept over transr x uplo x N and fuzzed
* for bit-exact RFP layout invariance (L3). For complex RFP the transposed
* variant is the conjugate transpose ('C').
*/

import { scalar as S } from '../../../../../test/harness/index.js';
import { family } from '../../../../../test/harness/pffamily.js';
import zpftrf from './../lib/ndarray.js';
import ztrttf from '../../ztrttf/lib/ndarray.js';
import ztfttr from '../../ztfttr/lib/ndarray.js';

var drivers = family(
	S.complex,
	{ 'trttf': ztrttf, 'tfttr': ztfttr },
	{ 'pftrf': zpftrf },
	[ 'no-transpose', 'conjugate-transpose' ]
);

drivers.pftrf.sweep( 'zpftrf' );
drivers.pftrf.invariance( 'zpftrf' );
