// target: lib/lapack/base/dgecon/lib/ndarray.js
// A guard inside a zero-dimension condition counts: at N = 0 the JS may accept less (W3).
/* eslint-disable max-len, max-params */

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';

function dgecon( norm, N, A, strideA1, strideA2, offsetA, anorm, rcond, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) {
	if ( N > 0 ) {
		const minWork = 4 * N;
		if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
		if ( !IWORK || ( IWORK.length - offsetIWork ) < N ) {
			throw new RangeError( format( 'invalid argument. IWORK array must have at least %d elements from offset %d. Provided length: %d.', N, offsetIWork, ( IWORK ) ? IWORK.length : 0 ) );
		}
	}
	return base( norm, N, A, strideA1, strideA2, offsetA, anorm, rcond, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork );
}

export default dgecon;
