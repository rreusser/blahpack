/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes selected eigenvalues and, optionally, eigenvectors of a complex Hermitian band matrix A.
*
* @param {('no-vectors'|'compute-vectors')} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {('all'|'value'|'index')} range - `'all'`, `'value'`, or `'index'`
* @param {MatrixTriangle} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super- (or sub-) diagonals
* @param {Complex128Array} AB - band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of `AB` (in complex elements)
* @param {integer} strideAB2 - stride of the second dimension of `AB` (in complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for `AB` (in complex elements)
* @param {Complex128Array} Q - output unitary matrix from zhbtrd (N-by-N)
* @param {integer} strideQ1 - stride of the first dimension of Q (in complex elements)
* @param {integer} strideQ2 - stride of the second dimension of Q (in complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for Q (in complex elements)
* @param {number} vl - lower bound of eigenvalue interval (RANGE='value')
* @param {number} vu - upper bound of eigenvalue interval (RANGE='value')
* @param {integer} il - index of smallest eigenvalue to compute (1-based, RANGE='index')
* @param {integer} iu - index of largest eigenvalue to compute (1-based, RANGE='index')
* @param {number} abstol - absolute tolerance for eigenvalues
* @param {Int32Array} m - output (length-1 array): the total number of eigenvalues found
* @param {Float64Array} w - output array for eigenvalues (length N)
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Complex128Array} Z - output eigenvector matrix (N-by-M)
* @param {integer} strideZ1 - stride of first dimension of Z (in complex elements)
* @param {integer} strideZ2 - stride of second dimension of Z (in complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for Z (in complex elements)
* @param {Complex128Array} WORK - complex workspace (length >= N)
* @param {integer} strideWork - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @param {Float64Array} RWORK - real workspace (length >= 7*N)
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @param {Int32Array} IWORK - integer workspace (length >= 5*N)
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @param {Int32Array} IFAIL - output: indices of non-converged eigenvectors (length N)
* @param {integer} strideIFAIL - stride for IFAIL
* @param {NonNegativeInteger} offsetIFAIL - starting index for IFAIL
* @throws {TypeError} first argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} second argument must be one of the following: "all", "index", "value"
* @throws {TypeError} third argument must be a valid matrix triangle
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} fifteenth argument is invalid (rejected when `range === "value" && ( N > 0 && vu <= vl )`)
* @throws {RangeError} sixteenth argument is invalid (rejected when `range !== "value" && range === "index" && ( il < 1 || il > max( 1, N ) )`)
* @throws {RangeError} seventeenth argument is invalid (rejected when `range !== "value" && range === "index" && ( iu < min( N, il ) || iu > N )`)
* @throws {RangeError} `RWORK` must have at least `7 * N` elements from `offsetRWork`
* @throws {RangeError} `IWORK` must have at least `5 * N` elements from `offsetIWork`
* @returns {integer} status code (0 = success)
*/
function zhbevx( jobz, range, uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, Q, strideQ1, strideQ2, offsetQ, vl, vu, il, iu, abstol, m, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, IWORK, strideIWork, offsetIWork, IFAIL, strideIFAIL, offsetIFAIL ) { // eslint-disable-line max-len, max-params
	if ( jobz !== 'no-vectors' && jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobz ) );
	}
	if ( range !== 'all' && range !== 'index' && range !== 'value' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "all", "index", "value". Value: `%s`.', range ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( kd < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', kd ) );
	}
	if ( range === 'value' && ( N > 0 && vu <= vl ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument is invalid (rejected when `range === "value" && ( N > 0 && vu <= vl )`). Value: `%s`.', vu ) );
	}
	if ( range !== 'value' && range === 'index' && ( il < 1 || il > max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument is invalid (rejected when `range !== "value" && range === "index" && ( il < 1 || il > max( 1, N ) )`). Value: `%d`.', il ) );
	}
	if ( range !== 'value' && range === 'index' && ( iu < min( N, il ) || iu > N ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument is invalid (rejected when `range !== "value" && range === "index" && ( iu < min( N, il ) || iu > N )`). Value: `%d`.', iu ) );
	}
	const minWork = Math.max( 1, N );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}

	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideRWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideRWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideRWork ) );
	}
	if ( strideIWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideIWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideIWork ) );
	}
	const minRWork = 7 * N;
	if ( !RWORK || ( RWORK.length - offsetRWork ) < minRWork ) {
		throw new RangeError( format( 'invalid argument. RWORK array must have at least %d elements from offset %d. Provided length: %d.', minRWork, offsetRWork, ( RWORK ) ? RWORK.length : 0 ) );
	}
	const minIWork = 5 * N;
	if ( !IWORK || ( IWORK.length - offsetIWork ) < minIWork ) {
		throw new RangeError( format( 'invalid argument. IWORK array must have at least %d elements from offset %d. Provided length: %d.', minIWork, offsetIWork, ( IWORK ) ? IWORK.length : 0 ) );
	}
	return base( jobz, range, uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, Q, strideQ1, strideQ2, offsetQ, vl, vu, il, iu, abstol, m, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, IWORK, strideIWork, offsetIWork, IFAIL, strideIFAIL, offsetIFAIL ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhbevx;
