/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import dznrm2 from '../../../../blas/base/dznrm2/lib/base.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';
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
* Balances a general complex matrix A.
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
* @param {Complex128Array} A - input matrix (modified in-place)
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Float64Array} SCALE - output array of length N (permutation/scaling info)
* @param {integer} strideSCALE - stride for SCALE
* @param {NonNegativeInteger} offsetSCALE - starting index for SCALE
* @returns {Object} result with properties: info (0=success), ilo (1-based), ihi (1-based)
*/
function zgebal( job, N, A, strideA1, strideA2, offsetA, SCALE, strideSCALE, offsetSCALE ) {
	var canswap;
	var noconv;
	var ica;
	var ira;
	var sA1;
	var sA2;
	var ca;
	var ra;
	var Av;
	var oA;
	var oS;
	var sS;
	var re;
	var im;
	var c;
	var f;
	var g;
	var r;
	var s;
	var i;
	var j;
	var k;
	var l;
	var p;

	// Get Float64 view and compute double-based strides/offsets
	Av = reinterpret( A, 0 );
	sA1 = strideA1 * 2;
	sA2 = strideA2 * 2;
	oA = offsetA * 2;
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
					if ( i !== j ) {
						p = oA + ( i - 1 ) * sA1 + ( j - 1 ) * sA2;
						re = Av[ p ];
						im = Av[ p + 1 ];
						if ( re !== ZERO || im !== ZERO ) {
							canswap = false;
							break;
						}
					}
				}
				if ( canswap ) {
					SCALE[ oS + ( l - 1 ) * sS ] = i; // 1-based permutation index
					if ( i !== l ) {
						// Swap columns i and l (rows 1..L) — complex element strides
						zswap( l, A, strideA1, offsetA + ( i - 1 ) * strideA2, A, strideA1, offsetA + ( l - 1 ) * strideA2 );

						// Swap rows i and l (columns k..N)
						zswap( N - k + 1, A, strideA2, offsetA + ( i - 1 ) * strideA1 + ( k - 1 ) * strideA2, A, strideA2, offsetA + ( l - 1 ) * strideA1 + ( k - 1 ) * strideA2 );
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
					if ( i !== j ) {
						p = oA + ( i - 1 ) * sA1 + ( j - 1 ) * sA2;
						re = Av[ p ];
						im = Av[ p + 1 ];
						if ( re !== ZERO || im !== ZERO ) {
							canswap = false;
							break;
						}
					}
				}
				if ( canswap ) {
					SCALE[ oS + ( k - 1 ) * sS ] = j; // 1-based permutation index
					if ( j !== k ) {
						// Swap columns j and k (rows 1..L)
						zswap( l, A, strideA1, offsetA + ( j - 1 ) * strideA2, A, strideA1, offsetA + ( k - 1 ) * strideA2 );

						// Swap rows j and k (columns k..N)
						zswap( N - k + 1, A, strideA2, offsetA + ( j - 1 ) * strideA1 + ( k - 1 ) * strideA2, A, strideA2, offsetA + ( k - 1 ) * strideA1 + ( k - 1 ) * strideA2 );
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
			// Compute column norm (rows k..l of column i) — complex element strides
			c = dznrm2( l - k + 1, A, strideA1, offsetA + ( k - 1 ) * strideA1 + ( i - 1 ) * strideA2 );

			// Compute row norm (columns k..l of row i)
			r = dznrm2( l - k + 1, A, strideA2, offsetA + ( i - 1 ) * strideA1 + ( k - 1 ) * strideA2 );

			// Izamax returns 0-based index in JS; strides in complex elements
			ica = izamax( l, A, strideA1, offsetA + ( i - 1 ) * strideA2 );

			// ica is 0-based, compute complex abs of A(ica+1, i) from Float64 view
			p = oA + ica * sA1 + ( i - 1 ) * sA2;
			re = Av[ p ];
			im = Av[ p + 1 ];
			ca = Math.sqrt( re * re + im * im );

			ira = izamax( N - k + 1, A, strideA2, offsetA + ( i - 1 ) * strideA1 + ( k - 1 ) * strideA2 );

			// ira is 0-based offset from k, so actual column index (0-based) is ira + (k-1)
			p = oA + ( i - 1 ) * sA1 + ( ira + k - 1 ) * sA2;
			re = Av[ p ];
			im = Av[ p + 1 ];
			ra = Math.sqrt( re * re + im * im );

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

			// Scale row i (columns k..N) by g — complex element strides
			zdscal( N - k + 1, g, A, strideA2, offsetA + ( i - 1 ) * strideA1 + ( k - 1 ) * strideA2 );

			// Scale column i (rows 1..L) by f
			zdscal( l, f, A, strideA1, offsetA + ( i - 1 ) * strideA2 );
		}
	}

	return {
		'info': 0,
		'ilo': k,
		'ihi': l
	};
}


// EXPORTS //

export default zgebal;
