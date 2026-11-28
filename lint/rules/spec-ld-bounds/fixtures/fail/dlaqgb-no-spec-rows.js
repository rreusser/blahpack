// target: lib/lapack/dlaqgb/lib/dlaqgb.js
// expect: nobound
// The spec gives AB no rows (the LAPACK doc names LDA under LDAB), so a column-major bound cannot be derived.
/* eslint-disable max-len, max-params */

import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';

function dlaqgb( order, M, N, kl, ku, AB, LDAB, r, strideR, c, strideC, rowcnd, colcnd, amax, equed ) {
	if ( order === 'column-major' && LDAB < kl + ku + 1 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to %d. Value: `%d`.', kl + ku + 1, LDAB ) );
	}
	return base( M, N, kl, ku, AB, 1, LDAB, 0, r, strideR, 0, c, strideC, 0, rowcnd, colcnd, amax, equed );
}

export default dlaqgb;
