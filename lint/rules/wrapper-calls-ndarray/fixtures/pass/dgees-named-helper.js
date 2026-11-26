// target: lib/lapack/base/dgees/lib/dgees.js
// A named helper from base.js (sizing the `null` allocation) may still be imported; only the default (the algorithm) may not.
/* eslint-disable max-len, max-params */

import ndarray from './ndarray.js';
import { computeOptimalWorkSize } from './base.js';

function dgees( order, jobvs, sort, select, N, A, LDA, sdim, WR, strideWR, WI, strideWI, VS, LDVS, WORK, BWORK, strideBWORK ) {
	if ( WORK === null ) {
		WORK = new Float64Array( computeOptimalWorkSize( N ) );
	}
	return ndarray( jobvs, sort, select, N, A, 1, LDA, 0, sdim, WR, strideWR, 0, WI, strideWI, 0, VS, 1, LDVS, 0, WORK, 1, 0, BWORK, strideBWORK, 0 );
}

export default dgees;
