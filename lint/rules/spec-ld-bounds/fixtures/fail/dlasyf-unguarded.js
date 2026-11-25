// target: lib/lapack/base/dlasyf/lib/dlasyf.js
// expect: layout
// W is N by nb: one bound for both layouts is too strict in row-major (needs only nb).
/* eslint-disable max-len, max-params */

import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';

function dlasyf( order, uplo, N, nb, kb, A, LDA, IPIV, strideIPIV, W, LDW ) {
	if ( LDW < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDW ) );
	}
	return base( uplo, N, nb, kb, A, 1, LDA, 0, IPIV, strideIPIV, 0, W, 1, LDW, 0 );
}

export default dlasyf;
