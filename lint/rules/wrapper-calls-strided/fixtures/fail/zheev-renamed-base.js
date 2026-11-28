// target: lib/lapack/zheev/lib/zheev.js
// expect: base
// The default import of base.js is rejected under any local name, even alongside a named helper.
/* eslint-disable max-len, max-params */

import algo, { computeOptimalWorkSize } from './base.js';

function zheev( order, jobz, uplo, N, A, LDA, w, strideW, WORK, RWORK ) {
	if ( WORK === null ) {
		WORK = new Float64Array( 2 * computeOptimalWorkSize( N ) );
	}
	return algo( jobz, uplo, N, A, 1, LDA, 0, w, strideW, 0, WORK, 1, 0, RWORK, 1, 0 );
}

export default zheev;
