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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the generalized singular value decomposition of two complex upper triangular matrices.
*
* ## Notes
*
* -   This is a placeholder for a future BLAS/LAPACK-style API (order/layout, LDA). Use `ztgsja.ndarray` for the strided interface.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} jobu - specifies the operation type
* @param {string} jobv - specifies the operation type
* @param {string} jobq - specifies the operation type
* @param {NonNegativeInteger} M - number of rows of A
* @param {integer} p - number of rows of B
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {NonNegativeInteger} K - dimension of the first block
* @param {integer} l - dimension of the second block
* @param {Complex128Array} A - M-by-N matrix A (overwritten)
* @param {integer} LDA - leading dimension of A
* @param {Complex128Array} B - P-by-N matrix B (overwritten)
* @param {integer} LDB - leading dimension of B
* @param {number} tola - convergence tolerance for A
* @param {number} tolb - convergence tolerance for B
* @param {Float64Array} ALPHA - output array for generalized singular values (length N)
* @param {integer} strideALPHA - stride length for `ALPHA`
* @param {Float64Array} BETA - output array for generalized singular values (length N)
* @param {integer} strideBETA - stride length for `BETA`
* @param {Complex128Array} U - M-by-M unitary matrix U
* @param {integer} LDU - leading dimension of U
* @param {Complex128Array} V - P-by-P unitary matrix V
* @param {integer} LDV - leading dimension of V
* @param {Complex128Array} Q - N-by-N unitary matrix Q
* @param {integer} LDQ - leading dimension of Q
* @param {Complex128Array} WORK - workspace array
* @param {Int32Array} ncycle - output: ncycle[0] receives the number of cycles
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 for success, 1 if not converged
*/
function ztgsja( order, jobu, jobv, jobq, M, p, N, K, l, A, LDA, B, LDB, tola, tolb, ALPHA, strideALPHA, BETA, strideBETA, U, LDU, V, LDV, Q, LDQ, WORK, ncycle ) { // eslint-disable-line max-len, max-params, no-unused-vars
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const oalpha = stride2offset( N, strideALPHA );
	const obeta = stride2offset( N, strideBETA );
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const su1 = ( order === 'column-major' ) ? 1 : LDU;
	const su2 = ( order === 'column-major' ) ? LDU : 1;
	const sv1 = ( order === 'column-major' ) ? 1 : LDV;
	const sv2 = ( order === 'column-major' ) ? LDV : 1;
	const sq1 = ( order === 'column-major' ) ? 1 : LDQ;
	const sq2 = ( order === 'column-major' ) ? LDQ : 1;
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument violates the reference leading-dimension rule (column-major: rejected when `LDA.LT.MAX( 1, M )`). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument violates the reference leading-dimension rule (row-major: must also cover the N columns). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, p ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument violates the reference leading-dimension rule (column-major: rejected when `LDB.LT.MAX( 1, P )`). Value: `%d`.', LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument violates the reference leading-dimension rule (row-major: must also cover the N columns). Value: `%d`.', LDB ) );
	}
	if ( LDU < 1 || ( ( ( jobu === 'initialize' ) || ( jobu === 'update' ) ) && LDU < M ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-first argument violates the reference leading-dimension rule (rejected when `LDU.LT.1 .OR. ( WANTU .AND. LDU.LT.M )`). Value: `%d`.', LDU ) );
	}
	if ( LDV < 1 || ( ( ( jobv === 'initialize' ) || ( jobv === 'update' ) ) && LDV < p ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-third argument violates the reference leading-dimension rule (rejected when `LDV.LT.1 .OR. ( WANTV .AND. LDV.LT.P )`). Value: `%d`.', LDV ) );
	}
	if ( LDQ < 1 || ( ( ( jobq === 'initialize' ) || ( jobq === 'update' ) ) && LDQ < N ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-fifth argument violates the reference leading-dimension rule (rejected when `LDQ.LT.1 .OR. ( WANTQ .AND. LDQ.LT.N )`). Value: `%d`.', LDQ ) );
	}
	if ( jobu !== 'none' && jobu !== 'initialize' && jobu !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobu` value. Value: `%s`.', jobu ) );
	}
	if ( jobv !== 'none' && jobv !== 'initialize' && jobv !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `jobv` value. Value: `%s`.', jobv ) );
	}
	if ( jobq !== 'none' && jobq !== 'initialize' && jobq !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid `jobq` value. Value: `%s`.', jobq ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 2 * N );
		WORK = new Complex128Array( minWork );
	}
	return base( jobu, jobv, jobq, M, p, N, K, l, A, sa1, sa2, 0, B, sb1, sb2, 0, tola, tolb, ALPHA, strideALPHA, oalpha, BETA, strideBETA, obeta, U, su1, su2, 0, V, sv1, sv2, 0, Q, sq1, sq2, 0, WORK, 1, 0, ncycle ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztgsja;
