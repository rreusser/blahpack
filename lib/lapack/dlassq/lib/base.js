/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// VARIABLES //

// Blue's scaling constants for double precision (IEEE 754):

//   radix=2, minexponent=-1021, maxexponent=1024, digits=53
const TSML = Math.pow( 2, -511 );  // threshold: values smaller than this are "small"
const TBIG = Math.pow( 2, 486 );   // threshold: values bigger than this are "big"
const SSML = Math.pow( 2, 537 );   // scale-up multiplier for small values
const SBIG = Math.pow( 2, -538 );  // scale-down multiplier for big values


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
* @param {integer} N - number of elements
* @param {Float64Array} x - input array
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} scale - input/output (length-1 array): input scale
* @param {Float64Array} sumsq - input/output (length-1 array): input sum of squares
*/
function dlassq( N, x, strideX, offsetX, scale, sumsq ) {
	let notbig, abig, amed, asml, ymax, ymin, ax, ix, i;

	// Quick return if NaN
	if ( scale[ 0 ] !== scale[ 0 ] || sumsq[ 0 ] !== sumsq[ 0 ] ) {
		return;
	}
	if ( sumsq[ 0 ] === 0.0 ) {
		scale[ 0 ] = 1.0;
	}
	if ( scale[ 0 ] === 0.0 ) {
		scale[ 0 ] = 1.0;
		sumsq[ 0 ] = 0.0;
	}
	if ( N <= 0 ) {
		return;
	}

	// Compute the sum of squares in 3 accumulators:
	//   abig -- sums of squares scaled down to avoid overflow
	//   asml -- sums of squares scaled up to avoid underflow
	//   amed -- sums of squares that do not require scaling
	notbig = true;
	asml = 0.0;
	amed = 0.0;
	abig = 0.0;

	ix = offsetX;
	if ( strideX < 0 ) {
		ix = offsetX - (( N - 1 ) * strideX);
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
		ix += strideX;
	}

	// Put the existing sum of squares into one of the accumulators
	if ( sumsq[ 0 ] > 0.0 ) {
		ax = scale[ 0 ] * Math.sqrt( sumsq[ 0 ] );
		if ( ax > TBIG ) {
			if ( scale[ 0 ] > 1.0 ) {
				scale[ 0 ] *= SBIG;
				abig += scale[ 0 ] * ( scale[ 0 ] * sumsq[ 0 ] );
			} else {
				// sumsq > tbig^2 => (sbig * (sbig * sumsq)) is representable
				abig += scale[ 0 ] * ( scale[ 0 ] * ( SBIG * ( SBIG * sumsq[ 0 ] ) ) );
			}
		} else if ( ax < TSML ) {
			if ( notbig ) {
				if ( scale[ 0 ] < 1.0 ) {
					scale[ 0 ] *= SSML;
					asml += scale[ 0 ] * ( scale[ 0 ] * sumsq[ 0 ] );
				} else {
					// sumsq < tsml^2 => (ssml * (ssml * sumsq)) is representable
					asml += scale[ 0 ] * ( scale[ 0 ] * ( SSML * ( SSML * sumsq[ 0 ] ) ) );
				}
			}
		} else {
			amed += scale[ 0 ] * ( scale[ 0 ] * sumsq[ 0 ] );
		}
	}

	// Combine accumulators
	if ( abig > 0.0 ) {
		// Combine abig and amed
		if ( amed > 0.0 || amed !== amed ) {
			abig += ( amed * SBIG ) * SBIG;
		}
		scale[ 0 ] = 1.0 / SBIG;
		sumsq[ 0 ] = abig;
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
			scale[ 0 ] = 1.0;
			sumsq[ 0 ] = (ymax * ymax) * ( 1.0 + (( ymin / ymax ) * ( ymin / ymax )) );
		} else {
			scale[ 0 ] = 1.0 / SSML;
			sumsq[ 0 ] = asml;
		}
	} else {
		// All values are mid-range or zero
		scale[ 0 ] = 1.0;
		sumsq[ 0 ] = amed;
	}

}


// EXPORTS //

export default dlassq;
