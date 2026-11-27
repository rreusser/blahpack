// target: lib/lapack/dormql/lib/dormql.js
// expect: base
// Calling base.js skips ndarray.js's workspace minimum: a caller's short WORK runs unchecked and the result is NaN (ticket 0077).
/* eslint-disable max-len, max-params */

import base from './base.js';

function dormql( order, side, trans, M, N, K, A, LDA, TAU, strideTAU, C, LDC, WORK ) {
	if ( WORK === null ) {
		WORK = new Float64Array( 4160 + ( 64 * Math.max( 1, N ) ) );
	}
	return base( side, trans, M, N, K, A, 1, LDA, 0, TAU, strideTAU, 0, C, 1, LDC, 0, WORK, 1, 0 );
}

export default dormql;
