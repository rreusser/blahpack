
// MODULES //

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


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
* @param {Complex128Array} WORK - workspace (or null for internal allocation)
* @param {integer} strideWORK - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
* @param {integer} lwork - workspace length
* @throws {TypeError} First argument must be a valid transpose operation
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, >0 if the i-th diagonal element of the triangular factor is zero
*/
function zgels( trans, M, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWORK, offsetWORK, lwork ) { // eslint-disable-line max-len, max-params
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
	return base( trans, M, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWORK, offsetWORK, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgels;
