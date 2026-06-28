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

// VARIABLES //

// Blue's scaling constants for double precision (IEEE 754):

//   radix=2, minexponent=-1021, maxexponent=1024, digits=53
var TSML = Math.pow( 2, -511 );  // threshold: values smaller than this are "small"
var TBIG = Math.pow( 2, 486 );   // threshold: values bigger than this are "big"
var SSML = Math.pow( 2, 537 );   // scale-up multiplier for small values
var SBIG = Math.pow( 2, -538 );  // scale-down multiplier for big values


// MAIN //

/**
* Returns updated scale and sum-of-squares in scaled form.
*
* The return value satisfies:
* `scale_out^2*sumsq_out = x(1)^2 + ... + x(n)^2 + scale_in^2*sumsq_in`
*
* Uses Blue's safe-scaling algorithm to avoid overflow/underflow.
*
* @private
* @param {NonNegativeInteger} N - number of elements
* @param {Float64Array} x - input array
* @param {integer} stride - stride length for `x`
* @param {NonNegativeInteger} offset - starting index for `x`
* @param {number} scale - input scale
* @param {number} sumsq - input sum of squares
* @returns {Object} object with `scl` and `sumsq` properties
*/
function dlassq( N, x, stride, offset, scale, sumsq ) {
	var notbig;
	var abig;
	var amed;
	var asml;
	var ymax;
	var ymin;
	var ax;
	var ix;
	var i;

	// Quick return if NaN
	if ( scale !== scale || sumsq !== sumsq ) {
		return {
			'scl': scale,
			'sumsq': sumsq
		};
	}
	if ( sumsq === 0.0 ) {
		scale = 1.0;
	}
	if ( scale === 0.0 ) {
		scale = 1.0;
		sumsq = 0.0;
	}
	if ( N <= 0 ) {
		return {
			'scl': scale,
			'sumsq': sumsq
		};
	}

	// Compute the sum of squares in 3 accumulators:
	//   abig -- sums of squares scaled down to avoid overflow
	//   asml -- sums of squares scaled up to avoid underflow
	//   amed -- sums of squares that do not require scaling
	notbig = true;
	asml = 0.0;
	amed = 0.0;
	abig = 0.0;

	ix = offset;
	if ( stride < 0 ) {
		ix = offset - (( N - 1 ) * stride);
	}

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

	// Put the existing sum of squares into one of the accumulators
	if ( sumsq > 0.0 ) {
		ax = scale * Math.sqrt( sumsq );
		if ( ax > TBIG ) {
			if ( scale > 1.0 ) {
				scale *= SBIG;
				abig += scale * ( scale * sumsq );
			} else {
				// sumsq > tbig^2 => (sbig * (sbig * sumsq)) is representable
				abig += scale * ( scale * ( SBIG * ( SBIG * sumsq ) ) );
			}
		} else if ( ax < TSML ) {
			if ( notbig ) {
				if ( scale < 1.0 ) {
					scale *= SSML;
					asml += scale * ( scale * sumsq );
				} else {
					// sumsq < tsml^2 => (ssml * (ssml * sumsq)) is representable
					asml += scale * ( scale * ( SSML * ( SSML * sumsq ) ) );
				}
			}
		} else {
			amed += scale * ( scale * sumsq );
		}
	}

	// Combine accumulators
	if ( abig > 0.0 ) {
		// Combine abig and amed
		if ( amed > 0.0 || amed !== amed ) {
			abig += ( amed * SBIG ) * SBIG;
		}
		scale = 1.0 / SBIG;
		sumsq = abig;
	} else if ( asml > 0.0 ) {
		// Combine amed and asml
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
			scale = 1.0;
			sumsq = (ymax * ymax) * ( 1.0 + (( ymin / ymax ) * ( ymin / ymax )) );
		} else {
			scale = 1.0 / SSML;
			sumsq = asml;
		}
	} else {
		// All values are mid-range or zero
		scale = 1.0;
		sumsq = amed;
	}

	return {
		'scl': scale,
		'sumsq': sumsq
	};
}


// EXPORTS //

export default dlassq;
