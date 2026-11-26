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

import float64ToFloat32 from '@stdlib/number/float64/base/to-float32/lib/index.js';
import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';


// MAIN //

/**
* Checks whether infinity and NaN arithmetic is safe.
*
* ## Notes
*
* -   `ZERO` and `ONE` are `REAL` in the reference, so every operation is rounded to single precision.
* -   Returns `1` if the arithmetic is IEEE-compatible (infinity, and NaN unless `ispec` is `0`), `0` otherwise.
*
* @private
* @param {integer} ispec - `0` checks infinity arithmetic only; any other value also checks NaN arithmetic
* @param {number} zero - the value `0.0` (passed so the compiler cannot fold the expressions)
* @param {number} one - the value `1.0`
* @returns {integer} `1` if the arithmetic is safe, `0` otherwise
*
* @example
* import ieeeck from './base.js';
*
* var v = ieeeck( 1, 0.0, 1.0 );
* // returns 1
*/
function ieeeck( ispec, zero, one ) {
	let NEGZRO;
	let NEWZRO;
	let POSINF;
	let NEGINF;
	let NAN1;
	let NAN2;
	let NAN3;
	let NAN4;
	let NAN5;
	let NAN6;

	zero = float64ToFloat32( zero );
	one = float64ToFloat32( one );

	POSINF = float64ToFloat32( one / zero );
	if ( POSINF <= one ) {
		return 0;
	}
	NEGINF = float64ToFloat32( -one / zero );
	if ( NEGINF >= zero ) {
		return 0;
	}
	NEGZRO = float64ToFloat32( one / float64ToFloat32( NEGINF + one ) );
	if ( NEGZRO !== zero ) {
		return 0;
	}
	NEGINF = float64ToFloat32( one / NEGZRO );
	NEWZRO = float64ToFloat32( NEGZRO + zero );

	// The reference tests NEGINF >= ZERO, then NEWZRO != ZERO (each a return of 0). The tests have no side effects, so testing them together returns the same value; the first cannot fail where the earlier tests passed (it would need NEGZRO = ZERO with ONE / ZERO >= ZERO**2 > 0):
	if ( NEGINF >= zero || NEWZRO !== zero ) {
		return 0;
	}
	POSINF = float64ToFloat32( one / NEWZRO );
	if ( POSINF <= one ) {
		return 0;
	}
	NEGINF = float64ToFloat32( NEGINF * POSINF );
	POSINF = float64ToFloat32( POSINF * POSINF );

	// The reference tests these two in turn. Unreachable in IEEE 754 arithmetic: past the tests above ZERO is +0 and ONE positive and finite, so NEGINF is -Infinity and POSINF +Infinity:
	if ( NEGINF >= zero || POSINF <= one ) {
		return 0;
	}

	// Return if we were only asked to check infinity arithmetic:
	if ( ispec === 0 ) {
		return 1;
	}

	NAN1 = float64ToFloat32( POSINF + NEGINF );
	NAN2 = float64ToFloat32( POSINF / NEGINF );
	NAN3 = float64ToFloat32( POSINF / POSINF );
	NAN4 = float64ToFloat32( POSINF * zero );
	NAN5 = float64ToFloat32( NEGINF * NEGZRO );
	NAN6 = float64ToFloat32( NAN5 * zero );

	// The reference tests each value in turn (`NAN1.EQ.NAN1`, true unless NAN1 is NaN). Unreachable in IEEE 754 arithmetic: past the infinity tests, every one of these is NaN:
	if ( !isnan( NAN1 ) || !isnan( NAN2 ) || !isnan( NAN3 ) || !isnan( NAN4 ) || !isnan( NAN5 ) || !isnan( NAN6 ) ) {
		return 0;
	}
	return 1;
}


// EXPORTS //

export default ieeeck;
