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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import ndarray from './ndarray.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a real symmetric matrix in packed storage.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('no-vectors'|'compute-vectors')} jobz - `'no-vectors'` (eigenvalues only) or `'compute-vectors'` (eigenvalues + eigenvectors)
* @param {MatrixTriangle} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} AP - packed symmetric matrix (length N*(N+1)/2)
* @param {Float64Array} w - output array for eigenvalues (length N)
* @param {integer} strideW - stride length for `w`
* @param {Float64Array} Z - output eigenvector matrix (N x N)
* @param {PositiveInteger} LDZ - leading dimension of Z
* @param {(Float64Array|null)} WORK - workspace array (length >= 3*N)
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} third argument must be a valid matrix triangle
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} ninth argument is invalid (rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < N )`)
* @returns {integer} info - 0 if successful
*/
function dspev( order, jobz, uplo, N, AP, w, strideW, Z, LDZ, WORK ) {
	let sz1, sz2;

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
	if ( LDZ < 1 || ( jobz === 'compute-vectors' && LDZ < N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument is invalid (rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < N )`). Value: `%d`.', LDZ ) );
	}
	const ow = stride2offset( N, strideW );
	if ( order === 'column-major' ) {
		sz1 = 1;
		sz2 = LDZ;
	} else {
		sz1 = LDZ;
		sz2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 3 * N );
		WORK = new Float64Array( minWork );
	}
	return ndarray( jobz, uplo, N, AP, 1, 0, w, strideW, ow, Z, sz1, sz2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default dspev;
