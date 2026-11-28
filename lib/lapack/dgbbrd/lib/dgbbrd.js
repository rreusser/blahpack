/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import strided from './strided.js';


// MAIN //

/**
* Reduces a real general band matrix to upper bidiagonal form.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('no-vectors'|'q-only'|'p-only'|'both')} vect - specifies the operation type
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {NonNegativeInteger} ncc - the number of columns of the matrix C.
* @param {NonNegativeInteger} kl - the number of subdiagonals of the matrix A.
* @param {NonNegativeInteger} ku - the number of superdiagonals of the matrix A.
* @param {Float64Array} AB - input matrix
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} d - input array
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} e - input array
* @param {integer} strideE - stride length for `e`
* @param {Float64Array} Q - input matrix
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Float64Array} PT - input matrix
* @param {PositiveInteger} LDPT - leading dimension of `PT`
* @param {Float64Array} C - input matrix
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {(Float64Array|null)} WORK - output array
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "both", "no-vectors", "p-only", "q-only"
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be a nonnegative integer
* @throws {RangeError} ninth argument must be greater than or equal to `kl + ku + 1` (column-major)
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} fifteenth argument is invalid (rejected when `LDQ < 1 || ( ( vect === "q-only" || vect === "both" ) && LDQ < max( 1, M ) )`)
* @throws {RangeError} seventeenth argument is invalid (rejected when `LDPT < 1 || ( ( vect === "p-only" || vect === "both" ) && LDPT < max( 1, N ) )`)
* @throws {RangeError} nineteenth argument is invalid (column-major: rejected when `LDC < 1 || ( ncc > 0 && LDC < max( 1, M ) )`)
* @throws {RangeError} nineteenth argument is invalid (row-major: rejected when `LDC < 1 || ( ncc > 0 && LDC < max( 1, ncc ) )`)
* @returns {integer} status code (0 = success)
*/
function dgbbrd( order, vect, M, N, ncc, kl, ku, AB, LDAB, d, strideD, e, strideE, Q, LDQ, PT, LDPT, C, LDC, WORK ) { // eslint-disable-line max-len, max-params
	let sab1, sab2, spt1, spt2, sq1, sq2, sc1, sc2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( vect !== 'both' && vect !== 'no-vectors' && vect !== 'p-only' && vect !== 'q-only' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "both", "no-vectors", "p-only", "q-only". Value: `%s`.', vect ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( ncc < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', ncc ) );
	}
	if ( kl < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', kl ) );
	}
	if ( ku < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', ku ) );
	}
	if ( order === 'column-major' && ( LDAB < kl + ku + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to %d. Value: `%d`.', kl + ku + 1, LDAB ) );
	}
	if ( order === 'row-major' && ( LDAB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDAB ) );
	}
	if ( LDQ < 1 || ( ( vect === 'q-only' || vect === 'both' ) && LDQ < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument is invalid (rejected when `LDQ < 1 || ( ( vect === "q-only" || vect === "both" ) && LDQ < max( 1, M ) )`). Value: `%d`.', LDQ ) );
	}
	if ( LDPT < 1 || ( ( vect === 'p-only' || vect === 'both' ) && LDPT < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument is invalid (rejected when `LDPT < 1 || ( ( vect === "p-only" || vect === "both" ) && LDPT < max( 1, N ) )`). Value: `%d`.', LDPT ) );
	}
	if ( order === 'column-major' && ( LDC < 1 || ( ncc > 0 && LDC < max( 1, M ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Nineteenth argument is invalid (column-major: rejected when `LDC < 1 || ( ncc > 0 && LDC < max( 1, M ) )`). Value: `%d`.', LDC ) );
	}
	if ( order === 'row-major' && ( LDC < 1 || ( ncc > 0 && LDC < max( 1, ncc ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Nineteenth argument is invalid (row-major: rejected when `LDC < 1 || ( ncc > 0 && LDC < max( 1, ncc ) )`). Value: `%d`.', LDC ) );
	}
	if ( order === 'column-major' ) {
		sab1 = 1;
		sab2 = LDAB;
		sq1 = 1;
		sq2 = LDQ;
		spt1 = 1;
		spt2 = LDPT;
		sc1 = 1;
		sc2 = LDC;
	} else {
		sab1 = LDAB;
		sab2 = 1;
		sq1 = LDQ;
		sq2 = 1;
		spt1 = LDPT;
		spt2 = 1;
		sc1 = LDC;
		sc2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = 2 * Math.max( M, N );
		WORK = new Float64Array( minWork );
	}
	return strided( vect, M, N, ncc, kl, ku, AB, sab1, sab2, 0, d, strideD, 0, e, strideE, 0, Q, sq1, sq2, 0, PT, spt1, spt2, 0, C, sc1, sc2, 0, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgbbrd;
