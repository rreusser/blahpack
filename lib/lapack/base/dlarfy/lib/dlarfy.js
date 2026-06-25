/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies an elementary reflector, or Householder matrix, H, to an N-by-N symmetric matrix C, from both sides.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} uplo - specifies whether the upper or lower triangular part of C is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix C
* @param {Float64Array} v - reflector vector
* @param {integer} strideV - stride for `v`
* @param {number} tau - scalar factor
* @param {Float64Array} C - symmetric matrix (modified in-place)
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {Float64Array} WORK - workspace array of length `N`
* @param {integer} strideWORK - stride for `WORK`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to max(1,N)
* @returns {Float64Array} `C`
*/
function dlarfy( order, uplo, N, v, strideV, tau, C, LDC, WORK, strideWORK ) {
	var sc1;
	var sc2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDC < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDC ) );
	}
	if ( order === 'column-major' ) {
		sc1 = 1;
		sc2 = LDC;
	} else {
		sc1 = LDC;
		sc2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, N );
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	return base( uplo, N, v, strideV, 0, tau, C, sc1, sc2, 0, WORK, strideWORK, 0 );
}


// EXPORTS //

export default dlarfy;
