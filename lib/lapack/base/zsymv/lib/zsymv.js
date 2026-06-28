

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} uplo - uplo
* @param {NonNegativeInteger} N - N
* @param {Complex128} alpha - alpha
* @param {Complex128Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} x - x
* @param {integer} strideX - strideX
* @param {Complex128} beta - beta
* @param {Complex128Array} y - y
* @param {integer} strideY - strideY
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Complex128Array} output array
*/
function zsymv( uplo, N, alpha, A, LDA, x, strideX, beta, y, strideY ) { // eslint-disable-line max-len, max-params
	var sa1;
	var sa2;
	var ox;
	var oy;

	sa1 = 1;
	sa2 = LDA;
	ox = stride2offset( N, strideX );
	oy = stride2offset( N, strideY );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	return base( uplo, N, alpha, A, sa1, sa2, 0, x, strideX, ox, beta, y, strideY, oy );
}


// EXPORTS //

export default zsymv;
