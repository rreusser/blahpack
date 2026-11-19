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

// MAIN //

/**
* Computes row and column scalings intended to equilibrate a symmetric positive.
* definite matrix A and reduce its condition number.
*
* S(i) = 1 / sqrt(A(i,i)). The choice of S puts the condition number of
* B = S_A_S within a factor N of the smallest possible condition number.
*
* Returns an object with:
* - info: 0 if successful; i (1-based) if the i-th diagonal element is non-positive.
* - scond: ratio of smallest to largest scaling factor
* - amax: absolute value of the largest diagonal element
*
* @private
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input N-by-N symmetric positive definite matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} s - output scale factors, length N
* @param {integer} strideS - stride for s
* @param {NonNegativeInteger} offsetS - index offset for s
* @param {Float64Array} scond - output (length-1 array): if INFO = 0, S contains the ratio of the smallest S(i) to the largest S(i)
* @param {Float64Array} amax - output (length-1 array): absolute value of largest matrix element
* @returns {integer} status code (0 = success)
*/
function dpoequ( N, A, strideA1, strideA2, offsetA, s, strideS, offsetS, scond, amax ) {
	let smin, si, i;

	// Quick return if possible
	if ( N === 0 ) {
		scond[ 0 ] = 1.0;
		amax[ 0 ] = 0.0;
		return 0;
	}

	// Extract the diagonal elements into S
	si = offsetS;
	s[ si ] = A[ offsetA ];
	smin = s[ si ];
	amax[ 0 ] = s[ si ];
	for ( i = 1; i < N; i++ ) {
		si = offsetS + ( i * strideS );
		s[ si ] = A[ offsetA + ( i * strideA1 ) + ( i * strideA2 ) ];
		if ( s[ si ] < smin ) {
			smin = s[ si ];
		}
		if ( s[ si ] > amax[ 0 ] ) {
			amax[ 0 ] = s[ si ];
		}
	}

	if ( smin <= 0.0 ) {
		// Find the first non-positive diagonal element and return
		for ( i = 0; i < N; i++ ) {
			if ( s[ offsetS + ( i * strideS ) ] <= 0.0 ) {
				scond[ 0 ] = 0.0;
				return i + 1;
			}
		}
	}

	// Compute scaling factors: S(i) = 1 / sqrt(A(i,i))
	for ( i = 0; i < N; i++ ) {
		si = offsetS + ( i * strideS );
		s[ si ] = 1.0 / Math.sqrt( s[ si ] );
	}

	// Compute SCOND = sqrt(min(diag)) / sqrt(max(diag))
	scond[ 0 ] = Math.sqrt( smin ) / Math.sqrt( amax[ 0 ] );
	return 0;
}


// EXPORTS //

export default dpoequ;
