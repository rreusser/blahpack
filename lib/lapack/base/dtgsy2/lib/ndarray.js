
// MODULES //

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves the generalized Sylvester equation (unblocked):.
*
*   A_R - L_B = scale_C        (1)
_   D_R - L_E = scale_F
*
* using Level 1 and 2 BLAS calls.
*
* If TRANS = 'transpose', solves the transposed system:
*   A^T_R + D^T_L = scale_C    (3)
_   -R_B^T - L_E^T = scale_F
*
* (A,D), (B,E), C, and F are M-by-M, N-by-N, M-by-N, M-by-N matrices.
* (A,D) and (B,E) must be in real Schur form (quasi-triangular).
*
* @param {string} trans - 'no-transpose' or 'transpose'
* @param {integer} ijob - 0: solve only; 1/2: solve + estimate DIF
* @param {PositiveInteger} M - number of rows in C, F, and order of (A,D)
* @param {PositiveInteger} N - number of columns in C, F, and order of (B,E)
* @param {Float64Array} A - M-by-M upper quasi-triangular matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - N-by-N upper quasi-triangular matrix
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} C - M-by-N right-hand side / solution
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} D - M-by-M upper triangular matrix
* @param {integer} strideD1 - stride of the first dimension of D
* @param {integer} strideD2 - stride of the second dimension of D
* @param {NonNegativeInteger} offsetD - starting index for D
* @param {Float64Array} E - N-by-N upper triangular matrix
* @param {integer} strideE1 - stride of the first dimension of E
* @param {integer} strideE2 - stride of the second dimension of E
* @param {NonNegativeInteger} offsetE - starting index for E
* @param {Float64Array} F - M-by-N right-hand side / solution
* @param {integer} strideF1 - stride of the first dimension of F
* @param {integer} strideF2 - stride of the second dimension of F
* @param {NonNegativeInteger} offsetF - starting index for F
* @param {Float64Array} scale - output: scale[0] is the scaling factor
* @param {Float64Array} rdsum - in/out: rdsum[0] (used when ijob > 0)
* @param {Float64Array} rdscal - in/out: rdscal[0] (used when ijob > 0)
* @param {Int32Array} IWORK - workspace of length M+N+6
* @param {integer} strideIWORK - stride for IWORK
* @param {NonNegativeInteger} offsetIWORK - starting index for IWORK
* @param {Int32Array} pq - output: pq[0] = P*Q
* @throws {TypeError} First argument must be a valid transpose operation
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, >0 from dgetc2
*/
function dtgsy2( trans, ijob, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, D, strideD1, strideD2, offsetD, E, strideE1, strideE2, offsetE, F, strideF1, strideF2, offsetF, scale, rdsum, rdscal, IWORK, strideIWORK, offsetIWORK, pq ) { // eslint-disable-line max-len, max-params
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( trans, ijob, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, D, strideD1, strideD2, offsetD, E, strideE1, strideE2, offsetE, F, strideF1, strideF2, offsetF, scale, rdsum, rdscal, IWORK, strideIWORK, offsetIWORK, pq ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtgsy2;
