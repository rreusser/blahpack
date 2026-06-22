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

/* eslint-disable max-len, max-params, object-curly-newline, object-property-newline */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Computes row and column scalings intended to equilibrate a complex Hermitian positive definite matrix in packed storage and reduce its condition number.
*
* ## Notes
*
* -   `S(i) = 1 / sqrt(Re(A(i,i)))`. The choice of S puts the condition number of
*     `B = S*A*S` within a factor N of the smallest possible condition number.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangle is stored (`upper` or `lower`)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} AP - input Hermitian positive definite matrix in packed storage, length `N*(N+1)/2`
* @param {integer} strideAP - stride for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} s - output scale factors, length N
* @param {integer} strideS - stride for `s`
* @param {NonNegativeInteger} offsetS - starting index for `s`
* @returns {Object} result with `info`, `scond`, and `amax` properties
*/
function zppequ( uplo, N, AP, strideAP, offsetAP, s, strideS, offsetS ) {
	var smin;
	var amax;
	var sAP;
	var oAP;
	var apv;
	var jj;
	var si;
	var i;

	// Quick return if possible:
	if ( N === 0 ) {
		return { 'info': 0, 'scond': 1.0, 'amax': 0.0 };
	}

	// Reinterpret Complex128Array as Float64Array and convert stride/offset to Float64 units:
	apv = reinterpret( AP, 0 );
	sAP = strideAP * 2;
	oAP = offsetAP * 2;

	// Initialize SMIN and AMAX from the real part of the first diagonal element:
	si = offsetS;
	s[ si ] = apv[ oAP ];
	smin = s[ si ];
	amax = s[ si ];

	if ( uplo === 'upper' ) {
		// Upper triangle packed storage: diagonal elements at positions
		// j*(j+1)/2 (0-based), i.e. 0, 2, 5, 9, ...
		jj = 0;
		for ( i = 1; i < N; i += 1 ) {
			jj += ( i + 1 ) * sAP;
			si = offsetS + ( i * strideS );
			s[ si ] = apv[ oAP + jj ];
			if ( s[ si ] < smin ) {
				smin = s[ si ];
			}
			if ( s[ si ] > amax ) {
				amax = s[ si ];
			}
		}
	} else {
		// Lower triangle packed storage: diagonal elements at positions
		// 0, N, 2N-1, 3N-3, ...
		jj = 0;
		for ( i = 1; i < N; i += 1 ) {
			jj += ( N - i + 1 ) * sAP;
			si = offsetS + ( i * strideS );
			s[ si ] = apv[ oAP + jj ];
			if ( s[ si ] < smin ) {
				smin = s[ si ];
			}
			if ( s[ si ] > amax ) {
				amax = s[ si ];
			}
		}
	}

	if ( smin <= 0.0 ) {
		// Find the first non-positive diagonal element and return:
		for ( i = 0; i < N; i += 1 ) {
			if ( s[ offsetS + ( i * strideS ) ] <= 0.0 ) {
				return { 'info': i + 1, 'scond': 0.0, 'amax': amax };
			}
		}
	}

	// Set the scale factors to the reciprocals of the diagonal elements:
	for ( i = 0; i < N; i += 1 ) {
		si = offsetS + ( i * strideS );
		s[ si ] = 1.0 / Math.sqrt( s[ si ] );
	}

	// Compute SCOND = sqrt(min(diag)) / sqrt(max(diag)):
	return { 'info': 0, 'scond': Math.sqrt( smin ) / Math.sqrt( amax ), 'amax': amax };
}


// EXPORTS //

export default zppequ;
