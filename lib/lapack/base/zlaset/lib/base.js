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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Initializes a complex matrix to BETA on the diagonal and ALPHA on the.
* off-diagonals.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, otherwise full
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128} alpha - complex off-diagonal value
* @param {Complex128} beta - complex diagonal value
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @returns {Complex128Array} A
*/
function zlaset( uplo, M, N, alpha, beta, A, strideA1, strideA2, offsetA ) {
	var alphaRe;
	var alphaIm;
	var betaRe;
	var betaIm;
	var sa1;
	var sa2;
	var idx;
	var Av;
	var oA;
	var mn;
	var i;
	var j;

	alphaRe = real( alpha );
	alphaIm = imag( alpha );
	betaRe = real( beta );
	betaIm = imag( beta );

	Av = reinterpret( A, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;
	mn = Math.min( M, N );

	if ( uplo === 'upper' ) {
		// Set the strictly upper triangular part to ALPHA.
		for ( j = 1; j < N; j++ ) {
			idx = oA + (j * sa2);
			for ( i = 0; i < Math.min( j, M ); i++ ) {
				Av[ idx ] = alphaRe;
				Av[ idx + 1 ] = alphaIm;
				idx += sa1;
			}
		}
		// Set the diagonal to BETA.
		idx = oA;
		for ( i = 0; i < mn; i++ ) {
			Av[ idx ] = betaRe;
			Av[ idx + 1 ] = betaIm;
			idx += sa1 + sa2;
		}
	} else if ( uplo === 'lower' ) {
		// Set the strictly lower triangular part to ALPHA.
		for ( j = 0; j < Math.min( M, N ); j++ ) {
			idx = oA + (( j + 1 ) * sa1) + (j * sa2);
			for ( i = j + 1; i < M; i++ ) {
				Av[ idx ] = alphaRe;
				Av[ idx + 1 ] = alphaIm;
				idx += sa1;
			}
		}
		// Set the diagonal to BETA.
		idx = oA;
		for ( i = 0; i < mn; i++ ) {
			Av[ idx ] = betaRe;
			Av[ idx + 1 ] = betaIm;
			idx += sa1 + sa2;
		}
	} else {
		// Set the full array to ALPHA, then overwrite diagonal with BETA.
		for ( j = 0; j < N; j++ ) {
			idx = oA + (j * sa2);
			for ( i = 0; i < M; i++ ) {
				Av[ idx ] = alphaRe;
				Av[ idx + 1 ] = alphaIm;
				idx += sa1;
			}
		}
		idx = oA;
		for ( i = 0; i < mn; i++ ) {
			Av[ idx ] = betaRe;
			Av[ idx + 1 ] = betaIm;
			idx += sa1 + sa2;
		}
	}
	return A;
}


// EXPORTS //

export default zlaset;
