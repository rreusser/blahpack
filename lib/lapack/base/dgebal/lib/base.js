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

/* eslint-disable max-len, max-params, no-var */

// MODULES //

import dswap from '../../../../blas/base/dswap/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dnrm2 from '../../../../blas/base/dnrm2/lib/base.js';
import idamax from '../../../../blas/base/idamax/lib/base.js';
import dlamch from '../../../../lapack/base/dlamch/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var SCLFAC = 2.0;
var FACTOR = 0.95;

// Precompute safe minimum / precision thresholds (hoisted to module scope per performance guidance)
var SFMIN1 = dlamch( 'safe-minimum' ) / dlamch( 'precision' );
var SFMAX1 = ONE / SFMIN1;
var SFMIN2 = SFMIN1 * SCLFAC;
var SFMAX2 = ONE / SFMIN2;


// MAIN //

/**
* Balances a general real matrix A.
*
* This involves, first, permuting A by a similarity transformation to
* isolate eigenvalues in the first 1 to ILO-1 and last IHI+1 to N
* elements on the diagonal; and second, applying a diagonal similarity
* transformation to rows and columns ILO to IHI to make the rows and
* columns as close in norm as possible.
*
* @private
* @param {string} job - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - input matrix (modified in-place)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} SCALE - output array of length N (permutation/scaling info)
* @param {integer} strideSCALE - stride for SCALE
* @param {NonNegativeInteger} offsetSCALE - starting index for SCALE
* @returns {Object} result with properties: info (0=success), ilo (1-based), ihi (1-based)
*/
function dgebal( job, N, A, strideA1, strideA2, offsetA, SCALE, strideSCALE, offsetSCALE ) {
	var canswap;
	var noconv;
	var ica;
	var ira;
	var sA1;
	var sA2;
	var ca;
	var ra;
	var oA;
	var oS;
	var sS;
	var c;
	var f;
	var g;
	var r;
	var s;
	var i;
	var j;
	var k;
	var l;

	oA = offsetA;
	sA1 = strideA1;
	sA2 = strideA2;
	oS = offsetSCALE;
	sS = strideSCALE;

	// Quick return: N=0
	if ( N === 0 ) {
		return {
			'info': 0,
			'ilo': 1,
			'ihi': 0
		};
	}

	// JOB='N': no balancing
	if ( job === 'none' ) {
		for ( i = 0; i < N; i++ ) {
			SCALE[ oS + ( i * sS ) ] = ONE;
		}
		return {
			'info': 0,
			'ilo': 1,
			'ihi': N
		};
	}

	// Permutation to isolate eigenvalues if possible.
	// k and l are 1-based indices matching Fortran convention.
	k = 1;
	l = N;

	if ( job !== 'scale' ) {
		// ============================================================
		// Search for rows isolating an eigenvalue and push them down.
		// (Row search: find row i where A(i,j)=0 for all j!=i, j=1..L)
		// ============================================================
		noconv = true;
		while ( noconv ) {
			noconv = false;
			for ( i = l; i >= 1; i-- ) {
				canswap = true;
				for ( j = 1; j <= l; j++ ) {
					if ( i !== j && A[ oA + ( i - 1 ) * sA1 + ( j - 1 ) * sA2 ] !== ZERO ) {
						canswap = false;
						break;
					}
				}
				if ( canswap ) {
					SCALE[ oS + ( l - 1 ) * sS ] = i; // 1-based permutation index
					if ( i !== l ) {
						// Swap columns i and l (rows 1..L)
						dswap( l, A, sA1, oA + ( i - 1 ) * sA2, A, sA1, oA + ( l - 1 ) * sA2 );

						// Swap rows i and l (columns k..N)
						dswap( N - k + 1, A, sA2, oA + ( i - 1 ) * sA1 + ( k - 1 ) * sA2, A, sA2, oA + ( l - 1 ) * sA1 + ( k - 1 ) * sA2 );
					}
					noconv = true;

					if ( l === 1 ) {
						return {
							'info': 0,
							'ilo': 1,
							'ihi': 1
						};
					}
					l -= 1;
				}
			}
		}

		// ============================================================
		// Search for columns isolating an eigenvalue and push them left.
		// ============================================================
		noconv = true;
		while ( noconv ) {
			noconv = false;
			for ( j = k; j <= l; j++ ) {
				canswap = true;
				for ( i = k; i <= l; i++ ) {
					if ( i !== j && A[ oA + ( i - 1 ) * sA1 + ( j - 1 ) * sA2 ] !== ZERO ) {
						canswap = false;
						break;
					}
				}
				if ( canswap ) {
					SCALE[ oS + ( k - 1 ) * sS ] = j; // 1-based permutation index
					if ( j !== k ) {
						// Swap columns j and k (rows 1..L)
						dswap( l, A, sA1, oA + ( j - 1 ) * sA2, A, sA1, oA + ( k - 1 ) * sA2 );

						// Swap rows j and k (columns k..N)
						dswap( N - k + 1, A, sA2, oA + ( j - 1 ) * sA1 + ( k - 1 ) * sA2, A, sA2, oA + ( k - 1 ) * sA1 + ( k - 1 ) * sA2 );
					}
					noconv = true;
					k += 1;
				}
			}
		}
	}

	// Initialize SCALE for non-permuted submatrix
	for ( i = k; i <= l; i++ ) {
		SCALE[ oS + ( i - 1 ) * sS ] = ONE;
	}

	// If we only had to permute, we are done
	if ( job === 'permute' ) {
		return {
			'info': 0,
			'ilo': k,
			'ihi': l
		};
	}

	// ============================================================
	// Balance the submatrix in rows k to l.
	// Iterative loop for norm reduction.
	// ============================================================
	noconv = true;
	while ( noconv ) {
		noconv = false;

		for ( i = k; i <= l; i++ ) {
			// Compute column norm (rows k..l of column i)
			c = dnrm2( l - k + 1, A, sA1, oA + ( k - 1 ) * sA1 + ( i - 1 ) * sA2 );

			// Compute row norm (columns k..l of row i)
			r = dnrm2( l - k + 1, A, sA2, oA + ( i - 1 ) * sA1 + ( k - 1 ) * sA2 );

			// Idamax returns 0-based index in JS
			ica = idamax( l, A, sA1, oA + ( i - 1 ) * sA2 );
			ca = Math.abs( A[ oA + ica * sA1 + ( i - 1 ) * sA2 ] );

			ira = idamax( N - k + 1, A, sA2, oA + ( i - 1 ) * sA1 + ( k - 1 ) * sA2 );

			// ira is 0-based offset from k, so actual column index (0-based) is ira + (k-1)
			ra = Math.abs( A[ oA + ( i - 1 ) * sA1 + ( ira + k - 1 ) * sA2 ] );

			// Guard against zero C or R due to underflow
			if ( c === ZERO || r === ZERO ) {
				continue;
			}

			// Exit if NaN to avoid infinite loop
			if ( ( c + ca + r + ra ) !== ( c + ca + r + ra ) ) {
				return {
					'info': -3,
					'ilo': k,
					'ihi': l
				};
			}

			g = r / SCLFAC;
			f = ONE;
			s = c + r;

			while ( c < g && Math.max( f, c, ca ) < SFMAX2 && Math.min( r, g, ra ) > SFMIN2 ) {
				f *= SCLFAC;
				c *= SCLFAC;
				ca *= SCLFAC;
				r /= SCLFAC;
				g /= SCLFAC;
				ra /= SCLFAC;
			}

			g = c / SCLFAC;

			while ( g >= r && Math.max( r, ra ) < SFMAX2 && Math.min( f, c, g, ca ) > SFMIN2 ) {
				f /= SCLFAC;
				c /= SCLFAC;
				g /= SCLFAC;
				ca /= SCLFAC;
				r *= SCLFAC;
				ra *= SCLFAC;
			}

			// Now balance
			if ( ( c + r ) >= FACTOR * s ) {
				continue;
			}
			if ( f < ONE && SCALE[ oS + ( i - 1 ) * sS ] < ONE ) {
				if ( f * SCALE[ oS + ( i - 1 ) * sS ] <= SFMIN1 ) {
					continue;
				}
			}
			if ( f > ONE && SCALE[ oS + ( i - 1 ) * sS ] > ONE ) {
				if ( SCALE[ oS + ( i - 1 ) * sS ] >= SFMAX1 / f ) {
					continue;
				}
			}

			g = ONE / f;
			SCALE[ oS + ( i - 1 ) * sS ] *= f;
			noconv = true;

			// Scale row i (columns k..N) by g
			dscal( N - k + 1, g, A, sA2, oA + ( i - 1 ) * sA1 + ( k - 1 ) * sA2 );

			// Scale column i (rows 1..L) by f
			dscal( l, f, A, sA1, oA + ( i - 1 ) * sA2 );
		}
	}

	return {
		'info': 0,
		'ilo': k,
		'ihi': l
	};
}


// EXPORTS //

export default dgebal;
