// target: lib/lapack/base/dsytrd/lib/ndarray.js
// A minimum of 1 passed as a `%d` argument is the canonical form (ticket 0108).
/* eslint-disable max-len, max-params */

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';

function dsytrd( uplo, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	if ( WORK.length < offsetWork + 1 ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', 1, offsetWork, WORK.length ) );
	}
	return base( uplo, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
}

export default dsytrd;
