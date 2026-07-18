/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// VARIABLES //

// Blue's scaling constants for IEEE 754 double precision:
const TSML = 1.4916681462400413e-154;  // 2^ceil((emin-1)/2) = 2^-511
const TBIG = 1.9979190722022350e+146;  // 2^floor((emax-digits+1)/2) = 2^486
const SSML = 4.4989137945431964e+161;  // 2^(-floor((emin-digits)/2)) = 2^537
const SBIG = 1.1113793747425387e-162;  // 2^(-ceil((emax+digits-1)/2)) = 2^-538

// Fast-path acceptance window for the unscaled sum of squares. Inside this
// window the plain sum is exact to working precision: no partial sum can
// have overflowed (Inf falls outside), and contributions lost to underflow
// (< 2^-1074 each) are negligible relative to 1.0e-140. Outside it, fall
// back to Blue's scaled algorithm.
const SSQ_SML = 1.0e-140;
const SSQ_BIG = 1.0e+140;


// MAIN //

/**
* Computes the Euclidean norm of a real double-precision vector.
*
* Uses a plain unrolled sum of squares when the result is safely inside the
* IEEE range and falls back to the "blue" scaled algorithm for
* overflow/underflow-safe computation otherwise.
*
* @private
* @param {NonNegativeInteger} N - number of indexed elements
* @param {Float64Array} x - input array
* @param {integer} stride - stride length
* @param {NonNegativeInteger} offset - starting index
* @returns {number} Euclidean norm
*/
function dnrm2( N, x, stride, offset ) {
	let notbig, sumsq, abig, amed, asml, ymin, ymax, scl, ax, ix, s0, s1, s2;
	let s3, v0, v1, v2, v3, i;

	if ( N <= 0 ) {
		return 0.0;
	}

	// Fast path: unscaled sum of squares in four independent accumulators.
	s0 = 0.0;
	s1 = 0.0;
	s2 = 0.0;
	s3 = 0.0;
	ix = offset;
	const m = N - ( N % 4 );
	if ( stride === 1 ) {
		for ( i = 0; i < m; i += 4 ) {
			v0 = x[ ix ];
			v1 = x[ ix + 1 ];
			v2 = x[ ix + 2 ];
			v3 = x[ ix + 3 ];
			s0 += v0 * v0;
			s1 += v1 * v1;
			s2 += v2 * v2;
			s3 += v3 * v3;
			ix += 4;
		}
	} else {
		for ( i = 0; i < m; i += 4 ) {
			v0 = x[ ix ];
			v1 = x[ ix + stride ];
			v2 = x[ ix + ( 2 * stride ) ];
			v3 = x[ ix + ( 3 * stride ) ];
			s0 += v0 * v0;
			s1 += v1 * v1;
			s2 += v2 * v2;
			s3 += v3 * v3;
			ix += 4 * stride;
		}
	}
	for ( ; i < N; i++ ) {
		v0 = x[ ix ];
		s0 += v0 * v0;
		ix += stride;
	}
	sumsq = ( s0 + s1 ) + ( s2 + s3 );
	if ( sumsq > SSQ_SML && sumsq < SSQ_BIG ) {
		return Math.sqrt( sumsq );
	}

	// Fallback: Blue's scaled algorithm (reference implementation).
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
