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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, max-lines */

// MODULES //

import ddot from '../../../../blas/base/ddot/lib/base.js';
import daxpy from '../../../../blas/base/daxpy/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';
import idamax from '../../../../blas/base/idamax/lib/base.js';
import dlamch from '../../../../lapack/base/dlamch/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var HALF = 0.5;
var ONE = 1.0;
var THREE = 3.0;
var SCLFAC = 10.0;


// MAIN //

/**
* Balances a pair of general real matrices (A, B).
*
* This involves permuting A and B by similarity transformations to
* isolate eigenvalues, and applying diagonal similarity transformations
* to rows and columns ILO to IHI to equalize norms.
*
* ILO and IHI are output parameters. They are returned in the result
* object along with the info status.
*
* @private
* @param {string} job - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} A - first real matrix (modified in-place)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - second real matrix (modified in-place)
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} LSCALE - left scaling/permutation factors (length N)
* @param {integer} strideLSCALE - stride for LSCALE
* @param {NonNegativeInteger} offsetLSCALE - starting index for LSCALE
* @param {Float64Array} RSCALE - right scaling/permutation factors (length N)
* @param {integer} strideRSCALE - stride for RSCALE
* @param {NonNegativeInteger} offsetRSCALE - starting index for RSCALE
* @param {Float64Array} WORK - workspace array (length >= 6*N)
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @returns {Object} result with properties: info (0=success), ilo (1-based), ihi (1-based)
*/
function dggbal( job, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, WORK, strideWORK, offsetWORK ) {
	var lsfmax;
	var lsfmin;
	var pgamma;
	var sfmax;
	var sfmin;
	var kount;
	var gamma;
	var alpha;
	var coef2;
	var coef5;
	var found;
	var irab;
	var icab;
	var lcab;
	var lrab;
	var basl;
	var beta;
	var cmax;
	var coef;
	var nrp2;
	var cab;
	var cor;
	var rab;
	var sum;
	var lm1;
	var sA1;
	var sA2;
	var sB1;
	var sB2;
	var ewc;
	var ip1;
	var jp1;
	var nr;
	var oA;
	var oB;
	var sL;
	var sR;
	var oL;
	var oR;
	var sW;
	var oW;
	var ew;
	var it;
	var ir;
	var jc;
	var tc;
	var ta;
	var tb;
	var t;
	var k;
	var l;
	var m;
	var i;
	var j;

	sA1 = strideA1;
	sA2 = strideA2;
	sB1 = strideB1;
	sB2 = strideB2;
	oA = offsetA;
	oB = offsetB;
	sL = strideLSCALE;
	sR = strideRSCALE;
	oL = offsetLSCALE;
	oR = offsetRSCALE;
	sW = strideWORK;
	oW = offsetWORK;

	// Quick return if possible
	if ( N === 0 ) {
		return {
			'info': 0,
			'ilo': 1,
			'ihi': 0
		};
	}
	if ( N === 1 ) {
		LSCALE[ oL ] = ONE;
		RSCALE[ oR ] = ONE;
		return {
			'info': 0,
			'ilo': 1,
			'ihi': 1
		};
	}
	if ( job === 'none' ) {
		for ( i = 0; i < N; i += 1 ) {
			LSCALE[ oL + (i * sL) ] = ONE;
			RSCALE[ oR + (i * sR) ] = ONE;
		}
		return {
			'info': 0,
			'ilo': 1,
			'ihi': N
		};
	}

	// Initialize k and l (1-based, as in Fortran)
	k = 1;
	l = N;

	if ( job === 'scale' ) {
		// Skip permutation, go directly to scaling
		return doScaling( k, l );
	}

	// ====================================================================
	// PERMUTATION PHASE: isolate eigenvalues
	// ====================================================================

	l = findAndPermute( k, l );

	// Fall through to scaling
	return doScaling( k, l );

	/**
	* Find isolated eigenvalues and permute rows/columns.
	*
	* @private
	* @param {integer} kk - initial lower permutation index (1-based)
	* @param {integer} ll - initial upper permutation index (1-based)
	* @returns {integer} final value of l
	*/
	function findAndPermute( kk, ll ) {
		var allZeroCol;
		var foundRow;
		var foundCol;
		var allZero;
		var ii;
		var jj;
		k = kk;
		l = ll;

		// Outer loop: alternate between row search and column search

		// eslint-disable-next-line no-constant-condition
		while ( true ) {
			// === Row search ===
			// Find row with one nonzero in columns 1 through l
			lm1 = l - 1;

			foundRow = false;
			for ( i = l - 1; i >= 0; i -= 1 ) {
				// Search columns 0..lm1-1 for first nonzero
				jp1 = -1;
				found = false;
				for ( j = 0; j < lm1; j += 1 ) {
					if ( A[ oA + (i * sA1) + (j * sA2) ] !== ZERO || B[ oB + (i * sB1) + (j * sB2) ] !== ZERO ) {
						jp1 = j + 1;
						found = true;
						break;
					}
				}
				if ( found ) {
					// Found first nonzero at column jp1-1, check if rest are zero
					allZero = true;
					for ( jj = jp1; jj < l; jj += 1 ) {
						if ( A[ oA + (i * sA1) + (jj * sA2) ] !== ZERO || B[ oB + (i * sB1) + (jj * sB2) ] !== ZERO ) {
							allZero = false;
							break;
						}
					}
					if ( !allZero ) {
						continue; // This row has multiple nonzeros, try next row
					}
					j = jp1 - 1;
				} else {
					// All columns 0..lm1-1 are zero -> j = l-1 (0-based)
					j = l - 1;
				}

				// Found isolated row i with single nonzero in column j (0-based)
				m = l - 1; // m = l in 1-based -> l-1 in 0-based

				// Perform permutation
				doPermute( i, j, m );

				l -= 1;
				if ( l === 1 ) {
					RSCALE[ oR ] = ONE;
					LSCALE[ oL ] = ONE;
					return l;
				}
				foundRow = true;
				break; // Restart row search with new l
			}

			if ( foundRow ) {
				continue; // Restart while loop (row search again with updated l)
			}

			// No isolated row found -> column search
			// eslint-disable-next-line no-constant-condition
			while ( true ) {
				foundCol = false;
				lm1 = l - 1;
				for ( j = k - 1; j < l; j += 1 ) {
					ip1 = -1;
					found = false;
					for ( i = k - 1; i < lm1; i += 1 ) {
						if ( A[ oA + (i * sA1) + (j * sA2) ] !== ZERO || B[ oB + (i * sB1) + (j * sB2) ] !== ZERO ) {
							ip1 = i + 1;
							found = true;
							break;
						}
					}
					if ( found ) {
						// Found first nonzero at row ip1-1, check if rest are zero
						allZeroCol = true;
						for ( ii = ip1; ii < l; ii += 1 ) {
							if ( A[ oA + (ii * sA1) + (j * sA2) ] !== ZERO || B[ oB + (ii * sB1) + (j * sB2) ] !== ZERO ) {
								allZeroCol = false;
								break;
							}
						}
						if ( !allZeroCol ) {
							continue; // This column has multiple nonzeros
						}
						i = ip1 - 1;
					} else {
						// All rows k..lm1-1 are zero -> i = l-1 (0-based)
						i = l - 1;
					}

					// Found isolated column j with single nonzero in row i
					m = k - 1; // m = k in 1-based -> k-1 in 0-based

					doPermute( i, j, m );

					k += 1;
					foundCol = true;
					break; // Restart column search with new k
				}

				if ( !foundCol ) {
					return l;
				}
				// Found a column, incremented k, restart column search
			}
		}
	}

	/**
	* Perform row/column permutation.
	*
	* @private
	* @param {integer} ri - 0-based source row index
	* @param {integer} cj - 0-based source column index
	* @param {integer} pm - 0-based destination index
	*/
	function doPermute( ri, cj, pm ) {
		// LSCALE(M) = I (1-based)
		LSCALE[ oL + (pm * sL) ] = ri + 1;

		// Permute rows pm and ri
		if ( ri !== pm ) {
			dswap( N - k + 1, A, sA2, oA + (ri * sA1) + (( k - 1 ) * sA2), A, sA2, oA + (pm * sA1) + (( k - 1 ) * sA2) );
			dswap( N - k + 1, B, sB2, oB + (ri * sB1) + (( k - 1 ) * sB2), B, sB2, oB + (pm * sB1) + (( k - 1 ) * sB2) );
		}

		// RSCALE(M) = J (1-based)
		RSCALE[ oR + (pm * sR) ] = cj + 1;

		// Permute columns pm and cj
		if ( cj !== pm ) {
			dswap( l, A, sA1, oA + (cj * sA2), A, sA1, oA + (pm * sA2) );
			dswap( l, B, sB1, oB + (cj * sB2), B, sB1, oB + (pm * sB2) );
		}
	}

	/**
	* Perform diagonal scaling phase.
	*
	* @private
	* @param {integer} kk - 1-based lower index
	* @param {integer} ll - 1-based upper index
	* @returns {Object} result with properties: info, ilo, ihi
	*/
	function doScaling( kk, ll ) {
		var ilo;
		var ihi;

		ilo = kk;
		ihi = ll;

		if ( job === 'permute' ) {
			for ( i = ilo - 1; i < ihi; i += 1 ) {
				LSCALE[ oL + (i * sL) ] = ONE;
				RSCALE[ oR + (i * sR) ] = ONE;
			}
			return {
				'info': 0,
				'ilo': ilo,
				'ihi': ihi
			};
		}

		if ( ilo === ihi ) {
			LSCALE[ oL + (( ilo - 1 ) * sL) ] = ONE;
			RSCALE[ oR + (( ilo - 1 ) * sR) ] = ONE;
			return {
				'info': 0,
				'ilo': ilo,
				'ihi': ihi
			};
		}

		// Balance the submatrix in rows ILO to IHI
		nr = ihi - ilo + 1;

		// Initialize arrays
		for ( i = ilo - 1; i < ihi; i += 1 ) {
			RSCALE[ oR + (i * sR) ] = ZERO;
			LSCALE[ oL + (i * sL) ] = ZERO;
			WORK[ oW + (i * sW) ] = ZERO;
			WORK[ oW + (( i + N ) * sW) ] = ZERO;
			WORK[ oW + (( i + (2 * N) ) * sW) ] = ZERO;
			WORK[ oW + (( i + (3 * N) ) * sW) ] = ZERO;
			WORK[ oW + (( i + (4 * N) ) * sW) ] = ZERO;
			WORK[ oW + (( i + (5 * N) ) * sW) ] = ZERO;
		}

		// Compute right side vector in resulting linear equations
		basl = Math.log10( SCLFAC );
		for ( i = ilo - 1; i < ihi; i += 1 ) {
			for ( j = ilo - 1; j < ihi; j += 1 ) {
				tb = B[ oB + (i * sB1) + (j * sB2) ];
				ta = A[ oA + (i * sA1) + (j * sA2) ];
				if ( ta === ZERO ) {
					ta = ZERO;
				} else {
					ta = Math.log10( Math.abs( ta ) ) / basl;
				}
				if ( tb === ZERO ) {
					tb = ZERO;
				} else {
					tb = Math.log10( Math.abs( tb ) ) / basl;
				}
				WORK[ oW + (( i + (4 * N) ) * sW) ] -= ta + tb;
				WORK[ oW + (( j + (5 * N) ) * sW) ] -= ta + tb;
			}
		}

		coef = ONE / ( 2 * nr );
		coef2 = coef * coef;
		coef5 = HALF * coef2;
		nrp2 = nr + 2;
		beta = ZERO;
		it = 1;

		// Generalized conjugate gradient iteration

		// eslint-disable-next-line no-constant-condition
		while ( true ) {
			// Compute gamma
			gamma = ddot( nr, WORK, sW, oW + (( ilo - 1 + (4 * N) ) * sW), WORK, sW, oW + (( ilo - 1 + (4 * N) ) * sW) ) +
				ddot( nr, WORK, sW, oW + (( ilo - 1 + (5 * N) ) * sW), WORK, sW, oW + (( ilo - 1 + (5 * N) ) * sW) );

			ew = ZERO;
			ewc = ZERO;
			for ( i = ilo - 1; i < ihi; i += 1 ) {
				ew += WORK[ oW + (( i + (4 * N) ) * sW) ];
				ewc += WORK[ oW + (( i + (5 * N) ) * sW) ];
			}

			gamma = (coef * gamma) - (coef2 * ( (ew * ew) + (ewc * ewc) )) - (coef5 * ( ew - ewc ) * ( ew - ewc ));

			if ( gamma === ZERO ) {
				break;
			}
			if ( it !== 1 ) {
				beta = gamma / pgamma;
			}
			t = coef5 * ( ewc - (THREE * ew) );
			tc = coef5 * ( ew - (THREE * ewc) );

			dscal( nr, beta, WORK, sW, oW + (( ilo - 1 ) * sW) );
			dscal( nr, beta, WORK, sW, oW + (( ilo - 1 + N ) * sW) );

			daxpy( nr, coef, WORK, sW, oW + (( ilo - 1 + (4 * N) ) * sW), WORK, sW, oW + (( ilo - 1 + N ) * sW) );
			daxpy( nr, coef, WORK, sW, oW + (( ilo - 1 + (5 * N) ) * sW), WORK, sW, oW + (( ilo - 1 ) * sW) );

			for ( i = ilo - 1; i < ihi; i += 1 ) {
				WORK[ oW + (i * sW) ] += tc;
				WORK[ oW + (( i + N ) * sW) ] += t;
			}

			// Apply matrix to vector
			for ( i = ilo - 1; i < ihi; i += 1 ) {
				kount = 0;
				sum = ZERO;
				for ( j = ilo - 1; j < ihi; j += 1 ) {
					if ( A[ oA + (i * sA1) + (j * sA2) ] !== ZERO ) {
						kount += 1;
						sum += WORK[ oW + (j * sW) ];
					}
					if ( B[ oB + (i * sB1) + (j * sB2) ] !== ZERO ) {
						kount += 1;
						sum += WORK[ oW + (j * sW) ];
					}
				}
				WORK[ oW + (( i + (2 * N) ) * sW) ] = (kount * WORK[ oW + (( i + N ) * sW) ]) + sum;
			}

			for ( j = ilo - 1; j < ihi; j += 1 ) {
				kount = 0;
				sum = ZERO;
				for ( i = ilo - 1; i < ihi; i += 1 ) {
					if ( A[ oA + (i * sA1) + (j * sA2) ] !== ZERO ) {
						kount += 1;
						sum += WORK[ oW + (( i + N ) * sW) ];
					}
					if ( B[ oB + (i * sB1) + (j * sB2) ] !== ZERO ) {
						kount += 1;
						sum += WORK[ oW + (( i + N ) * sW) ];
					}
				}
				WORK[ oW + (( j + (3 * N) ) * sW) ] = (kount * WORK[ oW + (j * sW) ]) + sum;
			}

			sum = ddot( nr, WORK, sW, oW + (( ilo - 1 + N ) * sW), WORK, sW, oW + (( ilo - 1 + (2 * N) ) * sW) ) +
				ddot( nr, WORK, sW, oW + (( ilo - 1 ) * sW), WORK, sW, oW + (( ilo - 1 + (3 * N) ) * sW) );
			alpha = gamma / sum;

			// Determine correction to current iteration
			cmax = ZERO;
			for ( i = ilo - 1; i < ihi; i += 1 ) {
				cor = alpha * WORK[ oW + (( i + N ) * sW) ];
				if ( Math.abs( cor ) > cmax ) {
					cmax = Math.abs( cor );
				}
				LSCALE[ oL + (i * sL) ] += cor;
				cor = alpha * WORK[ oW + (i * sW) ];
				if ( Math.abs( cor ) > cmax ) {
					cmax = Math.abs( cor );
				}
				RSCALE[ oR + (i * sR) ] += cor;
			}
			if ( cmax < HALF ) {
				break;
			}

			daxpy( nr, -alpha, WORK, sW, oW + (( ilo - 1 + (2 * N) ) * sW), WORK, sW, oW + (( ilo - 1 + (4 * N) ) * sW) );
			daxpy( nr, -alpha, WORK, sW, oW + (( ilo - 1 + (3 * N) ) * sW), WORK, sW, oW + (( ilo - 1 + (5 * N) ) * sW) );

			pgamma = gamma;
			it += 1;
			if ( it > nrp2 ) {
				break; // Exceeded iteration limit
			}
		}

		// Post-iteration scaling
		sfmin = dlamch( 'scale' );
		sfmax = ONE / sfmin;
		lsfmin = Math.trunc( (Math.log10( sfmin ) / basl) + ONE );
		lsfmax = Math.trunc( Math.log10( sfmax ) / basl );

		for ( i = ilo - 1; i < ihi; i += 1 ) {
			// Row scaling: find max element in row i, columns ilo-1..N-1
			irab = idamax( N - ilo + 1, A, sA2, oA + (i * sA1) + (( ilo - 1 ) * sA2) );
			rab = Math.abs( A[ oA + (i * sA1) + (( irab + ilo - 1 ) * sA2) ] );
			irab = idamax( N - ilo + 1, B, sB2, oB + (i * sB1) + (( ilo - 1 ) * sB2) );
			rab = Math.max( rab, Math.abs( B[ oB + (i * sB1) + (( irab + ilo - 1 ) * sB2) ] ) );
			lrab = Math.trunc( (Math.log10( rab + sfmin ) / basl) + ONE );
			ir = Math.trunc( LSCALE[ oL + (i * sL) ] + ( ( Math.sign( LSCALE[ oL + (i * sL) ] ) || 1.0 ) * HALF ) );
			ir = Math.min( Math.max( ir, lsfmin ), lsfmax, lsfmax - lrab );
			LSCALE[ oL + (i * sL) ] = Math.pow( SCLFAC, ir );

			// Column scaling: find max element in column i, rows 0..ihi-1
			icab = idamax( ihi, A, sA1, oA + (i * sA2) );
			cab = Math.abs( A[ oA + (icab * sA1) + (i * sA2) ] );
			icab = idamax( ihi, B, sB1, oB + (i * sB2) );
			cab = Math.max( cab, Math.abs( B[ oB + (icab * sB1) + (i * sB2) ] ) );
			lcab = Math.trunc( (Math.log10( cab + sfmin ) / basl) + ONE );
			jc = Math.trunc( RSCALE[ oR + (i * sR) ] + ( ( Math.sign( RSCALE[ oR + (i * sR) ] ) || 1.0 ) * HALF ) );
			jc = Math.min( Math.max( jc, lsfmin ), lsfmax, lsfmax - lcab );
			RSCALE[ oR + (i * sR) ] = Math.pow( SCLFAC, jc );
		}

		// Row scaling of matrices A and B
		for ( i = ilo - 1; i < ihi; i += 1 ) {
			dscal( N - ilo + 1, LSCALE[ oL + (i * sL) ], A, sA2, oA + (i * sA1) + (( ilo - 1 ) * sA2) );
			dscal( N - ilo + 1, LSCALE[ oL + (i * sL) ], B, sB2, oB + (i * sB1) + (( ilo - 1 ) * sB2) );
		}

		// Column scaling of matrices A and B
		for ( j = ilo - 1; j < ihi; j += 1 ) {
			dscal( ihi, RSCALE[ oR + (j * sR) ], A, sA1, oA + (j * sA2) );
			dscal( ihi, RSCALE[ oR + (j * sR) ], B, sB1, oB + (j * sB2) );
		}

		return {
			'info': 0,
			'ilo': ilo,
			'ihi': ihi
		};
	}
}


// EXPORTS //

export default dggbal;
