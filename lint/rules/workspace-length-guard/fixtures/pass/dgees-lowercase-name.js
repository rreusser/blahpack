// target: lib/lapack/dgees/lib/ndarray.js
// Names compare case-insensitively (S7): `bwork` is BWORK.
/* eslint-disable max-len, max-params */

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';

function dgees( jobvs, sort, select, N, A, strideA1, strideA2, offsetA, sdim, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VS, strideVS1, strideVS2, offsetVS, work, strideWork, offsetWork, bwork, strideBWork, offsetBWork ) {
	const minWork = Math.max( 1, 3 * N );
	if ( !work || ( work.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( work ) ? work.length : 0 ) );
	}
	const minBWork = N;
	if ( !bwork || ( bwork.length - offsetBWork ) < minBWork ) {
		throw new RangeError( format( 'invalid argument. BWORK array must have at least %d elements from offset %d. Provided length: %d.', minBWork, offsetBWork, ( bwork ) ? bwork.length : 0 ) );
	}
	return base( jobvs, sort, select, N, A, strideA1, strideA2, offsetA, sdim, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VS, strideVS1, strideVS2, offsetVS, work, strideWork, offsetWork, bwork, strideBWork, offsetBWork );
}

export default dgees;
