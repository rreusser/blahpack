
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the minimum norm solution to a complex linear least squares problem:.
*
* minimize 2-norm(|| b - A*x ||)
*
* using the singular value decomposition (SVD) of A. A is an M-by-N matrix
* which may be rank-deficient.
*
* Several right hand side vectors b and solution vectors x can be handled
* in a single call; they are stored as the columns of the M-by-NRHS right
* hand side matrix B and the N-by-NRHS solution matrix X.
*
* The effective rank of A is determined by treating as zero those singular
* values which are less than RCOND times the largest singular value.
*
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Complex128Array} A - M-by-N matrix, overwritten on exit
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} B - on entry, M-by-NRHS (or max(M,N)-by-NRHS) RHS matrix;
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
* @param {Float64Array} S - output array of singular values in decreasing order (length min(M,N))
* @param {integer} strideS - stride length for S
* @param {NonNegativeInteger} offsetS - starting index for S
* @param {number} rcond - used to determine the effective rank of A.
* @param {Array} rank - output array; rank[0] set to the effective rank of A
* @param {Complex128Array} WORK - workspace array (if null, allocated internally)
* @param {integer} strideWORK - stride length for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (in complex elements)
* @param {integer} lwork - length of WORK array in complex elements (if 0 or WORK is null, auto-sized)
* @param {Float64Array} RWORK - real workspace array (if null, allocated internally)
* @param {integer} strideRWORK - stride length for RWORK
* @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, >0 if ZBDSQR did not converge
*/
function zgelss( M, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, S, strideS, offsetS, rcond, rank, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK ) { // eslint-disable-line max-len, max-params
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( M, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, S, strideS, offsetS, rcond, rank, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgelss;
