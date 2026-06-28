

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
* @param {string} way - way
* @param {NonNegativeInteger} N - N
* @param {Complex128Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Int32Array} IPIV - IPIV
* @param {integer} strideIPIV - strideIPIV
* @param {Complex128Array} E - E
* @param {integer} strideE - strideE
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zsyconv( uplo, way, N, A, LDA, IPIV, strideIPIV, E, strideE ) { // eslint-disable-line max-len, max-params
	var oipiv;
	var sa1;
	var sa2;
	var oe;

	sa1 = 1;
	sa2 = LDA;
	oipiv = stride2offset( N, strideIPIV );
	oe = stride2offset( N, strideE );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( way !== 'convert' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `way` value. Value: `%s`.', way ) );
	}
	return base( uplo, way, N, A, sa1, sa2, 0, IPIV, strideIPIV, oipiv, E, strideE, oe );
}


// EXPORTS //

export default zsyconv;
