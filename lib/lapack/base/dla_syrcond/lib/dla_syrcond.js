/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the Skeel condition number for a symmetric indefinite matrix.
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
* @param {integer} cmode - cmode
* @param {Float64Array} c - input array
* @param {integer} strideC - stride length for `c`
* @param {Float64Array} WORK - input array
* @param {Int32Array} IWORK - output array
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} Second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be greater than or equal to max(1,N)
* @throws {RangeError} seventh argument must be greater than or equal to max(1,N)
* @returns {number} result
*/
function dla_syrcond( order, uplo, N, A, LDA, AF, LDAF, IPIV, strideIPIV, cmode, c, strideC, WORK, IWORK ) { // eslint-disable-line max-len, max-params
	let saf1, saf2, sa1, sa2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const offsetIPIV = stride2offset( N, strideIPIV );
	const offsetIWork = 0;
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
		const minWork = 3 * N;
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
	}
	return base( uplo, N, A, sa1, sa2, 0, AF, saf1, saf2, 0, IPIV, strideIPIV, offsetIPIV, cmode, c, strideC, 0, WORK, 1, 0, IWORK, 1, offsetIWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dla_syrcond;
