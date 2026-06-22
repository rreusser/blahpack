/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
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
