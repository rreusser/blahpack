

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
* @param {NonNegativeInteger} nrhs - nrhs
* @param {Float64Array} d - d
* @param {integer} strideD - strideD
* @param {Complex128Array} e - e
* @param {integer} strideE - strideE
* @param {Complex128Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zpttrs( uplo, N, nrhs, d, strideD, e, strideE, B, LDB ) { // eslint-disable-line max-len, max-params
	var sb1;
	var sb2;
	var od;
	var oe;

	sb1 = 1;
	sb2 = LDB;
	od = stride2offset( N, strideD );
	oe = stride2offset( N, strideE );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	return base( uplo, N, nrhs, d, strideD, od, e, strideE, oe, B, sb1, sb2, 0 );
}


// EXPORTS //

export default zpttrs;
