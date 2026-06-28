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

/* eslint-disable max-len, max-params */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var SMLNUM = dlamch( 'safe-minimum' );
var BIGNUM = 1.0 / SMLNUM;


// FUNCTIONS //

/**
* CABS1: |re(z)| + |im(z)|.
*
* @private
* @param {Float64Array} v - Float64 view of complex array
* @param {integer} idx - index of real part
* @returns {number} CABS1 value
*/
function cabs1( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Computes row and column scalings intended to equilibrate a complex M-by-N.
* matrix A and reduce its condition number.
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
* @param {Complex128Array} A - input M-by-N complex matrix
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (complex elements)
* @param {Float64Array} r - output row scale factors, length M
* @param {integer} strideR - stride for r
* @param {NonNegativeInteger} offsetR - index offset for r
* @param {Float64Array} c - output column scale factors, length N
* @param {integer} strideC - stride for c
* @param {NonNegativeInteger} offsetC - index offset for c
* @returns {Object} result with info, rowcnd, colcnd, amax
*/
function zgeequ( M, N, A, strideA1, strideA2, offsetA, r, strideR, offsetR, c, strideC, offsetC ) {
	var rowcnd;
	var colcnd;
	var rcmax;
	var rcmin;
	var amax;
	var sa1;
	var sa2;
	var oA;
	var Av;
	var ri;
	var ci;
	var av;
	var i;
	var j;

	// Quick return if possible
	if ( M === 0 || N === 0 ) {
		return {
			'info': 0,
			'rowcnd': 1.0,
			'colcnd': 1.0,
			'amax': 0.0
		};
	}

	// Get Float64 view and compute double-based strides
	Av = reinterpret( A, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;

	// Compute row scale factors: find max CABS1 element in each row
	for ( i = 0; i < M; i++ ) {
		r[ offsetR + ( i * strideR ) ] = 0.0;
	}

	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			ri = offsetR + ( i * strideR );
			av = cabs1( Av, oA + ( i * sa1 ) + ( j * sa2 ) );
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
	amax = rcmax;

	if ( rcmin === 0.0 ) {
		// Find the first zero scale factor and return an error code
		for ( i = 0; i < M; i++ ) {
			if ( r[ offsetR + ( i * strideR ) ] === 0.0 ) {
				return {
					'info': i + 1,
					'rowcnd': 0.0,
					'colcnd': 0.0,
					'amax': amax
				};
			}
		}
	}

	// Invert the row scale factors
	for ( i = 0; i < M; i++ ) {
		ri = offsetR + ( i * strideR );
		r[ ri ] = 1.0 / Math.min( Math.max( r[ ri ], SMLNUM ), BIGNUM );
	}

	// Compute ROWCND = min(R) / max(R)
	rowcnd = Math.max( rcmin, SMLNUM ) / Math.min( rcmax, BIGNUM );

	// Compute column scale factors: find max element in each column

	// (assuming row scaling already applied)
	for ( j = 0; j < N; j++ ) {
		c[ offsetC + ( j * strideC ) ] = 0.0;
	}

	for ( j = 0; j < N; j++ ) {
		ci = offsetC + ( j * strideC );
		for ( i = 0; i < M; i++ ) {
			av = cabs1( Av, oA + ( i * sa1 ) + ( j * sa2 ) ) * r[ offsetR + ( i * strideR ) ];
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
				return {
					'info': M + j + 1,
					'rowcnd': rowcnd,
					'colcnd': 0.0,
					'amax': amax
				};
			}
		}
	}

	// Invert column scale factors
	for ( j = 0; j < N; j++ ) {
		ci = offsetC + ( j * strideC );
		c[ ci ] = 1.0 / Math.min( Math.max( c[ ci ], SMLNUM ), BIGNUM );
	}

	// Compute COLCND = min(C) / max(C)
	colcnd = Math.max( rcmin, SMLNUM ) / Math.min( rcmax, BIGNUM );

	return {
		'info': 0,
		'rowcnd': rowcnd,
		'colcnd': colcnd,
		'amax': amax
	};
}


// EXPORTS //

export default zgeequ;
