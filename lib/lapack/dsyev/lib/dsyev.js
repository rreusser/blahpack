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
import strided from './strided.js';
import { computeOptimalWorkSize } from './base.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a real symmetric matrix.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('no-vectors'|'compute-vectors')} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {MatrixTriangle} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} w - output eigenvalues
* @param {integer} strideW - `w` stride length
* @param {(Float64Array|null)} WORK - workspace (length >= `max( 1, 3*N-1 )`; `(NB+2)*N`, with NB from `ilaenv`, is optimal); if `null`, a workspace of optimal size is allocated
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} third argument must be a valid matrix triangle
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, N )`
* @returns {integer} info status code
*/
function dsyev( order, jobz, uplo, N, A, LDA, w, strideW, WORK ) {
	let sa1, sa2;

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
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	const ow = stride2offset( N, strideW );
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Float64Array( computeOptimalWorkSize( uplo, N ) );
	}
	return strided( jobz, uplo, N, A, sa1, sa2, 0, w, strideW, ow, WORK, 1, 0 );
}


// EXPORTS //

export default dsyev;
