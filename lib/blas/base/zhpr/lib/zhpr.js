
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} uplo - uplo
* @param {NonNegativeInteger} N - N
* @param {number} alpha - alpha
* @param {Complex128Array} x - x
* @param {integer} strideX - strideX
* @param {Complex128Array} AP - AP
* @param {integer} strideAP - strideAP
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Complex128Array} output array
*/
function zhpr( uplo, N, alpha, x, strideX, AP, strideAP ) { // eslint-disable-line max-len, max-params
	var oap;
	var ox;

	ox = stride2offset( N, strideX );
	oap = stride2offset( N, strideAP );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, alpha, x, strideX, ox, AP, strideAP, oap );
}


// EXPORTS //

export default zhpr;
