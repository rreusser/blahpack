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
import ndarray from './ndarray.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a real generalized symmetric-definite banded eigenproblem A_x = lambda_B_x.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('no-vectors'|'compute-vectors')} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {MatrixTriangle} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {NonNegativeInteger} ka - number of super- (or sub-) diagonals of A
* @param {NonNegativeInteger} kb - number of super- (or sub-) diagonals of B
* @param {Float64Array} AB - band matrix A in band storage
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} BB - band matrix B in band storage
* @param {PositiveInteger} LDBB - leading dimension of `BB`
* @param {Float64Array} w - output array for eigenvalues
* @param {integer} strideW - `w` stride length
* @param {Float64Array} Z - output matrix for eigenvectors
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {(Float64Array|null)} WORK - workspace array
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} third argument must be a valid matrix triangle
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument is invalid (rejected when `kb < 0 || kb > ka`)
* @throws {RangeError} eighth argument must be greater than or equal to `ka + 1` (column-major)
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} tenth argument must be greater than or equal to `kb + 1` (column-major)
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} fourteenth argument is invalid (rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < N )`)
* @returns {integer} status code (0 = success)
*/
function dsbgv( order, jobz, uplo, N, ka, kb, AB, LDAB, BB, LDBB, w, strideW, Z, LDZ, WORK ) {
	let sbb1, sbb2, sab1, sab2, sz1, sz2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( jobz !== 'no-vectors' && jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobz ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( ka < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', ka ) );
	}
	if ( kb < 0 || kb > ka ) {
		throw new RangeError( format( 'invalid argument. Sixth argument is invalid (rejected when `kb < 0 || kb > ka`). Value: `%d`.', kb ) );
	}
	if ( order === 'column-major' && ( LDAB < ka + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to %d. Value: `%d`.', ka + 1, LDAB ) );
	}
	if ( order === 'row-major' && ( LDAB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDAB ) );
	}
	if ( order === 'column-major' && ( LDBB < kb + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to %d. Value: `%d`.', kb + 1, LDBB ) );
	}
	if ( order === 'row-major' && ( LDBB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDBB ) );
	}
	if ( LDZ < 1 || ( jobz === 'compute-vectors' && LDZ < N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument is invalid (rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < N )`). Value: `%d`.', LDZ ) );
	}
	if ( order === 'column-major' ) {
		sab1 = 1;
		sab2 = LDAB;
		sbb1 = 1;
		sbb2 = LDBB;
		sz1 = 1;
		sz2 = LDZ;
	} else {
		sab1 = LDAB;
		sab2 = 1;
		sbb1 = LDBB;
		sbb2 = 1;
		sz1 = LDZ;
		sz2 = 1;
	}
	const ow = stride2offset( N, strideW );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 3 * N );
		WORK = new Float64Array( minWork );
	}
	return ndarray( jobz, uplo, N, ka, kb, AB, sab1, sab2, 0, BB, sbb1, sbb2, 0, w, strideW, ow, Z, sz1, sz2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default dsbgv;
