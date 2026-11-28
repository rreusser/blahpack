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
import strided from './strided.js';


// MAIN //

/**
* Computes the generalized singular value decomposition of two complex upper triangular matrices.
*
* ## Notes
*
* -   This is a placeholder for a future BLAS/LAPACK-style API (order/layout, LDA). Use `ztgsja.strided` for the strided interface.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('update'|'initialize'|'none')} jobu - specifies the operation type
* @param {('update'|'initialize'|'none')} jobv - specifies the operation type
* @param {('update'|'initialize'|'none')} jobq - specifies the operation type
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} p - number of rows of B
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {integer} K - dimension of the first block
* @param {integer} l - dimension of the second block
* @param {Complex128Array} A - M-by-N matrix A (overwritten)
* @param {PositiveInteger} LDA - leading dimension of A
* @param {Complex128Array} B - P-by-N matrix B (overwritten)
* @param {PositiveInteger} LDB - leading dimension of B
* @param {number} tola - convergence tolerance for A
* @param {number} tolb - convergence tolerance for B
* @param {Float64Array} ALPHA - output array for generalized singular values (length N)
* @param {integer} strideALPHA - stride length for `ALPHA`
* @param {Float64Array} BETA - output array for generalized singular values (length N)
* @param {integer} strideBETA - stride length for `BETA`
* @param {Complex128Array} U - M-by-M unitary matrix U
* @param {PositiveInteger} LDU - leading dimension of U
* @param {Complex128Array} V - P-by-P unitary matrix V
* @param {PositiveInteger} LDV - leading dimension of V
* @param {Complex128Array} Q - N-by-N unitary matrix Q
* @param {PositiveInteger} LDQ - leading dimension of Q
* @param {(Complex128Array|null)} WORK - workspace array
* @param {Int32Array} ncycle - output: ncycle[0] receives the number of cycles
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "initialize", "none", "update"
* @throws {TypeError} third argument must be one of the following: "initialize", "none", "update"
* @throws {TypeError} fourth argument must be one of the following: "initialize", "none", "update"
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be a nonnegative integer
* @throws {RangeError} eleventh argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} eleventh argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} thirteenth argument must be greater than or equal to `max( 1, p )` (column-major)
* @throws {RangeError} thirteenth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} twenty-first argument is invalid (rejected when `LDU < 1 || ( ( jobu === "initialize" || jobu === "update" ) && LDU < M )`)
* @throws {RangeError} twenty-third argument is invalid (rejected when `LDV < 1 || ( ( jobv === "initialize" || jobv === "update" ) && LDV < p )`)
* @throws {RangeError} twenty-fifth argument is invalid (rejected when `LDQ < 1 || ( ( jobq === "initialize" || jobq === "update" ) && LDQ < N )`)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info - 0 for success, 1 if not converged
*/
function ztgsja( order, jobu, jobv, jobq, M, p, N, K, l, A, LDA, B, LDB, tola, tolb, ALPHA, strideALPHA, BETA, strideBETA, U, LDU, V, LDV, Q, LDQ, WORK, ncycle ) { // eslint-disable-line max-len, max-params, no-unused-vars
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( jobu !== 'initialize' && jobu !== 'none' && jobu !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "initialize", "none", "update". Value: `%s`.', jobu ) );
	}
	if ( jobv !== 'initialize' && jobv !== 'none' && jobv !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "initialize", "none", "update". Value: `%s`.', jobv ) );
	}
	if ( jobq !== 'initialize' && jobq !== 'none' && jobq !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be one of the following: "initialize", "none", "update". Value: `%s`.', jobq ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( p < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', p ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, p ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', p, LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( LDU < 1 || ( ( jobu === 'initialize' || jobu === 'update' ) && LDU < M ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-first argument is invalid (rejected when `LDU < 1 || ( ( jobu === "initialize" || jobu === "update" ) && LDU < M )`). Value: `%d`.', LDU ) );
	}
	if ( LDV < 1 || ( ( jobv === 'initialize' || jobv === 'update' ) && LDV < p ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-third argument is invalid (rejected when `LDV < 1 || ( ( jobv === "initialize" || jobv === "update" ) && LDV < p )`). Value: `%d`.', LDV ) );
	}
	if ( LDQ < 1 || ( ( jobq === 'initialize' || jobq === 'update' ) && LDQ < N ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-fifth argument is invalid (rejected when `LDQ < 1 || ( ( jobq === "initialize" || jobq === "update" ) && LDQ < N )`). Value: `%d`.', LDQ ) );
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
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 2 * N );
		WORK = new Complex128Array( minWork );
	}
	return strided( jobu, jobv, jobq, M, p, N, K, l, A, sa1, sa2, 0, B, sb1, sb2, 0, tola, tolb, ALPHA, strideALPHA, oalpha, BETA, strideBETA, obeta, U, su1, su2, 0, V, sv1, sv2, 0, Q, sq1, sq2, 0, WORK, 1, 0, ncycle ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztgsja;
