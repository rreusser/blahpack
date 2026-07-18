/**
* Property-based validation for dtfttp, following /blahpack-validate.
*
* Step 0 classification: `d` -> real scalar; storage-format
* CONVERSION in the triangular tr/tf/tp family (TR dense, RFP, packed). These are
* pure ADDRESS moves (no arithmetic),
* i.e. exact bijections. Validated by ROUND-TRIP identity and CROSS-PATH
* agreement (kind 'reconstruct'), asserted BIT-EXACT (Object.is), swept over
* transr x uplo x size and fuzzed across ALL storage layouts (kind
* 'layout-invariance'). NaN-poisoned unused slots turn any out-of-bounds /
* unwritten read into an assertFinite failure. See test/harness/convfamily.js
* and test/harness/LEARNINGS.md.
*/

import { scalar as S } from '../../../../../test/harness/index.js';
import { family } from '../../../../../test/harness/convfamily.js';
import dtrttf from '../../dtrttf/lib/ndarray.js';
import dtfttr from '../../dtfttr/lib/ndarray.js';
import dtrttp from '../../dtrttp/lib/ndarray.js';
import dtpttr from '../../dtpttr/lib/ndarray.js';
import dtfttp from '../../dtfttp/lib/ndarray.js';
import dtpttf from '../../dtpttf/lib/ndarray.js';

const SUBJECT = 'dtfttp';
const fam = family( S.real, {
	'trttf': dtrttf,
	'tfttr': dtfttr,
	'trttp': dtrttp,
	'tpttr': dtpttr,
	'tfttp': dtfttp,
	'tpttf': dtpttf
}, [ 'no-transpose', 'transpose' ] );

// Tight (canonical) layouts for the correctness sweep:
const DT = { 'order': 'col' };
const LT = { 'stride': 1, 'lead': 0, 'tail': 0 };

fam.sweep( SUBJECT, 'round-trip RFP->TP->RFP', function fn( n, transr, uplo ) {
	return fam.rtRFP( n, transr, uplo, LT, LT, LT );
});
fam.sweep( SUBJECT, 'round-trip TP->RFP->TP', function fn( n, transr, uplo ) {
	return fam.rtTPid( n, transr, uplo, LT, LT, LT );
});
fam.sweep( SUBJECT, 'cross-path TP (direct vs via RFP)', function fn( n, transr, uplo ) {
	return fam.crossTP( n, transr, uplo, DT, LT, LT, LT );
});
fam.invariance( SUBJECT, 'round-trip RFP', function build( transr, uplo, d, l ) {
	return fam.rtRFP( 12, transr, uplo, l, l, l );
});
