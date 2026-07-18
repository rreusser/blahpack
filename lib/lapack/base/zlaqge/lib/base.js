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
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

const THRESH = 0.1;
const SMALL = dlamch( 'safe-minimum' ) / dlamch( 'epsilon' );
const LARGE = 1.0 / SMALL;


// MAIN //

/**
* Equilibrates a complex general M-by-N matrix A using the row and column.
* scaling factors in the vectors R and C.
*
* Returns 'none' (no equilibration), 'row' (row only), 'column' (column only),
* or 'both' (both row and column).
*
* @private
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Complex128Array} A - input/output M-by-N complex matrix
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (complex elements)
* @param {Float64Array} r - row scale factors, length M
* @param {integer} strideR - stride for r
* @param {NonNegativeInteger} offsetR - index offset for r
* @param {Float64Array} c - column scale factors, length N
* @param {integer} strideC - stride for c
* @param {NonNegativeInteger} offsetC - index offset for c
* @param {number} rowcnd - ratio of smallest to largest R(i)
* @param {number} colcnd - ratio of smallest to largest C(i)
* @param {number} amax - absolute value of largest matrix entry
* @returns {string} equed - equilibration type: 'none', 'row', 'column', or 'both'
*/
function zlaqge( M, N, A, strideA1, strideA2, offsetA, r, strideR, offsetR, c, strideC, offsetC, rowcnd, colcnd, amax ) {
	let cj, ri, ia, i, j;

	// Quick return if possible
	if ( M <= 0 || N <= 0 ) {
		return 'none';
	}

	// Get Float64 view and compute double-based strides
	const Av = reinterpret( A, 0 );
	const sa1 = strideA1 * 2;
	const sa2 = strideA2 * 2;
	const oA = offsetA * 2;

	if ( rowcnd >= THRESH && amax >= SMALL && amax <= LARGE ) {
		// No row scaling
		if ( colcnd >= THRESH ) {
			// No column scaling
			return 'none';
		}
		// Column scaling only: A(i,j) = C(j) * A(i,j)
		for ( j = 0; j < N; j++ ) {
			cj = c[ offsetC + ( j * strideC ) ];
			for ( i = 0; i < M; i++ ) {
				ia = oA + ( i * sa1 ) + ( j * sa2 );
				Av[ ia ] = cj * Av[ ia ];         // real part
				Av[ ia + 1 ] = cj * Av[ ia + 1 ]; // imag part
			}
		}
		return 'column';
	} if ( colcnd >= THRESH ) {
		// Row scaling only: A(i,j) = R(i) * A(i,j)
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < M; i++ ) {
				ri = r[ offsetR + ( i * strideR ) ];
				ia = oA + ( i * sa1 ) + ( j * sa2 );
				Av[ ia ] = ri * Av[ ia ];         // real part
				Av[ ia + 1 ] = ri * Av[ ia + 1 ]; // imag part
			}
		}
		return 'row';
	}
	// Both row and column scaling: A(i,j) = C(j) * R(i) * A(i,j)
	for ( j = 0; j < N; j++ ) {
		cj = c[ offsetC + ( j * strideC ) ];
		for ( i = 0; i < M; i++ ) {
			ri = r[ offsetR + ( i * strideR ) ];
			ia = oA + ( i * sa1 ) + ( j * sa2 );
			Av[ ia ] = cj * ri * Av[ ia ];         // real part
			Av[ ia + 1 ] = cj * ri * Av[ ia + 1 ]; // imag part
		}
	}
	return 'both';
}


// EXPORTS //

export default zlaqge;
