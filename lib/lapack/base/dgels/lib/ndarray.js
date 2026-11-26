/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/**
 * Solves overdetermined or underdetermined real linear systems involving an.
 * M-by-N matrix A, or its transpose, using a QR or LQ factorization of A.
 *
 * It is assumed that A has full rank.
 *
 * The following options are provided:
 *
 * 1.  If TRANS = 'N' and M >= N: find the least squares solution of an
 *     overdetermined system, i.e., solve the least squares problem:
 *     minimize || B - A*X ||
 *
 * 2.  If TRANS = 'N' and M < N: find the minimum norm solution of an
 *     underdetermined system A * X = B.
 *
 * 3.  If TRANS = 'T' and M >= N: find the minimum norm solution of an
 *     underdetermined system A^T * X = B.
 *
 * 4.  If TRANS = 'T' and M < N: find the least squares solution of an
 *     overdetermined system, i.e., solve the least squares problem:
 *     minimize || B - A^T * X ||
 *
 * Several right hand side vectors b and solution vectors x can be handled
 * in a single call; they are stored as columns of the M-by-NRHS right
 * hand side matrix B and the N-by-NRHS solution matrix X.
 *
 *
 * @param {string} trans - `'no-transpose'` or `'transpose'`
 * @param {NonNegativeInteger} M - number of rows of A
 * @param {NonNegativeInteger} N - number of columns of A
 * @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
 * @param {Float64Array} A - M-by-N matrix, overwritten with factorization on exit
 * @param {integer} strideA1 - stride of the first dimension of A
 * @param {integer} strideA2 - stride of the second dimension of A
 * @param {NonNegativeInteger} offsetA - starting index for A
 * @param {Float64Array} B - on entry, M-by-NRHS (or N-by-NRHS) RHS matrix; on exit, solution
 * @param {integer} strideB1 - stride of the first dimension of B
 * @param {integer} strideB2 - stride of the second dimension of B
 * @param {NonNegativeInteger} offsetB - starting index for B
 * @throws {TypeError} First argument must be a valid transpose operation
 * @returns {integer} info - 0 if successful, >0 if the i-th diagonal element of the triangular factor is zero (matrix not full rank)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves overdetermined or underdetermined real linear systems involving an.
* M-by-N matrix A, or its transpose, using a QR or LQ factorization of A.
*
* @param {('no-transpose'|'transpose')} trans - 'no-transpose' or 'transpose'
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Float64Array} A - M-by-N matrix, overwritten with factorization on exit
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - on entry, RHS matrix; on exit, the solution
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} work - workspace of length at least `max(1, MN + max(MN,nrhs))` (`MN = min(M,N)`); for optimal performance at least `MN + max( MN*NB, nrhs*NB + TSIZE )` (`NB = 32`, `TSIZE = 4160`), the reference's `MN + max(MN,nrhs)*NB` with the dormqr/dormlq optimum's T part, which enables the blocked paths
* @param {integer} strideWork - stride for work
* @param {NonNegativeInteger} offsetWork - starting index for work
* @throws {TypeError} first argument must be one of the following: "no-transpose", "transpose"
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} work array must be large enough
* @returns {integer} info - 0 if successful, >0 if rank-deficient
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dgels from '@rreusser/blahpack/lapack/base/dgels';
*
* var A = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
* var B = new Float64Array( [ 1.0, 2.0 ] );
* var work = new Float64Array( 66 );
*
* var info = dgels.ndarray( 'no-transpose', 2, 2, 1, A, 1, 2, 0, B, 1, 2, 0, work, 1, 0 );
* // info => 0
*/
function dgels( trans, M, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, work, strideWork, offsetWork ) {

	if ( trans !== 'no-transpose' && trans !== 'transpose' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "no-transpose", "transpose". Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	const MN = Math.min( M, N );

	const minWork = Math.max( 1, MN + Math.max( MN, nrhs ) );
	if ( !work || ( work.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( work ) ? work.length : 0 ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( trans, M, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, work, strideWork, offsetWork );
}


// EXPORTS //

export default dgels;
