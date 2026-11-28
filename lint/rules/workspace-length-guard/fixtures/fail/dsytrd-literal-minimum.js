// target: lib/lapack/dsytrd/lib/strided.js
// expect: The WORK length guard must throw
// The minimum is a literal in the text, not a `%d` argument, so the replay reads no minimum (ticket 0108).
/* eslint-disable max-len, max-params */

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';

function dsytrd( uplo, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork ) {
	if ( WORK.length < offsetWork + 1 ) {
		throw new RangeError( format( 'invalid argument. `WORK` must have at least 1 element starting at offset %d. Length: `%d`.', offsetWork, WORK.length ) );
	}
	return base( uplo, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork );
}

export default dsytrd;
