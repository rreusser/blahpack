// target: lib/lapack/dgecon/lib/strided.js
// expect: missing
// Reading IWORK.length is not a guard unless it throws RangeError (W3).
/* eslint-disable max-len, max-params */

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';

function dgecon( norm, N, A, strideA1, strideA2, offsetA, anorm, rcond, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) {
	const minWork = 4 * N;
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	if ( IWORK.length < N ) {
		throw new TypeError( 'invalid argument. IWORK is too short.' );
	}
	return base( norm, N, A, strideA1, strideA2, offsetA, anorm, rcond, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork );
}

export default dgecon;
