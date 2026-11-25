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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves the generalized Sylvester equation: A·R - L·B = scale·C (1) D·R - L·E = scale·F, using alternative indexing semantics.
*
*   A_R - L_B = scale_C        (1)
_   D_R - L_E = scale_F
*
* or the transposed system (TRANS='transpose'):
*   A^T_R + D^T_L = scale_C    (3)
_   -R_B^T - L_E^T = scale_F
*
* where (A,D), (B,E), C, F are matrix pencils. (A,D) and (B,E) are in
* generalized real Schur form.
*
* @param {string} trans - 'no-transpose' or 'transpose'
* @param {integer} ijob - job selector (0-4)
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - M-by-M upper quasi-triangular
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - N-by-N upper quasi-triangular
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} C - M-by-N right-hand side / solution
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} D - M-by-M upper triangular
* @param {integer} strideD1 - stride of the first dimension of D
* @param {integer} strideD2 - stride of the second dimension of D
* @param {NonNegativeInteger} offsetD - starting index for D
* @param {Float64Array} E - N-by-N upper triangular
* @param {integer} strideE1 - stride of the first dimension of E
* @param {integer} strideE2 - stride of the second dimension of E
* @param {NonNegativeInteger} offsetE - starting index for E
* @param {Float64Array} F - M-by-N right-hand side / solution
* @param {integer} strideF1 - stride of the first dimension of F
* @param {integer} strideF2 - stride of the second dimension of F
* @param {NonNegativeInteger} offsetF - starting index for F
* @param {Float64Array} scale - output: scale[0]
* @param {Float64Array} dif - output: dif[0] (for ijob >= 1)
* @param {Float64Array} WORK - caller-owned workspace of at least `2*M*N` elements
* @param {integer} strideWork - stride for WORK (must be 1; workspace is contiguous)
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {Int32Array} IWORK - caller-owned integer workspace of at least `M+N+6` elements
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @throws {TypeError} first argument must be one of the following: "no-transpose", "transpose"
* @throws {RangeError} second argument is invalid (rejected when `trans === "no-transpose" && ( ijob < 0 || ijob > 4 )`)
* @throws {RangeError} third argument is invalid (rejected when `M <= 0`)
* @throws {RangeError} fourth argument is invalid (rejected when `N <= 0`)
* @throws {RangeError} WORK array must be large enough
* @throws {RangeError} IWORK array must be large enough
* @returns {integer} info - 0 if successful
*/
function dtgsyl( trans, ijob, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, D, strideD1, strideD2, offsetD, E, strideE1, strideE2, offsetE, F, strideF1, strideF2, offsetF, scale, dif, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	if ( trans !== 'no-transpose' && trans !== 'transpose' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "no-transpose", "transpose". Value: `%s`.', trans ) );
	}
	if ( trans === 'no-transpose' && ( ijob < 0 || ijob > 4 ) ) {
		throw new RangeError( format( 'invalid argument. Second argument is invalid (rejected when `trans === "no-transpose" && ( ijob < 0 || ijob > 4 )`). Value: `%d`.', ijob ) );
	}
	if ( M <= 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `M <= 0`). Value: `%d`.', M ) );
	}
	if ( N <= 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument is invalid (rejected when `N <= 0`). Value: `%d`.', N ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideIWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideIWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideIWork ) );
	}
	// Caller owns the workspace; assert it is large enough so an under-sized
	// buffer is a loud RangeError, not a silent NaN from an out-of-bounds read.
	// WORK holds two contiguous M-by-N blocks (2*M*N); IWORK holds M+N+6 ints.
	if ( !WORK || ( WORK.length - offsetWork ) < ( 2 * M * N ) ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', 2 * M * N, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	if ( !IWORK || ( IWORK.length - offsetIWork ) < ( M + N + 6 ) ) {
		throw new RangeError( format( 'invalid argument. IWORK array must have at least %d elements from offset %d. Provided length: %d.', M + N + 6, offsetIWork, ( IWORK ) ? IWORK.length : 0 ) );
	}
	return base( trans, ijob, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, D, strideD1, strideD2, offsetD, E, strideE1, strideE2, offsetE, F, strideF1, strideF2, offsetF, scale, dif, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtgsyl;
