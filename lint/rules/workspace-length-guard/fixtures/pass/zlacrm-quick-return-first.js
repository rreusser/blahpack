// target: lib/lapack/zlacrm/lib/ndarray.js
// A zero-dimension quick return before the workspace guard is the required order (W3).
/* eslint-disable max-len, max-params */

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';

function zlacrm( M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, RWORK, strideRWork, offsetRWork ) {
	if ( M === 0 || N === 0 ) {
		return C;
	}
	const minRWork = 2 * M * N;
	if ( !RWORK || ( RWORK.length - offsetRWork ) < minRWork ) {
		throw new RangeError( format( 'invalid argument. RWORK array must have at least %d elements from offset %d. Provided length: %d.', minRWork, offsetRWork, ( RWORK ) ? RWORK.length : 0 ) );
	}
	return base( M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, RWORK, strideRWork, offsetRWork );
}

export default zlacrm;
