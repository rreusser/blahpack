
/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the infinity norm condition number for a complex general banded matrix with inverse-c scaling.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} trans - `'no-transpose'` or `'conjugate-transpose'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {Complex128Array} AB - original banded matrix in band storage
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Complex128Array} AFB - LU factored banded matrix from `zgbtrf`
* @param {PositiveInteger} LDAFB - leading dimension of `AFB`
* @param {Int32Array} IPIV - pivot indices from `zgbtrf`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Float64Array} c - real scaling vector of length `N`
* @param {integer} strideC - stride length for `c`
* @param {boolean} capply - if `true`, scale by `inv(diag(C))`
* @param {Complex128Array} WORK - complex workspace of length at least `2*N`
* @param {integer} strideWORK - stride length for `WORK`
* @param {Float64Array} RWORK - real workspace of length at least `N`
* @param {integer} strideRWORK - stride length for `RWORK`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} Second argument must be a valid transpose operation
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be greater than or equal to max(1, N)
* @throws {RangeError} ninth argument must be greater than or equal to max(1, N)
* @returns {number} estimated reciprocal infinity-norm condition number
*/
function zla_gbrcond_c( order, trans, N, kl, ku, AB, LDAB, AFB, LDAFB, IPIV, strideIPIV, offsetIPIV, c, strideC, capply, WORK, strideWORK, RWORK, strideRWORK ) { // eslint-disable-line max-len, max-params
	var safb1;
	var safb2;
	var sab1;
	var sab2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( order === 'row-major' && LDAFB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAFB ) );
	}
	if ( order === 'column-major' ) {
		sab1 = 1;
		sab2 = LDAB;
		safb1 = 1;
		safb2 = LDAFB;
	} else {
		sab1 = LDAB;
		sab2 = 1;
		safb1 = LDAFB;
		safb2 = 1;
	}
	return base( trans, N, kl, ku, AB, sab1, sab2, 0, AFB, safb1, safb2, 0, IPIV, strideIPIV, offsetIPIV, c, strideC, 0, capply, WORK, strideWORK, 0, RWORK, strideRWORK, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zla_gbrcond_c;
