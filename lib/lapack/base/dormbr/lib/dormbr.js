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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base from './base.js';


// VARIABLES //

const NB = 32; // Hardcoded block size of dormqr/dormlq (base.js)


// MAIN //

/**
* Multiplies the matrix C by Q or P^T (or their transposes), where Q and P^T are the orthogonal matrices determined by DGEBRD.
*
* @param {Layout} order - storage layout (`'row-major'` or `'column-major'`)
* @param {('apply-Q'|'apply-P')} vect - `'apply-Q'` to apply Q, `'apply-P'` to apply P^T
* @param {OperationSide} side - `'left'` or `'right'`
* @param {('no-transpose'|'transpose')} trans - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of columns/rows in original matrix for DGEBRD
* @param {Float64Array} A - matrix containing reflectors from DGEBRD
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} TAU - scalar factors of reflectors (TAUQ or TAUP)
* @param {integer} strideTAU - `TAU` stride length
* @param {Float64Array} C - input/output matrix
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {(Float64Array|null)} WORK - workspace array
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "apply-P", "apply-Q"
* @throws {TypeError} third argument must be a valid operation side
* @throws {TypeError} fourth argument must be one of the following: "no-transpose", "transpose"
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be a nonnegative integer
* @throws {RangeError} ninth argument is invalid (column-major: rejected when `( vect === "apply-Q" && LDA < max( 1, side === "left" ? M : N ) ) || ( vect !== "apply-Q" && LDA < max( 1, min( side === "left" ? M : N, K ) ) )`)
* @throws {RangeError} ninth argument is invalid (row-major: rejected when `LDA < max( 1, vect === "apply-Q" ? min( side === "left" ? M : N, K ) : ( side === "left" ? M : N ) )`)
* @throws {RangeError} thirteenth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} thirteenth argument must be greater than or equal to `max( 1, N )` (row-major)
* @returns {integer} info status code
*/
function dormbr( order, vect, side, trans, M, N, K, A, LDA, TAU, strideTAU, C, LDC, WORK ) {
	let sa1, sa2, sc1, sc2, nq, nw, ot;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( vect !== 'apply-P' && vect !== 'apply-Q' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "apply-P", "apply-Q". Value: `%s`.', vect ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( trans !== 'no-transpose' && trans !== 'transpose' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be one of the following: "no-transpose", "transpose". Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( order === 'column-major' && ( ( vect === 'apply-Q' && LDA < max( 1, side === 'left' ? M : N ) ) || ( vect !== 'apply-Q' && LDA < max( 1, min( side === 'left' ? M : N, K ) ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument is invalid (column-major: rejected when `( vect === "apply-Q" && LDA < max( 1, side === "left" ? M : N ) ) || ( vect !== "apply-Q" && LDA < max( 1, min( side === "left" ? M : N, K ) ) )`). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, vect === 'apply-Q' ? min( side === 'left' ? M : N, K ) : ( side === 'left' ? M : N ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument is invalid (row-major: rejected when `LDA < max( 1, vect === "apply-Q" ? min( side === "left" ? M : N, K ) : ( side === "left" ? M : N ) )`). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && ( LDC < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDC ) );
	}
	if ( order === 'row-major' && ( LDC < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDC ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sc1 = 1;
		sc2 = LDC;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sc1 = LDC;
		sc2 = 1;
	}
	nq = ( side === 'left' ) ? M : N;

	// TAU has min(NQ,K) elements (reference DORMBR argument docs; ticket 0068):
	ot = stride2offset( min( nq, K ), strideTAU );
	if ( WORK === null || WORK === void 0 ) {
		// Allocate for the blocked dormqr/dormlq path (NB=32): nw*NB + (NB+1)*NB, with nw = N for side='left' and M for side='right' (ticket 0074):
		nw = ( side === 'left' ) ? max( 1, N ) : max( 1, M );
		WORK = new Float64Array( ( nw * NB ) + ( ( NB + 1 ) * NB ) );
	}
	return base( vect, side, trans, M, N, K, A, sa1, sa2, 0, TAU, strideTAU, ot, C, sc1, sc2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default dormbr;
