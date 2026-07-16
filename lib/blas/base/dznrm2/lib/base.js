/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// VARIABLES //

// Blue's scaling constants for IEEE 754 double precision:
var TSML = 1.4916681462400413e-154;  // 2^ceil((emin-1)/2) = 2^-511
var TBIG = 1.9979190722022350e+146;  // 2^floor((emax-digits+1)/2) = 2^486
var SSML = 4.4989137945431964e+161;  // 2^(-floor((emin-digits)/2)) = 2^537
var SBIG = 1.1113793747425387e-162;  // 2^(-ceil((emax+digits-1)/2)) = 2^-538

// Fast-path acceptance window for the unscaled sum of squares. Inside this
// window the plain sum is exact to working precision: no partial sum can
// have overflowed (Inf falls outside), and contributions lost to underflow
// (< 2^-1074 each) are negligible relative to 1.0e-140. Outside it, fall
// back to Blue's scaled algorithm. Same window as the shipped dnrm2 fast
// path — a complex norm is a sum of squares of the interleaved re/im parts.
var SSQ_SML = 1.0e-140;
var SSQ_BIG = 1.0e+140;


// MAIN //

/**
* Computes the Euclidean norm of a complex double-precision vector.
*
* Uses a plain unscaled sum of squares over the interleaved real/imaginary
* components when the result is safely inside the IEEE range, and falls back
* to the "blue" scaled algorithm otherwise.
*
* @private
* @param {NonNegativeInteger} N - number of indexed elements
* @param {Complex128Array} zx - complex input vector
* @param {integer} strideX - stride in complex elements
* @param {NonNegativeInteger} offsetX - starting index (in complex elements)
* @returns {number} Euclidean norm
*/
function dznrm2( N, zx, strideX, offsetX ) {
	var notbig;
	var sumsq;
	var abig;
	var amed;
	var asml;
	var step;
	var xv;
	var ax;
	var ix;
	var s0;
	var s1;
	var s2;
	var s3;
	var v0;
	var v1;
	var v2;
	var v3;
	var m;
	var i;

	if ( N <= 0 ) {
		return 0.0;
	}

	xv = reinterpret( zx, 0 );

	// Fast path: unscaled sum of squares in four independent accumulators.
	s0 = 0.0;
	s1 = 0.0;
	s2 = 0.0;
	s3 = 0.0;
	ix = offsetX * 2;
	if ( strideX === 1 ) {
		// Contiguous: 2*N real doubles laid out re,im,re,im,...
		m = ( 2 * N ) - ( ( 2 * N ) % 4 );
		for ( i = 0; i < m; i += 4 ) {
			v0 = xv[ ix ];
			v1 = xv[ ix + 1 ];
			v2 = xv[ ix + 2 ];
			v3 = xv[ ix + 3 ];
			s0 += v0 * v0;
			s1 += v1 * v1;
			s2 += v2 * v2;
			s3 += v3 * v3;
			ix += 4;
		}
		// Tail: a single leftover complex element (present when N is odd) is
		// two doubles re,im. Distribute re->s0, im->s1 to match the strided
		// path's tail exactly, so the running sums round identically and the
		// result is bit-exact regardless of stride (layout invariance).
		for ( ; i < 2 * N; i += 2 ) {
			v0 = xv[ ix ];
			v1 = xv[ ix + 1 ];
			s0 += v0 * v0;
			s1 += v1 * v1;
			ix += 2;
		}
	} else {
		// Strided: walk complex elements; re/im are adjacent within each.
		step = 2 * strideX;
		m = N - ( N % 2 );
		for ( i = 0; i < m; i += 2 ) {
			v0 = xv[ ix ];
			v1 = xv[ ix + 1 ];
			v2 = xv[ ix + step ];
			v3 = xv[ ix + step + 1 ];
			s0 += v0 * v0;
			s1 += v1 * v1;
			s2 += v2 * v2;
			s3 += v3 * v3;
			ix += 2 * step;
		}
		for ( ; i < N; i++ ) {
			v0 = xv[ ix ];
			v1 = xv[ ix + 1 ];
			s0 += v0 * v0;
			s1 += v1 * v1;
			ix += step;
		}
	}
	sumsq = ( s0 + s1 ) + ( s2 + s3 );
	if ( sumsq > SSQ_SML && sumsq < SSQ_BIG ) {
		return Math.sqrt( sumsq );
	}

	// Fallback: Blue's scaled algorithm (reference implementation).
	notbig = true;
	asml = 0.0;
	amed = 0.0;
	abig = 0.0;

	ix = offsetX * 2;
	for ( i = 0; i < N; i++ ) {
		// Process real part:
		ax = Math.abs( xv[ ix ] );
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

		// Process imaginary part:
		ax = Math.abs( xv[ ix + 1 ] );
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

		ix += 2 * strideX;
	}

	// Combine the partial sums:
	if ( abig > 0.0 ) {
		// Scale sumsq to avoid overflow:
		if ( amed > 0.0 || amed !== amed ) {
			abig += ( amed * SBIG ) * SBIG;
		}
		return Math.sqrt( abig ) / SBIG;
	}
	if ( asml > 0.0 ) {
		// Scale sumsq to avoid underflow:
		if ( amed > 0.0 || amed !== amed ) {
			amed = Math.sqrt( amed );
			asml = Math.sqrt( asml ) / SSML;
			if ( asml > amed ) {
				return asml * Math.sqrt( 1.0 + (( amed / asml ) * ( amed / asml )) );
			}
			return amed * Math.sqrt( 1.0 + (( asml / amed ) * ( asml / amed )) );
		}
		return Math.sqrt( asml ) / SSML;
	}
	return Math.sqrt( amed );
}


// EXPORTS //

export default dznrm2;
