// target: lib/lapack/dgeevx/lib/strided.js
// expect: The WORK length guard must throw
// A backtick between the name and `array` defeats the replay's `(\w+) array must have` (ticket 0108).
/* eslint-disable max-len, max-params */

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';

function dgeevx( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, wr, strideWR, offsetWR, wi, strideWI, offsetWI, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, ilo, ihi, scale, strideSCALE, offsetSCALE, abnrm, rconde, strideRCONDE, offsetRCONDE, rcondv, strideRCONDV, offsetRCONDV, work, strideWork, offsetWork, iwork, strideIwork, offsetIwork ) {
	const minWork = Math.max( 1, 3 * N );
	const minIwork = Math.max( 0, ( 2 * N ) - 2 );
	if ( ( work.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. `work` array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, work.length ) );
	}
	if ( ( iwork.length - offsetIwork ) < minIwork ) {
		throw new RangeError( format( 'invalid argument. iwork array must have at least %d elements from offset %d. Provided length: %d.', minIwork, offsetIwork, iwork.length ) );
	}
	return base( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, wr, strideWR, offsetWR, wi, strideWI, offsetWI, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, ilo, ihi, scale, strideSCALE, offsetSCALE, abnrm, rconde, strideRCONDE, offsetRCONDE, rcondv, strideRCONDV, offsetRCONDV, work, strideWork, offsetWork, iwork, strideIwork, offsetIwork );
}

export default dgeevx;
