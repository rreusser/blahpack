/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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

// MAIN //

/**
* Computes the eigenvalues of a 2-by-2 symmetric matrix:.
*
* \[ a  b \]
* \[ b  c \]
*
* On return, rt1 is the eigenvalue of larger absolute value, and rt2 is the
* eigenvalue of smaller absolute value.
*
* Uses the formula:
* rt1 = (sm + rt) / 2   or  (sm - rt) / 2  depending on sign of sm
* `rt2 = (acmx / rt1)*acmn - (b / rt1)*b`
* where sm = a + c, df = a - c, and rt = sqrt(df^2 + 4*b^2).
*
* @private
* @param {number} a - (1,1) element of the 2-by-2 matrix
* @param {number} b - (1,2) element (also (2,1)) of the 2-by-2 matrix
* @param {number} c - (2,2) element of the 2-by-2 matrix
* @returns {Object} object with `rt1` and `rt2` eigenvalues
*
* @example
* var out = dlae2( 1.0, 2.0, 1.0 );
* // returns { 'rt1': 3.0, 'rt2': -1.0 }
*/
function dlae2( a, b, c ) {
	var acmn;
	var acmx;
	var adf;
	var rt1;
	var rt2;
	var sm;
	var tb;
	var ab;
	var df;
	var rt;

	// Compute sum and difference of diagonal elements
	sm = a + c;
	df = a - c;
	adf = Math.abs( df );
	tb = b + b;
	ab = Math.abs( tb );

	// Determine which diagonal element is larger in absolute value
	if ( Math.abs( a ) > Math.abs( c ) ) {
		acmx = a;
		acmn = c;
	} else {
		acmx = c;
		acmn = a;
	}

	// Compute rt = sqrt( df^2 + (2*b)^2 ) using stable hypot-style formula
	if ( adf > ab ) {
		rt = adf * Math.sqrt( 1.0 + (( ab / adf ) * ( ab / adf )) );
	} else if ( adf < ab ) {
		rt = ab * Math.sqrt( 1.0 + (( adf / ab ) * ( adf / ab )) );
	} else {
		// adf === ab (includes adf === ab === 0)
		rt = ab * Math.sqrt( 2.0 );
	}

	// Compute eigenvalues
	if ( sm < 0.0 ) {
		rt1 = 0.5 * ( sm - rt );

		// Order eigenvalues: |rt1| >= |rt2| guaranteed by rt1 = (sm - rt)/2
		// When sm < 0, rt1 is the most negative => largest in absolute value
		rt2 = (( acmx / rt1 ) * acmn) - (( b / rt1 ) * b);
	} else if ( sm > 0.0 ) {
		rt1 = 0.5 * ( sm + rt );

		// rt2 via stable formula to avoid cancellation
		rt2 = (( acmx / rt1 ) * acmn) - (( b / rt1 ) * b);
	} else {
		// sm === 0: eigenvalues are +/- rt/2
		rt1 = 0.5 * rt;
		rt2 = -(0.5 * rt);
	}

	return {
		'rt1': rt1,
		'rt2': rt2
	};
}


// EXPORTS //

export default dlae2;
