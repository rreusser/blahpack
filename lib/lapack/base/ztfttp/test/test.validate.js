/**
* Property-based validation for ztfttp, following /blahpack-validate.
*
* Step 0 classification: `z` -> complex scalar; storage-format
* CONVERSION in the triangular tr/tf/tp family (TR dense, RFP, packed). These are
* pure ADDRESS moves (no arithmetic; the RFP conjugate-transpose variant only conjugates),
* i.e. exact bijections. Validated by ROUND-TRIP identity and CROSS-PATH
* agreement (kind 'reconstruct'), asserted BIT-EXACT (Object.is), swept over
* transr x uplo x size and fuzzed across ALL storage layouts (kind
* 'layout-invariance'). NaN-poisoned unused slots turn any out-of-bounds /
* unwritten read into an assertFinite failure. See test/harness/convfamily.js
* and test/harness/LEARNINGS.md.
*/

import { scalar as S } from '../../../../../test/harness/index.js';
import { family } from '../../../../../test/harness/convfamily.js';
import ztrttf from '../../ztrttf/lib/ndarray.js';
import ztfttr from '../../ztfttr/lib/ndarray.js';
import ztrttp from '../../ztrttp/lib/ndarray.js';
import ztpttr from '../../ztpttr/lib/ndarray.js';
import ztfttp from '../../ztfttp/lib/ndarray.js';
import ztpttf from '../../ztpttf/lib/ndarray.js';

var SUBJECT = 'ztfttp';
var fam = family( S.complex, {
	'trttf': ztrttf,
	'tfttr': ztfttr,
	'trttp': ztrttp,
	'tpttr': ztpttr,
	'tfttp': ztfttp,
	'tpttf': ztpttf
}, [ 'no-transpose', 'conjugate-transpose' ] );

// Tight (canonical) layouts for the correctness sweep:
var DT = { 'order': 'col' };
var LT = { 'stride': 1, 'lead': 0, 'tail': 0 };

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
