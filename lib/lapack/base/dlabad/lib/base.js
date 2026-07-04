/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable @cspell/spellchecker */

// MAIN //

/**
* Adjusts the underflow and overflow thresholds if the exponent range is very large (no-op on IEEE-754 machines).
*
* ## Notes
*
* -   In LAPACK 3.12.0, this routine is a no-op kept for backward
*     compatibility. All modern machines are IEEE-754 compliant.
*
* -   The original behavior was: if `log10(large) > 2000`, set
*     `small = sqrt(small)` and `large = sqrt(large)`.
*
* @private
* @param {number} small - underflow threshold as computed by dlamch
* @param {number} large - overflow threshold as computed by dlamch
* @returns {Object} object with `small` and `large` properties (unchanged)
*/
function dlabad( small, large ) {
	return {
		'small': small,
		'large': large
	};
}


// EXPORTS //

export default dlabad;
