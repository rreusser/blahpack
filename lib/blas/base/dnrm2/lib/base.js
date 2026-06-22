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

// VARIABLES //

// Blue's scaling constants for IEEE 754 double precision:
var TSML = 1.4916681462400413e-154;  // 2^ceil((emin-1)/2) = 2^-511
var TBIG = 1.9979190722022350e+146;  // 2^floor((emax-digits+1)/2) = 2^486
var SSML = 4.4989137945431964e+161;  // 2^(-floor((emin-digits)/2)) = 2^537
var SBIG = 1.1113793747425387e-162;  // 2^(-ceil((emax+digits-1)/2)) = 2^-538


// MAIN //

/**
* Computes the Euclidean norm of a real double-precision vector.
*
* Uses the "blue" algorithm for overflow/underflow-safe computation.
*
* @private
* @param {NonNegativeInteger} N - number of indexed elements
* @param {Float64Array} x - input array
* @param {integer} stride - stride length
* @param {NonNegativeInteger} offset - starting index
* @returns {number} Euclidean norm
*/
function dnrm2( N, x, stride, offset ) {
	var notbig;
	var sumsq;
	var abig;
	var amed;
	var asml;
	var ymin;
	var ymax;
	var scl;
	var ax;
	var ix;
	var i;

	if ( N <= 0 ) {
		return 0.0;
	}

	scl = 1.0;
	sumsq = 0.0;
	notbig = true;
	asml = 0.0;
	amed = 0.0;
	abig = 0.0;

	ix = offset;
	for ( i = 0; i < N; i++ ) {
		ax = Math.abs( x[ ix ] );
		if ( ax > TBIG ) {
			abig += ( ax * SBIG ) * ( ax * SBIG );
			notbig = false;
		} else if ( ax < TSML ) {
			if ( notbig ) {
				asml += ( ax * SSML ) * ( ax * SSML );
			}
		} else {
			amed += ax * ax;
		}
		ix += stride;
	}

	// Combine the partial sums:
	if ( abig > 0.0 ) {
		if ( amed > 0.0 || amed !== amed ) {
			abig += ( amed * SBIG ) * SBIG;
		}
		scl = 1.0 / SBIG;
		sumsq = abig;
	} else if ( asml > 0.0 ) {
		if ( amed > 0.0 || amed !== amed ) {
			amed = Math.sqrt( amed );
			asml = Math.sqrt( asml ) / SSML;
			if ( asml > amed ) {
				ymin = amed;
				ymax = asml;
			} else {
				ymin = asml;
				ymax = amed;
			}
			scl = 1.0;
			sumsq = ymax * ymax * ( 1.0 + (( ymin / ymax ) * ( ymin / ymax )) );
		} else {
			scl = 1.0 / SSML;
			sumsq = asml;
		}
	} else {
		scl = 1.0;
		sumsq = amed;
	}
	return scl * Math.sqrt( sumsq );
}


// EXPORTS //

export default dnrm2;
