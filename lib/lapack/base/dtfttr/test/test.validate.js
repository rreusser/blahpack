/**
* Property-based validation for dtfttr, following /blahpack-validate.
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

var SUBJECT = 'dtfttr';
var fam = family( S.real, {
	'trttf': dtrttf,
	'tfttr': dtfttr,
	'trttp': dtrttp,
	'tpttr': dtpttr,
	'tfttp': dtfttp,
	'tpttf': dtpttf
}, [ 'no-transpose', 'transpose' ] );

// Tight (canonical) layouts for the correctness sweep:
var DT = { 'order': 'col' };
var LT = { 'stride': 1, 'lead': 0, 'tail': 0 };

fam.sweep( SUBJECT, 'round-trip TR->RFP->TR', function fn( n, transr, uplo ) {
	return fam.rtTF( n, transr, uplo, DT, LT, DT );
});
fam.invariance( SUBJECT, 'round-trip TR', function build( transr, uplo, d, l ) {
	return fam.rtTF( 12, transr, uplo, d, l, d );
});
