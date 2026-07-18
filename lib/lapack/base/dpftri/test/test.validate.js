/**
* Property-based validation for dpftri, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `pf` -> SPD in Rectangular Full
* Packed (RFP) storage; `tri` (inverse from the Cholesky factor) ->
* RECONSTRUCTION A0 * inv(A0) = I (backward-error residual). The factor is
* produced by the already-validated dpftrf; the inverse is mirrored to a full
* symmetric matrix via the RFP<->TR converters dtrttf/dtfttr. Driven by the
* shared RFP-PD family harness (test/harness/pffamily.js); swept over
* transr x uplo x N and fuzzed for bit-exact RFP layout invariance (L3).
*/

import { scalar as S } from '../../../../../test/harness/index.js';
import { family, pureAddrRfpLayouts } from '../../../../../test/harness/pffamily.js';
import dpftri from './../lib/ndarray.js';
import dpftrf from '../../dpftrf/lib/ndarray.js';
import dtrttf from '../../dtrttf/lib/ndarray.js';
import dtfttr from '../../dtfttr/lib/ndarray.js';

var drivers = family(
	S.real,
	{ 'trttf': dtrttf, 'tfttr': dtfttr },
	{ 'pftrf': dpftrf, 'pftri': dpftri },
	[ 'no-transpose', 'transpose' ]
);

drivers.pftri.sweep( 'dpftri' );

// dpftri delegates to dlauum/dsyrk, whose unit-stride BLAS fast path reorders
// accumulation on any RFP stride change (the RFP analog of the dense dpotri/dlauum
// family; see test/harness/LEARNINGS.md 2026-07-18). It is bit-exact only across
// PURE-ADDRESSING RFP layouts (stride fixed at +1, offset/pad varied); its
// cross-stride correctness is certified by the reconstruct property swept above.
drivers.pftri.invariance( 'dpftri', pureAddrRfpLayouts() );
