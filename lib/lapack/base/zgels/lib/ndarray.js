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

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// VARIABLES //

var NB = 32; // Hardcoded block size (replaces ILAENV queries)


// MAIN //

/**
* Solves overdetermined or underdetermined complex linear systems involving an.
* M-by-N matrix A, or its conjugate transpose, using a QR or LQ factorization
* of A. It is assumed that A has full rank.
*
* The following options are provided:
*
* 1. If TRANS = 'no-transpose' and M >= N: find the least squares solution of
*    an overdetermined system, i.e., solve the least squares problem:
*    minimize || B - A*X ||.
*
* 2. If TRANS = 'no-transpose' and M < N: find the minimum norm solution of
*    an underdetermined system A * X = B.
*
* 3. If TRANS = 'conjugate-transpose' and M >= N: find the minimum norm
*    solution of an underdetermined system A^H * X = B.
*
* 4. If TRANS = 'conjugate-transpose' and M < N: find the least squares
*    solution of an overdetermined system, i.e., solve the least squares
*    problem: minimize || B - A^H * X ||.
*
* @param {string} trans - 'no-transpose' or 'conjugate-transpose'
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Complex128Array} A - M-by-N matrix, overwritten with factorization on exit
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} B - on entry, RHS matrix; on exit, solution
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {Complex128Array} WORK - caller-owned workspace of at least `MN + max(MN,nrhs)*NB` complex elements (`MN = min(M,N)`, `NB = 32`), plus `(NB+1)*NB` more on the blocked path (`MN > NB`)
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @throws {TypeError} First argument must be a valid transpose operation
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @throws {RangeError} WORK array must be large enough
* @returns {integer} info - 0 if successful, >0 if the i-th diagonal element of the triangular factor is zero
*/
function zgels( trans, M, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	var minWork;
	var MN;

	if ( !isTransposeOperation( trans ) ) {
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
	if ( MN > 0 && nrhs > 0 ) {
		// Caller owns WORK; assert it is large enough so an under-sized buffer is a
		// loud RangeError, not a silent NaN from an out-of-bounds read. W[0:MN] is
		// TAU; the rest is scratch, which needs (NB+1)*NB extra on the blocked path.
		minWork = MN + ( Math.max( MN, nrhs ) * NB ) + ( ( MN > NB ) ? ( ( NB + 1 ) * NB ) : 0 );
		if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	return base( trans, M, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgels;
