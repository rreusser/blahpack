
/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the infinity norm condition number for a complex symmetric indefinite matrix with x scaling.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} uplo - specifies the operation type
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} AF - input matrix
* @param {PositiveInteger} LDAF - leading dimension of `AF`
* @param {Int32Array} IPIV - input array
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Float64Array} x - input array
* @param {integer} strideX - stride length for `x`
* @param {Float64Array} WORK - input array
* @param {integer} strideWork - stride length for `WORK`
* @param {Float64Array} RWORK - output array
* @param {integer} strideRWork - stride length for `RWORK`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} Second argument must be a valid matrix triangle
* @throws {RangeError} Third argument must be a nonnegative integer
* @throws {RangeError} Fifth argument must be greater than or equal to max(1,N)
* @throws {RangeError} Seventh argument must be greater than or equal to max(1,N)
* @returns {number} result
*/
function zla_syrcond_x( order, uplo, N, A, LDA, AF, LDAF, IPIV, strideIPIV, offsetIPIV, x, strideX, WORK, strideWork, RWORK, strideRWork ) { // eslint-disable-line max-len, max-params
	var saf1;
	var saf2;
	var sa1;
	var sa2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && LDAF < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDAF ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		saf1 = 1;
		saf2 = LDAF;
	} else {
		sa1 = LDA;
		sa2 = 1;
		saf1 = LDAF;
		saf2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 2 * N );
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
		strideRWork = 1;
	}
	return base( uplo, N, A, sa1, sa2, 0, AF, saf1, saf2, 0, IPIV, strideIPIV, offsetIPIV, x, strideX, 0, WORK, strideWork, 0, RWORK, strideRWork, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zla_syrcond_x;
