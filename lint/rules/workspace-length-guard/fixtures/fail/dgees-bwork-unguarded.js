// target: lib/lapack/base/dgees/lib/ndarray.js
// expect: BWORK has no length guard
// BWORK( N ) is declared but unchecked: a short BWORK with sort = 'sort' drops its writes (ticket 0107).
/* eslint-disable max-len, max-params */

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';

function dgees( jobvs, sort, select, N, A, strideA1, strideA2, offsetA, sdim, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VS, strideVS1, strideVS2, offsetVS, WORK, strideWork, offsetWork, BWORK, strideBWork, offsetBWork ) {
	const minWork = Math.max( 1, 3 * N );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	return base( jobvs, sort, select, N, A, strideA1, strideA2, offsetA, sdim, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VS, strideVS1, strideVS2, offsetVS, WORK, strideWork, offsetWork, BWORK, strideBWork, offsetBWork );
}

export default dgees;
