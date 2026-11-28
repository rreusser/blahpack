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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import ndarray from './ndarray.js';


// VARIABLES //

const NB = 32; // zungqr/zunglq block size


// MAIN //

/**
* Generate one of the complex unitary matrices Q or P^H determined by ZGEBRD.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('apply-Q'|'apply-P')} vect - `'apply-Q'` to generate Q, `'apply-P'` to generate P^H
* @param {NonNegativeInteger} M - number of rows of the matrix Q or P^H
* @param {NonNegativeInteger} N - number of columns of the matrix Q or P^H
* @param {NonNegativeInteger} K - number of columns/rows in original matrix
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} TAU - input array
* @param {integer} strideTAU - `TAU` stride length
* @param {(Complex128Array|null)} WORK - workspace of length at least `max(1,min(M,N))`; for optimum performance it should hold `min(M,N)*NB` elements (`NB = 32`), which enables the blocked path; if `null`, a workspace of the optimal size is allocated
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "apply-P", "apply-Q"
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument is invalid (rejected when `( N < 0 || ( vect === "apply-Q" && ( N > M || N < min( M, K ) ) ) ) || ( vect !== "apply-Q" && ( M > N || M < min( N, K ) ) )`)
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )` (row-major)
* @returns {integer} info status code
*/
function zungbr( order, vect, M, N, K, A, LDA, TAU, strideTAU, WORK ) {
	let lwkopt;
	let sa1;
	let sa2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( vect !== 'apply-P' && vect !== 'apply-Q' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "apply-P", "apply-Q". Value: `%s`.', vect ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( ( N < 0 || ( vect === 'apply-Q' && ( N > M || N < min( M, K ) ) ) ) || ( vect !== 'apply-Q' && ( M > N || M < min( N, K ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument is invalid (rejected when `( N < 0 || ( vect === "apply-Q" && ( N > M || N < min( M, K ) ) ) ) || ( vect !== "apply-Q" && ( M > N || M < min( N, K ) ) )`). Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	const ot = stride2offset( ( vect === 'apply-P' ) ? min( N, K ) : min( M, K ), strideTAU );
	if ( WORK === null || WORK === void 0 ) {
		// The reference's LWKOPT: the zungqr/zunglq optimum (LDWORK*NB, NB = 32), at least min(M,N):
		if ( vect === 'apply-Q' ) {
			lwkopt = ( M >= K ) ? max( 1, N ) * NB : ( M > 1 ) ? ( M - 1 ) * NB : 1;
		} else {
			lwkopt = ( K < N ) ? max( 1, M ) * NB : ( N > 1 ) ? ( N - 1 ) * NB : 1;
		}
		WORK = new Complex128Array( max( lwkopt, min( M, N ) ) );
	}
	return ndarray(vect, M, N, K, A, sa1, sa2, 0, TAU, strideTAU, ot, WORK, 1, 0 );
}


// EXPORTS //

export default zungbr;
