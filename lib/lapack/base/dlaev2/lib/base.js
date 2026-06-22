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

// MAIN //

/**
* Computes the eigendecomposition of a 2-by-2 symmetric matrix:.
*
* \[ a  b \]
* \[ b  c \]
*
* On return:
*
* -   rt1: eigenvalue of larger absolute value
* -   rt2: eigenvalue of smaller absolute value
* -   cs1: cosine of the rotation
* -   sn1: sine of the rotation
*
* The rotation matrix \[cs1, sn1; -sn1, cs1\] diagonalizes the input:
* \[ cs1  sn1 \] \[ a  b \] \[ cs1 -sn1 \] = \[ rt1  0  \]
* \[-sn1  cs1 \] \[ b  c \] \[ sn1  cs1 \]   \[  0  rt2 \]
*
* @private
* @param {number} a - (1,1) element of the 2-by-2 matrix
* @param {number} b - (1,2) element (also (2,1)) of the 2-by-2 matrix
* @param {number} c - (2,2) element of the 2-by-2 matrix
* @returns {Object} object with `rt1`, `rt2`, `cs1`, and `sn1` properties
*/
function dlaev2( a, b, c ) {
	var acmn;
	var acmx;
	var sgn1;
	var sgn2;
	var adf;
	var acs;
	var cs1;
	var sn1;
	var rt1;
	var rt2;
	var sm;
	var tb;
	var ab;
	var cs;
	var ct;
	var df;
	var rt;
	var tn;

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
		sgn1 = -1;

		// rt2 via stable formula
		rt2 = (( acmx / rt1 ) * acmn) - (( b / rt1 ) * b);
	} else if ( sm > 0.0 ) {
		rt1 = 0.5 * ( sm + rt );
		sgn1 = 1;

		// rt2 via stable formula
		rt2 = (( acmx / rt1 ) * acmn) - (( b / rt1 ) * b);
	} else {
		// sm === 0: eigenvalues are +/- rt/2
		rt1 = 0.5 * rt;
		rt2 = -(0.5 * rt);
		sgn1 = 1;
	}

	// Compute eigenvector
	if ( df >= 0.0 ) {
		cs = df + rt;
		sgn2 = 1;
	} else {
		cs = df - rt;
		sgn2 = -1;
	}
	acs = Math.abs( cs );

	if ( acs > ab ) {
		ct = -(tb / cs);
		sn1 = 1.0 / Math.sqrt( 1.0 + (ct * ct) );
		cs1 = ct * sn1;
	} else if ( ab === 0.0 ) {
		cs1 = 1.0;
		sn1 = 0.0;
	} else {
		tn = -(cs / tb);
		cs1 = 1.0 / Math.sqrt( 1.0 + (tn * tn) );
		sn1 = tn * cs1;
	}

	// Correct signs of eigenvector components
	if ( sgn1 === sgn2 ) {
		tn = cs1;
		cs1 = -sn1;
		sn1 = tn;
	}

	return {
		'rt1': rt1,
		'rt2': rt2,
		'cs1': cs1,
		'sn1': sn1
	};
}


// EXPORTS //

export default dlaev2;
