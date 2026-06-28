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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ddot from '../../../../blas/base/ddot/lib/base.js';
import daxpy from '../../../../blas/base/daxpy/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
import dlamch from '../../../../lapack/base/dlamch/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var HALF = 0.5;
var ONE = 1.0;
var THREE = 3.0;
var SCLFAC = 10.0;


// FUNCTIONS //

/**
* CABS1: sum of absolute values of real and imaginary parts.
*
* @private
* @param {Float64Array} arr - interleaved complex array
* @param {integer} idx - index of real part
* @returns {number} |re| + |im|
*/
function cabs1( arr, idx ) {
	return Math.abs( arr[ idx ] ) + Math.abs( arr[ idx + 1 ] );
}

/**
* Check if a complex element is zero.
*
* @private
* @param {Float64Array} arr - interleaved complex array
* @param {integer} idx - index of real part
* @returns {boolean} true if both re and im are zero
*/
function czero( arr, idx ) {
	return arr[ idx ] === 0.0 && arr[ idx + 1 ] === 0.0;
}

/**
* Complex modulus: sqrt(re^2 + im^2).
*
* @private
* @param {Float64Array} arr - interleaved complex array
* @param {integer} idx - index of real part
* @returns {number} |z|
*/
function cabs( arr, idx ) {
	var re = arr[ idx ];
	var im = arr[ idx + 1 ];
	return Math.sqrt( (re * re) + (im * im) );
}


// MAIN //

