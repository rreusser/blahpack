/**
* Property-based validation for dpftrf, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `pf` -> SPD in Rectangular Full
* Packed (RFP) storage; `trf` (Cholesky) -> RECONSTRUCTION A = FᴴF (upper) /
* F Fᴴ (lower). RFP is a storage format only, so we bridge RFP<->dense TR with
* the already-validated converters dtrttf/dtfttr and validate by the same
* property as the dense sibling dpotrf. Driven by the shared RFP-PD family
* harness (test/harness/pffamily.js); swept over transr x uplo x N and fuzzed
* for bit-exact RFP layout invariance (L3).
*/

import { scalar as S } from '../../../../../test/harness/index.js';
import { family } from '../../../../../test/harness/pffamily.js';
import dpftrf from './../lib/ndarray.js';
import dtrttf from '../../dtrttf/lib/ndarray.js';
import dtfttr from '../../dtfttr/lib/ndarray.js';

var drivers = family(
	S.real,
	{ 'trttf': dtrttf, 'tfttr': dtfttr },
	{ 'pftrf': dpftrf },
	[ 'no-transpose', 'transpose' ]
);

drivers.pftrf.sweep( 'dpftrf' );
drivers.pftrf.invariance( 'dpftrf' );
