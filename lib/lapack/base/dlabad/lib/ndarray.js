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
 *
 * @param {number} small - underflow threshold as computed by dlamch
 * @param {number} large - overflow threshold as computed by dlamch
 * @returns {Object} object with `small` and `large` properties (unchanged)
 */

// MODULES //

import base from './base.js';


// MAIN //

/**
* Takes the square root of the overflow and underflow thresholds if the.
* exponent range is very large.
*
* @param {number} small - underflow threshold as computed by dlamch
* @param {number} large - overflow threshold as computed by dlamch
* @returns {Object} object with `small` and `large` properties
*/
function dlabad( small, large ) {
	return base( small, large );
}


// EXPORTS //

export default dlabad;
