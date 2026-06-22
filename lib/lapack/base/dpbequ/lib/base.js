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

// MAIN //

/**
* Computes row and column scalings intended to equilibrate a symmetric positive definite band matrix and reduce its condition number.
*
* ## Notes
*
* -   `S(i) = 1 / sqrt(A(i,i))`. The choice of S puts the condition number of
*     `B = S*A*S` within a factor N of the smallest possible condition number.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangle is stored (`upper` or `lower`)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of superdiagonals (if upper) or subdiagonals (if lower)
* @param {Float64Array} AB - input band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} s - output scale factors, length N
* @param {integer} strideS - stride for `s`
* @param {NonNegativeInteger} offsetS - starting index for `s`
* @returns {Object} result with `info`, `scond`, and `amax` properties
*/
function dpbequ( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB, s, strideS, offsetS ) {
	var smin;
	var amax;
	var si;
	var j;
	var i;

	// Quick return if possible:
	if ( N === 0 ) {
		return { 'info': 0, 'scond': 1.0, 'amax': 0.0 };
	}

	// Determine which row of band storage holds the diagonal:
	if ( uplo === 'upper' ) {
		// Upper band storage: diagonal at row KD (0-based)
		j = kd;
	} else {
		// Lower band storage: diagonal at row 0 (0-based)
		j = 0;
	}

	// Initialize SMIN and AMAX from the first diagonal element:
	si = offsetS;
	s[ si ] = AB[ offsetAB + ( j * strideAB1 ) ];
	smin = s[ si ];
	amax = s[ si ];

	// Find the minimum and maximum diagonal elements:
	for ( i = 1; i < N; i += 1 ) {
		si = offsetS + ( i * strideS );
		s[ si ] = AB[ offsetAB + ( j * strideAB1 ) + ( i * strideAB2 ) ];
		if ( s[ si ] < smin ) {
			smin = s[ si ];
		}
		if ( s[ si ] > amax ) {
			amax = s[ si ];
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

export default dpbequ;
