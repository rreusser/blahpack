// target: lib/lapack/dlarfb_gett/lib/dlarfb_gett.js
// expect: bound
// A single `LD < max( 1, … )` bound only: a compound test that is not a spec check is rejected.
/* eslint-disable max-len, max-params */

import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';

function dlarfb_gett( order, ident, M, N, K, T, LDT, A, LDA, B, LDB, WORK, LDWORK ) {
	if ( order === 'row-major' && ( LDT < 1 || LDT < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument is invalid. Value: `%d`.', LDT ) );
	}
	return base( ident, M, N, K, T, LDT, 1, 0, A, LDA, 1, 0, B, LDB, 1, 0, WORK, LDWORK, 1, 0 );
}

export default dlarfb_gett;
