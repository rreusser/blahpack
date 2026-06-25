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

import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import base from './base.js';


// VARIABLES //

var NB = 32; // Hardcoded block size (replaces ILAENV queries)


// MAIN //

/**
* Solves overdetermined or underdetermined real linear systems involving an.
* M-by-N matrix A, or its transpose, using a QR or LQ factorization of A.
*
* @param {string} trans - 'no-transpose' or 'transpose'
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
* @param {Float64Array} work - caller-provided workspace array of length at least `min(M,N) + max(min(M,N),nrhs)*NB` where NB=32
* @param {integer} strideWork - stride for work
* @param {NonNegativeInteger} offsetWork - starting index for work
* @throws {TypeError} first argument must be a valid transpose operation
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} work array must be large enough
* @returns {integer} info - 0 if successful, >0 if rank-deficient
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var A = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
* var B = new Float64Array( [ 1.0, 2.0 ] );
* var work = new Float64Array( 66 );
*
* var info = dgels( 'no-transpose', 2, 2, 1, A, 1, 2, 0, B, 1, 2, 0, work, 1, 0 );
* // info => 0
*/
function dgels( trans, M, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, work, strideWork, offsetWork ) {
	var minWork;
	var MN;

	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', trans ) );
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
	MN = Math.min( M, N );
	minWork = Math.max( 1, MN + ( Math.max( MN, nrhs ) * NB ) );
	if ( !work || ( work.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, work ? work.length : 0 ) );
	}
	return base( trans, M, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, work, strideWork, offsetWork );
}


// EXPORTS //

export default dgels;
