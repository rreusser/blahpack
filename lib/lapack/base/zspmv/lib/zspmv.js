

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs the symmetric packed matrix-vector operation `y := alpha*A*x + beta*y`.
*
* @param {string} uplo - specifies whether upper or lower triangle is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128} alpha - complex scalar multiplier for `A*x`
* @param {Complex128Array} AP - packed symmetric matrix
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {Complex128Array} x - complex input vector
* @param {integer} strideX - stride length for `x` (in complex elements)
* @param {Complex128} beta - complex scalar multiplier for `y`
* @param {Complex128Array} y - complex input/output vector
* @param {integer} strideY - stride length for `y` (in complex elements)
* @returns {Complex128Array} `y`
*/
function zspmv( uplo, N, alpha, AP, strideAP, x, strideX, beta, y, strideY ) { // eslint-disable-line max-len, max-params
	var oap;
	var ox;
	var oy;

	oap = stride2offset( N, strideAP );
	ox = stride2offset( N, strideX );
	oy = stride2offset( N, strideY );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, alpha, AP, strideAP, oap, x, strideX, ox, beta, y, strideY, oy );
}


// EXPORTS //

export default zspmv;
