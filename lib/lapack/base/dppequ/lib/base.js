/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, object-curly-newline, object-property-newline */

// MAIN //

/**
* Computes row and column scalings intended to equilibrate a symmetric positive definite matrix in packed storage and reduce its condition number.
*
* ## Notes
*
* -   `S(i) = 1 / sqrt(A(i,i))`. The choice of S puts the condition number of
*     `B = S*A*S` within a factor N of the smallest possible condition number.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangle is stored (`upper` or `lower`)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} AP - input symmetric positive definite matrix in packed storage, length `N*(N+1)/2`
* @param {integer} strideAP - stride for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} s - output scale factors, length N
* @param {integer} strideS - stride for `s`
* @param {NonNegativeInteger} offsetS - starting index for `s`
* @param {Float64Array} scond - output (length-1 array): if INFO = 0, S contains the ratio of the smallest S(i) to the largest S(i)
* @param {Float64Array} amax - output (length-1 array): absolute value of largest matrix element
* @returns {integer} status code (0 = success)
*/
function dppequ( uplo, N, AP, strideAP, offsetAP, s, strideS, offsetS, scond, amax ) {
	let smin, jj, si, i;

	// Quick return if possible:
	if ( N === 0 ) {
		scond[ 0 ] = 1.0;
		amax[ 0 ] = 0.0;
		return 0;
	}

	// Initialize SMIN and AMAX from the first diagonal element:
	si = offsetS;
	s[ si ] = AP[ offsetAP ];
	smin = s[ si ];
	amax[ 0 ] = s[ si ];

	if ( uplo === 'upper' ) {
		// Upper triangle packed storage: diagonal elements at positions
		// j*(j+1)/2 (0-based), i.e. 0, 2, 5, 9, ...
		jj = 0;
		for ( i = 1; i < N; i += 1 ) {
			jj += ( i + 1 ) * strideAP;
			si = offsetS + ( i * strideS );
			s[ si ] = AP[ offsetAP + jj ];
			if ( s[ si ] < smin ) {
				smin = s[ si ];
			}
			if ( s[ si ] > amax[ 0 ] ) {
				amax[ 0 ] = s[ si ];
			}
		}
	} else {
		// Lower triangle packed storage: diagonal elements at positions
		// 0, N, 2N-1, 3N-3, ...
		jj = 0;
		for ( i = 1; i < N; i += 1 ) {
			jj += ( N - i + 1 ) * strideAP;
			si = offsetS + ( i * strideS );
			s[ si ] = AP[ offsetAP + jj ];
			if ( s[ si ] < smin ) {
				smin = s[ si ];
			}
			if ( s[ si ] > amax[ 0 ] ) {
				amax[ 0 ] = s[ si ];
			}
		}
	}

	if ( smin <= 0.0 ) {
		// Find the first non-positive diagonal element and return:
		for ( i = 0; i < N; i += 1 ) {
			if ( s[ offsetS + ( i * strideS ) ] <= 0.0 ) {
				scond[ 0 ] = 0.0;
				return i + 1;
			}
		}
	}

	// Set the scale factors to the reciprocals of the diagonal elements:
	for ( i = 0; i < N; i += 1 ) {
		si = offsetS + ( i * strideS );
		s[ si ] = 1.0 / Math.sqrt( s[ si ] );
	}

	// Compute SCOND = sqrt(min(diag)) / sqrt(max(diag)):
	scond[ 0 ] = Math.sqrt( smin ) / Math.sqrt( amax[ 0 ] );
	return 0;
}


// EXPORTS //

export default dppequ;
