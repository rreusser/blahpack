/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

const abs = Math.abs;
const sqrt = Math.sqrt;


// MAIN //

/**
* Computes the splitting points with threshold based on the representation.
*
* Sets any "small" off-diagonal elements to zero. Two criteria are supported:
* `spltol < 0` uses an absolute off-diagonal threshold, while `spltol > 0`
* uses a criterion that preserves relative accuracy.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements of the tridiagonal matrix, length N
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - subdiagonal elements (in/out), length N
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} E2 - squares of subdiagonal elements (in/out), length N
* @param {integer} strideE2 - stride length for `E2`
* @param {NonNegativeInteger} offsetE2 - starting index for `E2`
* @param {number} spltol - splitting threshold
* @param {number} tnrm - norm of the matrix
* @param {Int32Array} nsplit - output: number of blocks (nsplit[0])
* @param {Int32Array} ISPLIT - output: splitting points array
* @param {integer} strideISPLIT - stride length for `ISPLIT`
* @param {NonNegativeInteger} offsetISPLIT - starting index for `ISPLIT`
* @returns {integer} info - status code (0 = success)
*/
function dlarra( N, d, strideD, offsetD, e, strideE, offsetE, E2, strideE2, offsetE2, spltol, tnrm, nsplit, ISPLIT, strideISPLIT, offsetISPLIT ) {
	let eabs, tmp1, nsp, ie, id, i;

	nsplit[ 0 ] = 1;

	// Quick return if possible:
	if ( N <= 0 ) {
		return 0;
	}

	nsp = 1;
	ie = offsetE;
	id = offsetD;

	if ( spltol < 0.0 ) {
		// Criterion based on absolute off-diagonal value:
		tmp1 = abs( spltol ) * tnrm;
		for ( i = 0; i < N - 1; i += 1 ) {
			eabs = abs( e[ ie ] );
			if ( eabs <= tmp1 ) {
				e[ ie ] = 0.0;
				E2[ offsetE2 + ( i * strideE2 ) ] = 0.0;
				ISPLIT[ offsetISPLIT + ( ( nsp - 1 ) * strideISPLIT ) ] = i + 1;
				nsp += 1;
			}
			ie += strideE;
		}
	} else {
		// Criterion that guarantees relative accuracy:
		for ( i = 0; i < N - 1; i += 1 ) {
			eabs = abs( e[ ie ] );
			if ( eabs <= spltol * sqrt( abs( d[ id ] ) ) * sqrt( abs( d[ id + strideD ] ) ) ) {
				e[ ie ] = 0.0;
				E2[ offsetE2 + ( i * strideE2 ) ] = 0.0;
				ISPLIT[ offsetISPLIT + ( ( nsp - 1 ) * strideISPLIT ) ] = i + 1;
				nsp += 1;
			}
			ie += strideE;
			id += strideD;
		}
	}
	ISPLIT[ offsetISPLIT + ( ( nsp - 1 ) * strideISPLIT ) ] = N;
	nsplit[ 0 ] = nsp;

	return 0;
}


// EXPORTS //

export default dlarra;
