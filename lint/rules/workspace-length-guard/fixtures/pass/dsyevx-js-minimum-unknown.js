// target: lib/lapack/base/dsyevx/lib/ndarray.js
// WORK's spec minimum is the reference's LWKMIN check (`minLength.js` null): this rule asks only for IWORK's guard (WORK's is conf:work-assert's).
/* eslint-disable max-len, max-params */

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';

function dsyevx( jobz, range, uplo, N, A, strideA1, strideA2, offsetA, vl, vu, il, iu, abstol, m, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork, IFAIL, strideIFAIL, offsetIFAIL ) {
	const minIWork = 5 * N;
	if ( !IWORK || ( IWORK.length - offsetIWork ) < minIWork ) {
		throw new RangeError( format( 'invalid argument. IWORK array must have at least %d elements from offset %d. Provided length: %d.', minIWork, offsetIWork, ( IWORK ) ? IWORK.length : 0 ) );
	}
	return base( jobz, range, uplo, N, A, strideA1, strideA2, offsetA, vl, vu, il, iu, abstol, m, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork, IFAIL, strideIFAIL, offsetIFAIL );
}

export default dsyevx;
