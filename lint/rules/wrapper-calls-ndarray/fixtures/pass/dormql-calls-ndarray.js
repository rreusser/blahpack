// target: lib/lapack/base/dormql/lib/dormql.js
// The wrapper of a routine with a workspace calls ndarray.js, which checks a caller's WORK against the minimum.
/* eslint-disable max-len, max-params */

import ndarray from './ndarray.js';

function dormql( order, side, trans, M, N, K, A, LDA, TAU, strideTAU, C, LDC, WORK ) {
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const sc1 = ( order === 'column-major' ) ? 1 : LDC;
	const sc2 = ( order === 'column-major' ) ? LDC : 1;
	if ( WORK === null ) {
		WORK = new Float64Array( 4160 + ( 64 * Math.max( 1, N ) ) );
	}
	return ndarray( side, trans, M, N, K, A, sa1, sa2, 0, TAU, strideTAU, 0, C, sc1, sc2, 0, WORK, 1, 0 );
}

export default dormql;
