/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
const abs = Math.abs;
const max = Math.max;
const min = Math.min;


// FUNCTIONS //

/**
* Computes `CABS1(z) = |re(z)| + |im(z)|`.
*
* @private
* @param {Float64Array} v - interleaved real/imaginary array
* @param {integer} idx - index into the Float64 view (points at real part)
* @returns {number} CABS1 value
*/
function cabs1( v, idx ) {
	return abs( v[ idx ] ) + abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Computes the reciprocal pivot growth factor `norm(A)/norm(U)` for a complex general banded matrix.
*
* The "max absolute element" norm is used. If this is much less than 1, the
* stability of the LU factorization of the (equilibrated) matrix A could be
* poor.
*
* @private
* @param {NonNegativeInteger} N - number of linear equations (order of the matrix)
* @param {NonNegativeInteger} kl - number of subdiagonals within the band of A
* @param {NonNegativeInteger} ku - number of superdiagonals within the band of A
* @param {NonNegativeInteger} ncols - number of columns to process
* @param {Complex128Array} AB - original band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Complex128Array} AFB - LU factored band matrix from zgbtrf
* @param {integer} strideAFB1 - stride of the first dimension of `AFB`
* @param {integer} strideAFB2 - stride of the second dimension of `AFB`
* @param {NonNegativeInteger} offsetAFB - starting index for `AFB`
* @returns {number} reciprocal pivot growth factor
*/
function zla_gbrpvgrw( N, kl, ku, ncols, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB ) {
	let rpvgrw, amax, umax, i, j;

	const ABv = reinterpret( AB, 0 );
	const AFBv = reinterpret( AFB, 0 );

	// Convert complex-element strides/offsets to Float64 strides/offsets
	const sa1 = strideAB1 * 2;
	const sa2 = strideAB2 * 2;
	const sf1 = strideAFB1 * 2;
	const sf2 = strideAFB2 * 2;
	const oAB = offsetAB * 2;
	const oAF = offsetAFB * 2;

	rpvgrw = 1.0;
	const kd = ku;

	for ( j = 0; j < ncols; j += 1 ) {
		amax = 0.0;
		umax = 0.0;

		// Scan original band matrix column j for max CABS1 element
		for ( i = max( j - ku, 0 ); i < min( j + kl + 1, N ); i += 1 ) {
			amax = max( cabs1( ABv, oAB + ( ( kd + i - j ) * sa1 ) + ( j * sa2 ) ), amax );
		}

		// Scan U factor column j for max CABS1 element
		for ( i = max( j - ku, 0 ); i <= j; i += 1 ) {
			umax = max( cabs1( AFBv, oAF + ( ( kd + i - j ) * sf1 ) + ( j * sf2 ) ), umax );
		}
		if ( umax !== 0.0 ) {
			rpvgrw = min( amax / umax, rpvgrw );
		}
	}
	return rpvgrw;
}


// EXPORTS //

export default zla_gbrpvgrw;