/**
* Balances a pair of general complex matrices (A, B).
*
* This involves permuting A and B by similarity transformations to
* isolate eigenvalues, and applying diagonal similarity transformations
* to rows and columns ILO to IHI to equalize norms.
*
* A and B are Complex128Arrays. Strides and offsets are in complex elements.
*
* ILO and IHI are output parameters. They are returned in the result
* object along with the info status.
*
* @private
* @param {string} job - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} A - first complex matrix (modified in-place)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} B - second complex matrix (modified in-place)
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {Float64Array} LSCALE - left scaling/permutation factors (length N)
* @param {integer} strideLSCALE - stride for LSCALE
* @param {NonNegativeInteger} offsetLSCALE - starting index for LSCALE
* @param {Float64Array} RSCALE - right scaling/permutation factors (length N)
* @param {integer} strideRSCALE - stride for RSCALE
* @param {NonNegativeInteger} offsetRSCALE - starting index for RSCALE
* @param {Float64Array} WORK - workspace array (length >= 6*N)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {Object} result with properties: info (0=success), ilo (1-based), ihi (1-based)
*/
function zggbal( job, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, WORK, strideWork, offsetWork ) {
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
	var idx;
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
	var Av;
	var Bv;
	var t;
	var k;
	var l;
	var m;
	var i;
	var j;

	// Get Float64Array views for direct element access
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );

	// Convert strides/offsets to Float64 units for element access
	sA1 = strideA1 * 2;
	sA2 = strideA2 * 2;
	sB1 = strideB1 * 2;
	sB2 = strideB2 * 2;
	oA = offsetA * 2;
	oB = offsetB * 2;
	sL = strideLSCALE;
	sR = strideRSCALE;
	oL = offsetLSCALE;
	oR = offsetRSCALE;
	sW = strideWork;
	oW = offsetWork;

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
		for ( i = 0; i < N; i++ ) {
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
		// Skip permutation, go directly to scaling (label 190)
		return doScaling( k, l );
	}

	// ====================================================================
	// PERMUTATION PHASE: isolate eigenvalues
	// ====================================================================

	// The permutation phase alternates between:
	//   - Finding rows with single nonzero (labels 20-80, iflow=1)
	//   - Finding columns with single nonzero (labels 90-150, iflow=2)
	// After each find, perform the swap (labels 160-180)
	// And continue based on iflow.

	// Start: look for row with single nonzero (label 30)
	l = findAndPermute( k, l );

	// Fall through to scaling (label 190)
	return doScaling( k, l );

	// ----------------------------------------------------------------

	// findAndPermute: the main permutation loop

	// This replaces the GOTO-based control flow of labels 20-180.

	// Returns the final value of l after all permutations.

	// Also updates k as a side effect via closure.

	/**
	* Find isolated eigenvalues and permute rows/columns.
	*
	* @private
	* @param {integer} kk - initial lower permutation index
	* @param {integer} ll - initial upper permutation index
	* @returns {void}
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
			// === Row search (labels 30-80) ===
			// Find row with one nonzero in columns 1 through l
			lm1 = l - 1;

			foundRow = false;
			for ( i = l - 1; i >= 0; i-- ) {
				// Search columns 0..lm1-1 for first nonzero
				jp1 = -1;
				found = false;
				for ( j = 0; j < lm1; j++ ) {
					idx = oA + (i * sA1) + (j * sA2);
					if ( !czero( Av, idx ) || !czero( Bv, oB + (i * sB1) + (j * sB2) ) ) {
						jp1 = j + 1;
						found = true;
						break;
					}
				}
				if ( found ) {
					// Found first nonzero at column jp1-1, check if rest are zero
					allZero = true;
					for ( jj = jp1; jj < l; jj++ ) {
						idx = oA + (i * sA1) + (jj * sA2);
						if ( !czero( Av, idx ) || !czero( Bv, oB + (i * sB1) + (jj * sB2) ) ) {
							allZero = false;
							break;
						}
					}
					if ( !allZero ) {
						continue; // This row has multiple nonzeros, try next row
					}
					j = jp1 - 1;
				} else {
					// All columns 0..lm1-1 are zero → j = l-1 (0-based), single nonzero is in column l
					j = l - 1;
				}

				// Found isolated row i with single nonzero in column j
				// (0-based i, j)
				m = l - 1; // m = l in 1-based → l-1 in 0-based

				// Perform permutation (label 160-180)
				doPermute( i, j, m );

				// After permute with iflow=1: go to label 20

				// Label 20: l = lm1; if l != 1, go to 30 (continue row search)
				l -= 1;
				if ( l === 1 ) {
					// l=1 in 1-based: set scales and go to scaling
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

			// No isolated row found → column search (labels 100-150)
			// eslint-disable-next-line no-constant-condition
			while ( true ) {
				// Find column with one nonzero in rows k through l
				foundCol = false;
				lm1 = l - 1;
				for ( j = k - 1; j < l; j++ ) {
					ip1 = -1;
					found = false;
					for ( i = k - 1; i < lm1; i++ ) {
						idx = oA + (i * sA1) + (j * sA2);
						if ( !czero( Av, idx ) || !czero( Bv, oB + (i * sB1) + (j * sB2) ) ) {
							ip1 = i + 1;
							found = true;
							break;
						}
					}
					if ( found ) {
						// Found first nonzero at row ip1-1, check if rest are zero
						allZeroCol = true;
						for ( ii = ip1; ii < l; ii++ ) {
							idx = oA + (ii * sA1) + (j * sA2);
							if ( !czero( Av, idx ) || !czero( Bv, oB + (ii * sB1) + (j * sB2) ) ) {
								allZeroCol = false;
								break;
							}
						}
						if ( !allZeroCol ) {
							continue; // This column has multiple nonzeros
						}
						i = ip1 - 1;
					} else {
						// All rows k..lm1-1 are zero → i = l-1 (0-based)
						i = l - 1;
					}

					// Found isolated column j with single nonzero in row i
					m = k - 1; // m = k in 1-based → k-1 in 0-based

					doPermute( i, j, m );

					// After permute with iflow=2: go to label 90

					// Label 90: k = k + 1
					k += 1;
					foundCol = true;
					break; // Restart column search with new k
				}

				if ( !foundCol ) {
					// No isolated column found → go to scaling (label 190)
					return l;
				}
				// Found a column, incremented k, restart column search
			}
		}
	}

	// ----------------------------------------------------------------
	// doPermute: perform row/column permutation (labels 160-180)
	// i, j, m are 0-based indices
	/**
	* Perform row/column permutation.
	*
	* @private
	* @param {integer} ri - 0-based source row index
	* @param {integer} cj - 0-based source column index
	* @param {integer} pm - 0-based destination index
	* @returns {void}
	*/
	function doPermute( ri, cj, pm ) {
		// Pm is 0-based destination row/column
		// Ri is 0-based source row
		// Cj is 0-based source column

		// LSCALE(M) = I (1-based)
		LSCALE[ oL + (pm * sL) ] = ri + 1;

		// Permute rows M and I (0-based pm and ri)
		if ( ri !== pm ) {
			// ZSWAP(N-K+1, A(I,K), LDA, A(M,K), LDA)
			// Swap rows ri and pm, columns from k-1 to N-1
			// Stride = LDA in complex elements = sA2/2
			zswap( N - k + 1, A, strideA2, offsetA + (ri * strideA1) + (( k - 1 ) * strideA2), A, strideA2, offsetA + (pm * strideA1) + (( k - 1 ) * strideA2) );
			zswap( N - k + 1, B, strideB2, offsetB + (ri * strideB1) + (( k - 1 ) * strideB2), B, strideB2, offsetB + (pm * strideB1) + (( k - 1 ) * strideB2) );
		}

		// RSCALE(M) = J (1-based)
		RSCALE[ oR + (pm * sR) ] = cj + 1;

		// Permute columns M and J (0-based pm and cj)
		if ( cj !== pm ) {
			// ZSWAP(L, A(1,J), 1, A(1,M), 1)
			// Swap columns cj and pm, rows 0 to l-1
			// Stride = 1 in complex elements = sA1/2
			zswap( l, A, strideA1, offsetA + (cj * strideA2), A, strideA1, offsetA + (pm * strideA2) );
			zswap( l, B, strideB1, offsetB + (cj * strideB2), B, strideB1, offsetB + (pm * strideB2) );
		}
	}

	// ----------------------------------------------------------------
	// doScaling: scaling phase (labels 190 onwards)
	// Kk and ll are the final 1-based k and l values
	/**
	* Perform diagonal scaling phase.
	*
	* @private
	* @param {integer} kk - 1-based lower index
	* @param {integer} ll - 1-based upper index
	* @returns {Array} two-element array of ilo and ihi
	*/
	function doScaling( kk, ll ) {
		var ilo;
		var ihi;

		ilo = kk;
		ihi = ll;

		if ( job === 'permute' ) {
			for ( i = ilo - 1; i < ihi; i++ ) {
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
		for ( i = ilo - 1; i < ihi; i++ ) {
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
		for ( i = ilo - 1; i < ihi; i++ ) {
			for ( j = ilo - 1; j < ihi; j++ ) {
				idx = oA + (i * sA1) + (j * sA2);
				if ( czero( Av, idx ) ) {
					ta = ZERO;
				} else {
					ta = Math.log10( cabs1( Av, idx ) ) / basl;
				}
				idx = oB + (i * sB1) + (j * sB2);
				if ( czero( Bv, idx ) ) {
					tb = ZERO;
				} else {
					tb = Math.log10( cabs1( Bv, idx ) ) / basl;
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

		// Generalized conjugate gradient iteration (label 250)

		// eslint-disable-next-line no-constant-condition
		while ( true ) {
			// Compute gamma
			gamma = ddot( nr, WORK, sW, oW + (( ilo - 1 + (4 * N) ) * sW), WORK, sW, oW + (( ilo - 1 + (4 * N) ) * sW) ) +
				ddot( nr, WORK, sW, oW + (( ilo - 1 + (5 * N) ) * sW), WORK, sW, oW + (( ilo - 1 + (5 * N) ) * sW) );

			ew = ZERO;
			ewc = ZERO;
			for ( i = ilo - 1; i < ihi; i++ ) {
				ew += WORK[ oW + (( i + (4 * N) ) * sW) ];
				ewc += WORK[ oW + (( i + (5 * N) ) * sW) ];
			}

			gamma = (coef * gamma) - (coef2 * ( (ew * ew) + (ewc * ewc) )) - (coef5 * ( ew - ewc ) * ( ew - ewc ));

			if ( gamma === ZERO ) {
				break; // go to 350
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

			for ( i = ilo - 1; i < ihi; i++ ) {
				WORK[ oW + (i * sW) ] += tc;
				WORK[ oW + (( i + N ) * sW) ] += t;
			}

			// Apply matrix to vector
			for ( i = ilo - 1; i < ihi; i++ ) {
				kount = 0;
				sum = ZERO;
				for ( j = ilo - 1; j < ihi; j++ ) {
					idx = oA + (i * sA1) + (j * sA2);
					if ( !czero( Av, idx ) ) {
						kount += 1;
						sum += WORK[ oW + (j * sW) ];
					}
					idx = oB + (i * sB1) + (j * sB2);
					if ( !czero( Bv, idx ) ) {
						kount += 1;
						sum += WORK[ oW + (j * sW) ];
					}
				}
				WORK[ oW + (( i + (2 * N) ) * sW) ] = (kount * WORK[ oW + (( i + N ) * sW) ]) + sum;
			}

			for ( j = ilo - 1; j < ihi; j++ ) {
				kount = 0;
				sum = ZERO;
				for ( i = ilo - 1; i < ihi; i++ ) {
					idx = oA + (i * sA1) + (j * sA2);
					if ( !czero( Av, idx ) ) {
						kount += 1;
						sum += WORK[ oW + (( i + N ) * sW) ];
					}
					idx = oB + (i * sB1) + (j * sB2);
					if ( !czero( Bv, idx ) ) {
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
			for ( i = ilo - 1; i < ihi; i++ ) {
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
				break; // go to 350
			}

			daxpy( nr, -alpha, WORK, sW, oW + (( ilo - 1 + (2 * N) ) * sW), WORK, sW, oW + (( ilo - 1 + (4 * N) ) * sW) );
			daxpy( nr, -alpha, WORK, sW, oW + (( ilo - 1 + (3 * N) ) * sW), WORK, sW, oW + (( ilo - 1 + (5 * N) ) * sW) );

			pgamma = gamma;
			it += 1;
			if ( it > nrp2 ) {
				break; // Exceeded iteration limit
			}
		}

		// Label 350: Post-iteration scaling
		sfmin = dlamch( 'scale' );
		sfmax = ONE / sfmin;
		lsfmin = Math.trunc( (Math.log10( sfmin ) / basl) + ONE );
		lsfmax = Math.trunc( Math.log10( sfmax ) / basl );

		for ( i = ilo - 1; i < ihi; i++ ) {
			// Row scaling: find max element in row i, columns ilo-1..N-1
			// Izamax returns 0-based index into the subvector
			irab = izamax( N - ilo + 1, A, strideA2, offsetA + (i * strideA1) + (( ilo - 1 ) * strideA2) );
			rab = cabs( Av, oA + (i * sA1) + (( irab + ilo - 1 ) * sA2) );
			irab = izamax( N - ilo + 1, B, strideB2, offsetB + (i * strideB1) + (( ilo - 1 ) * strideB2) );
			rab = Math.max( rab, cabs( Bv, oB + (i * sB1) + (( irab + ilo - 1 ) * sB2) ) );
			lrab = Math.trunc( (Math.log10( rab + sfmin ) / basl) + ONE );
			ir = Math.trunc( LSCALE[ oL + (i * sL) ] + (Math.sign( LSCALE[ oL + (i * sL) ] ) * HALF) );
			ir = Math.min( Math.max( ir, lsfmin ), lsfmax, lsfmax - lrab );
			LSCALE[ oL + (i * sL) ] = Math.pow( SCLFAC, ir );

			// Column scaling: find max element in column i, rows 0..ihi-1
			icab = izamax( ihi, A, strideA1, offsetA + (i * strideA2) );
			cab = cabs( Av, oA + (icab * sA1) + (i * sA2) );
			icab = izamax( ihi, B, strideB1, offsetB + (i * strideB2) );
			cab = Math.max( cab, cabs( Bv, oB + (icab * sB1) + (i * sB2) ) );
			lcab = Math.trunc( (Math.log10( cab + sfmin ) / basl) + ONE );
			jc = Math.trunc( RSCALE[ oR + (i * sR) ] + (Math.sign( RSCALE[ oR + (i * sR) ] ) * HALF) );
			jc = Math.min( Math.max( jc, lsfmin ), lsfmax, lsfmax - lcab );
			RSCALE[ oR + (i * sR) ] = Math.pow( SCLFAC, jc );
		}

		// Row scaling of matrices A and B
		for ( i = ilo - 1; i < ihi; i++ ) {
			zdscal( N - ilo + 1, LSCALE[ oL + (i * sL) ], A, strideA2, offsetA + (i * strideA1) + (( ilo - 1 ) * strideA2) );
			zdscal( N - ilo + 1, LSCALE[ oL + (i * sL) ], B, strideB2, offsetB + (i * strideB1) + (( ilo - 1 ) * strideB2) );
		}

		// Column scaling of matrices A and B
		for ( j = ilo - 1; j < ihi; j++ ) {
			zdscal( ihi, RSCALE[ oR + (j * sR) ], A, strideA1, offsetA + (j * strideA2) );
			zdscal( ihi, RSCALE[ oR + (j * sR) ], B, strideB1, offsetB + (j * strideB2) );
		}

		return {
			'info': 0,
			'ilo': ilo,
			'ihi': ihi
		};
	}
}


// EXPORTS //

export default zggbal;
