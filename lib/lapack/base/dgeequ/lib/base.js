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

import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

const SMLNUM = dlamch( 'safe-minimum' );
const BIGNUM = 1.0 / SMLNUM;


// MAIN //

/**
* Computes row and column scalings intended to equilibrate an M-by-N matrix A.
* and reduce its condition number.
*
* R returns the row scale factors and C the column scale factors, chosen to
* try to make the largest element in each row and column of the matrix B with
* elements B(i,j)=R(i)_A(i,j)_C(j) have absolute value 1.
*
* Returns an object with:
* - info: 0 if successful; i if the i-th row is zero (1-based); M+j if the
*   (j)-th column (after row scaling) is zero (1-based).
* - rowcnd: ratio of smallest to largest row scale factor
* - colcnd: ratio of smallest to largest column scale factor
* - amax: absolute value of largest matrix element
*
* @private
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Float64Array} A - input M-by-N matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} r - output row scale factors, length M
* @param {integer} strideR - stride for r
* @param {NonNegativeInteger} offsetR - index offset for r
* @param {Float64Array} c - output column scale factors, length N
* @param {integer} strideC - stride for c
* @param {NonNegativeInteger} offsetC - index offset for c
* @returns {Object} result with info, rowcnd, colcnd, amax
*/
function dgeequ( M, N, A, strideA1, strideA2, offsetA, r, strideR, offsetR, c, strideC, offsetC ) {
	let rcmax, rcmin, da, ri, ci, av, i, j;

	// Quick return if possible
	if ( M === 0 || N === 0 ) {
		return { 'info': 0, 'rowcnd': 1.0, 'colcnd': 1.0, 'amax': 0.0 };
	}

	// Compute row scale factors: find max abs element in each row
	for ( i = 0; i < M; i++ ) {
		r[ offsetR + ( i * strideR ) ] = 0.0;
	}

	for ( j = 0; j < N; j++ ) {
		da = offsetA + ( j * strideA2 );
		for ( i = 0; i < M; i++ ) {
			ri = offsetR + ( i * strideR );
			av = Math.abs( A[ da + ( i * strideA1 ) ] );
			if ( av > r[ ri ] ) {
				r[ ri ] = av;
			}
		}
	}

	// Find max and min row scale factors
	rcmin = BIGNUM;
	rcmax = 0.0;
	for ( i = 0; i < M; i++ ) {
		ri = r[ offsetR + ( i * strideR ) ];
		if ( ri > rcmax ) {
			rcmax = ri;
		}
		if ( ri < rcmin ) {
			rcmin = ri;
		}
	}
	const amax = rcmax; // eslint-disable-line no-var

	if ( rcmin === 0.0 ) {
		// Find the first zero scale factor and return an error code
		for ( i = 0; i < M; i++ ) {
			if ( r[ offsetR + ( i * strideR ) ] === 0.0 ) {
				return { 'info': i + 1, 'rowcnd': 0.0, 'colcnd': 0.0, 'amax': amax };
			}
		}
	}

	// Invert the row scale factors
	for ( i = 0; i < M; i++ ) {
		ri = offsetR + ( i * strideR );
		r[ ri ] = 1.0 / Math.min( Math.max( r[ ri ], SMLNUM ), BIGNUM );
	}

	// Compute ROWCND = min(R) / max(R)
	const rowcnd = Math.max( rcmin, SMLNUM ) / Math.min( rcmax, BIGNUM ); // eslint-disable-line no-var

	// Compute column scale factors: find max element in each column

	// (assuming row scaling already applied)
	for ( j = 0; j < N; j++ ) {
		c[ offsetC + ( j * strideC ) ] = 0.0;
	}

	for ( j = 0; j < N; j++ ) {
		ci = offsetC + ( j * strideC );
		da = offsetA + ( j * strideA2 );
		for ( i = 0; i < M; i++ ) {
			av = Math.abs( A[ da + ( i * strideA1 ) ] ) * r[ offsetR + ( i * strideR ) ];
			if ( av > c[ ci ] ) {
				c[ ci ] = av;
			}
		}
	}

	// Find max and min column scale factors
	rcmin = BIGNUM;
	rcmax = 0.0;
	for ( j = 0; j < N; j++ ) {
		ci = c[ offsetC + ( j * strideC ) ];
		if ( ci < rcmin ) {
			rcmin = ci;
		}
		if ( ci > rcmax ) {
			rcmax = ci;
		}
	}

	if ( rcmin === 0.0 ) {
		// Find the first zero column scale factor and return error
		for ( j = 0; j < N; j++ ) {
			if ( c[ offsetC + ( j * strideC ) ] === 0.0 ) {
				return { 'info': M + j + 1, 'rowcnd': rowcnd, 'colcnd': 0.0, 'amax': amax };
			}
		}
	}

	// Invert column scale factors
	for ( j = 0; j < N; j++ ) {
		ci = offsetC + ( j * strideC );
		c[ ci ] = 1.0 / Math.min( Math.max( c[ ci ], SMLNUM ), BIGNUM );
	}

	// Compute COLCND = min(C) / max(C)
	const colcnd = Math.max( rcmin, SMLNUM ) / Math.min( rcmax, BIGNUM ); // eslint-disable-line no-var

	return { 'info': 0, 'rowcnd': rowcnd, 'colcnd': colcnd, 'amax': amax };
}


// EXPORTS //

export default dgeequ;
