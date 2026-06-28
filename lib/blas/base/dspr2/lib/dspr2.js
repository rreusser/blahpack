
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
* @param {Float64Array} x - x
* @param {integer} strideX - strideX
* @param {Float64Array} y - y
* @param {integer} strideY - strideY
* @param {Float64Array} AP - AP
* @param {integer} strideAP - strideAP
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Float64Array} output array
*/
function dspr2( uplo, N, alpha, x, strideX, y, strideY, AP, strideAP ) { // eslint-disable-line max-len, max-params
	var oap;
	var ox;
	var oy;

	ox = stride2offset( N, strideX );
	oy = stride2offset( N, strideY );
	oap = stride2offset( N, strideAP );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, alpha, x, strideX, ox, y, strideY, oy, AP, strideAP, oap );
}


// EXPORTS //

export default dspr2;
