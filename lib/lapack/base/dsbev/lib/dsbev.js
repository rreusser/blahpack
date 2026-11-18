/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a real symmetric band matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super- (or sub-) diagonals
* @param {Float64Array} AB - band matrix in band storage
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} w - output array for eigenvalues
* @param {integer} strideW - `w` stride length
* @param {Float64Array} Z - output matrix for eigenvectors
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Float64Array} WORK - workspace array
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function dsbev( order, jobz, uplo, N, kd, AB, LDAB, w, strideW, Z, LDZ, WORK ) {
	let sab1, sab2, sz1, sz2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && ( LDAB < kd + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument violates the reference leading-dimension rule (column-major: rejected when `LDAB.LT.KD+1`). Value: `%d`.', LDAB ) );
	}
	if ( order === 'row-major' && ( LDAB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument violates the reference leading-dimension rule (row-major: must also cover the N columns). Value: `%d`.', LDAB ) );
	}
	if ( LDZ < 1 || ( ( jobz === 'compute-vectors' ) && LDZ < N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument violates the reference leading-dimension rule (rejected when `LDZ.LT.1 .OR. ( WANTZ .AND. LDZ.LT.N )`). Value: `%d`.', LDZ ) );
	}
	if ( jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobz` value. Value: `%s`.', jobz ) );
	}
	if ( order === 'column-major' ) {
		sab1 = 1;
		sab2 = LDAB;
		sz1 = 1;
		sz2 = LDZ;
	} else {
		sab1 = LDAB;
		sab2 = 1;
		sz1 = LDZ;
		sz2 = 1;
	}
	const ow = stride2offset( N, strideW );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, Math.max( 1, 3 * N - 2) );
		WORK = new Float64Array( minWork );
	}
	return base( jobz, uplo, N, kd, AB, sab1, sab2, 0, w, strideW, ow, Z, sz1, sz2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default dsbev;
