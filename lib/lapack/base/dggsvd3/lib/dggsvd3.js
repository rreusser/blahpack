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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the singular value decomposition (SVD).
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} jobu - `'compute-U'`: Orthogonal matrix U is computed; `'none'`: U is not computed.
* @param {string} jobv - `'compute-V'`: Orthogonal matrix V is computed; `'none'`: V is not computed.
* @param {string} jobq - `'compute-Q'`: Orthogonal matrix Q is computed; `'none'`: Q is not computed.
* @param {NonNegativeInteger} M - the number of rows of the matrix A.
* @param {NonNegativeInteger} N - the number of columns of the matrices A and B.
* @param {NonNegativeInteger} p - the number of rows of the matrix B.
* @param {Int32Array} K - on exit, K and L specify the dimension of the subblocks described in Purpose.
* @param {Int32Array} l - on exit, K and L specify the dimension of the subblocks described in Purpose.
* @param {Float64Array} A - on entry, the M-by-N matrix A. On exit, A contains the triangular matrix R, or part of R.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} B - on entry, the P-by-N matrix B. On exit, B contains the triangular matrix R if M-K-L < 0.
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} ALPHA - on exit, ALPHA and BETA contain the generalized singular value pairs of A and B.
* @param {integer} strideALPHA - stride length for `ALPHA`
* @param {Float64Array} BETA - on exit, ALPHA and BETA contain the generalized singular value pairs of A and B.
* @param {integer} strideBETA - stride length for `BETA`
* @param {Float64Array} U - if `jobu === 'compute-U'`, U contains the M-by-M orthogonal matrix U.
* @param {PositiveInteger} LDU - leading dimension of `U`
* @param {Float64Array} V - if `jobv === 'compute-V'`, V contains the P-by-P orthogonal matrix V.
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {Float64Array} Q - if `jobq === 'compute-Q'`, Q contains the N-by-N orthogonal matrix Q.
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {(Float64Array|null)} WORK - caller-provided workspace of at least `1` elements
* @param {(Int32Array|null)} IWORK - caller-provided workspace of at least `N` elements
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "none", "compute-U"
* @throws {TypeError} third argument must be one of the following: "none", "compute-V"
* @throws {TypeError} fourth argument must be one of the following: "none", "compute-Q"
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be a nonnegative integer
* @throws {RangeError} eleventh argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} eleventh argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} thirteenth argument must be greater than or equal to `max( 1, p )` (column-major)
* @throws {RangeError} thirteenth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} nineteenth argument is invalid (rejected when `LDU < 1 || ( jobu === "compute-U" && LDU < M )`)
* @throws {RangeError} twenty-first argument is invalid (rejected when `LDV < 1 || ( jobv === "compute-V" && LDV < p )`)
* @throws {RangeError} twenty-third argument is invalid (rejected when `LDQ < 1 || ( jobq === "compute-Q" && LDQ < N )`)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function dggsvd3( order, jobu, jobv, jobq, M, N, p, K, l, A, LDA, B, LDB, ALPHA, strideALPHA, BETA, strideBETA, U, LDU, V, LDV, Q, LDQ, WORK, IWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( jobu !== 'none' && jobu !== 'compute-U' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "none", "compute-U". Value: `%s`.', jobu ) );
	}
	if ( jobv !== 'none' && jobv !== 'compute-V' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "none", "compute-V". Value: `%s`.', jobv ) );
	}
	if ( jobq !== 'none' && jobq !== 'compute-Q' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be one of the following: "none", "compute-Q". Value: `%s`.', jobq ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( p < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', p ) );
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
	if ( LDU < 1 || ( jobu === 'compute-U' && LDU < M ) ) {
		throw new RangeError( format( 'invalid argument. Nineteenth argument is invalid (rejected when `LDU < 1 || ( jobu === "compute-U" && LDU < M )`). Value: `%d`.', LDU ) );
	}
	if ( LDV < 1 || ( jobv === 'compute-V' && LDV < p ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-first argument is invalid (rejected when `LDV < 1 || ( jobv === "compute-V" && LDV < p )`). Value: `%d`.', LDV ) );
	}
	if ( LDQ < 1 || ( jobq === 'compute-Q' && LDQ < N ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-third argument is invalid (rejected when `LDQ < 1 || ( jobq === "compute-Q" && LDQ < N )`). Value: `%d`.', LDQ ) );
	}
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
	const oalpha = stride2offset( N, strideALPHA );
	const obeta = stride2offset( N, strideBETA );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 2 * N );
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
	}
	return base( jobu, jobv, jobq, M, N, p, K, l, A, sa1, sa2, 0, B, sb1, sb2, 0, ALPHA, strideALPHA, oalpha, BETA, strideBETA, obeta, U, su1, su2, 0, V, sv1, sv2, 0, Q, sq1, sq2, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dggsvd3;
