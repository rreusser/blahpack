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

/* eslint-disable max-len, max-params, max-statements, max-depth, max-lines-per-function */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Converts the factorization output format used in `zsytrf` into the format used.
* by `zsytrf_rk` (or `zsytrf_bk`) for a complex symmetric matrix, and vice versa.
* Also converts the details of interchanges stored in `IPIV` between the two
* formats. This routine is also applicable to Hermitian matrices (zhetrf/zhetrf_rk).
*
* ## Notes
*
* -   `way = 'convert'`: extract off-diagonal of 2x2 blocks of D from A into E,
*     zero them in A, apply IPIV permutations to the triangular factor, and
*     rewrite the 2x2 IPIV entry so that the first row of the pair is marked
*     as self-pivoting.
*
* -   `way = 'revert'`: reverse the IPIV permutations, restore the original
*     2x2 IPIV encoding (both rows of the pair store the same negative value),
*     then reinsert E back into A.
*
* -   `IPIV` uses 0-based indices. Negative values encode 2x2 pivot blocks
*     via bitwise-NOT: `~IPIV[i]` gives the 0-based row/column index of the
*     interchange.
*
* -   `A` and `e` are `Complex128Array`; strides and offsets are in complex
*     elements. Internally uses Float64 views with doubled strides/offsets.
*
* -   No conjugation is performed; this routine treats A as symmetric, not
*     Hermitian (the memory manipulation is identical in either case).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} way - `'convert'` or `'revert'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - input/output matrix (column-major via strides)
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (complex elements)
* @param {Complex128Array} e - array to store or read off-diagonal elements of D
* @param {integer} strideE - stride length for `e` (complex elements)
* @param {NonNegativeInteger} offsetE - starting index for `e` (complex elements)
* @param {Int32Array} IPIV - pivot indices (0-based; negative encodes 2x2 via `~`)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @returns {integer} status code (0 = success)
*/
function zsyconvf( uplo, way, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV ) {
	var convert;
	var upper;
	var tmpRe;
	var tmpIm;
	var sa1;
	var sa2;
	var oA;
	var se;
	var oE;
	var Av;
	var Ev;
	var ip;
	var ia;
	var ib;
	var i;
	var j;

	upper = ( uplo === 'upper' );
	convert = ( way === 'convert' );

	// Quick return if possible
	if ( N === 0 ) {
		return 0;
	}

	// Reinterpret Complex128Array as Float64Array
	Av = reinterpret( A, 0 );
	Ev = reinterpret( e, 0 );

	// Convert complex-element strides/offsets to Float64 strides/offsets
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;
	se = strideE * 2;
	oE = offsetE * 2;

	if ( upper ) {
		if ( convert ) {
			// UPPER, CONVERT — VALUE step:
			// E[0] = 0; walk i from N-1 down to 1, extract off-diagonals of
			// 2x2 blocks from A[i-1, i] into E[i], zero A[i-1,i] and E[i-1].
			i = N - 1;
			Ev[ oE ] = 0.0;
			Ev[ oE + 1 ] = 0.0;
			while ( i > 0 ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] < 0 ) {
					// E[i] = A[i-1, i]
					ia = oA + ( ( i - 1 ) * sa1 ) + ( i * sa2 );
					Ev[ oE + ( i * se ) ] = Av[ ia ];
					Ev[ oE + ( i * se ) + 1 ] = Av[ ia + 1 ];

					// E[i-1] = 0
					Ev[ oE + ( ( i - 1 ) * se ) ] = 0.0;
					Ev[ oE + ( ( i - 1 ) * se ) + 1 ] = 0.0;

					// A[i-1, i] = 0
					Av[ ia ] = 0.0;
					Av[ ia + 1 ] = 0.0;
					i -= 1;
				} else {
					// E[i] = 0
					Ev[ oE + ( i * se ) ] = 0.0;
					Ev[ oE + ( i * se ) + 1 ] = 0.0;
				}
				i -= 1;
			}

			// UPPER, CONVERT — PERMUTATIONS & IPIV step:
			// Walk i from N-1 down to 0. Apply row swaps to the trailing
			// Submatrix A[*, i+1..N-1]. For 2x2 pivots, also rewrite
			// IPIV[i] = i (mark as self-pivoting).
			i = N - 1;
			while ( i >= 0 ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
					// 1x1 pivot: swap rows ip and i in columns i+1..N-1
					ip = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					if ( i < N - 1 && ip !== i ) {
						for ( j = i + 1; j < N; j++ ) {
							ia = oA + ( i * sa1 ) + ( j * sa2 );
							ib = oA + ( ip * sa1 ) + ( j * sa2 );
							tmpRe = Av[ ia ];
							tmpIm = Av[ ia + 1 ];
							Av[ ia ] = Av[ ib ];
							Av[ ia + 1 ] = Av[ ib + 1 ];
							Av[ ib ] = tmpRe;
							Av[ ib + 1 ] = tmpIm;
						}
					}
				} else {
					// 2x2 pivot: swap rows ip and i-1 in columns i+1..N-1
					ip = ~IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					if ( i < N - 1 && ip !== i - 1 ) {
						for ( j = i + 1; j < N; j++ ) {
							ia = oA + ( ( i - 1 ) * sa1 ) + ( j * sa2 );
							ib = oA + ( ip * sa1 ) + ( j * sa2 );
							tmpRe = Av[ ia ];
							tmpIm = Av[ ia + 1 ];
							Av[ ia ] = Av[ ib ];
							Av[ ia + 1 ] = Av[ ib + 1 ];
							Av[ ib ] = tmpRe;
							Av[ ib + 1 ] = tmpIm;
						}
					}
					// IPIV[i] = i (0-based "self pivot" marker)
					IPIV[ offsetIPIV + ( i * strideIPIV ) ] = i;
					i -= 1;
				}
				i -= 1;
			}
		} else {
			// UPPER, REVERT — PERMUTATIONS & IPIV step:
			// Walk i from 0 up to N-1. Reverse the row swaps applied during
			// convert (same pair of rows, applied in reverse iteration order).
			// For 2x2 pivots, restore IPIV[i] = IPIV[i-1] (both halves share
			// The negative-encoded index).
			i = 0;
			while ( i < N ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
					// 1x1 pivot
					ip = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					if ( i < N - 1 && ip !== i ) {
						for ( j = i + 1; j < N; j++ ) {
							ia = oA + ( ip * sa1 ) + ( j * sa2 );
							ib = oA + ( i * sa1 ) + ( j * sa2 );
							tmpRe = Av[ ia ];
							tmpIm = Av[ ia + 1 ];
							Av[ ia ] = Av[ ib ];
							Av[ ia + 1 ] = Av[ ib + 1 ];
							Av[ ib ] = tmpRe;
							Av[ ib + 1 ] = tmpIm;
						}
					}
				} else {
					// 2x2 pivot: Fortran increments I before reading IPIV(I).
					// At that point IPIV at the new (larger) position is
					// Positive (set to its own 1-based index during convert),
					// So Fortran's `IP = -IPIV(I)` produces a raw negative row
					// Index that is then used as an address offset into A.
					// The effective 1-based Fortran row is `-(new_I)`, i.e.
					// The 0-based JS row is `-new_I - 1 = -(i+1) - 1 = -i - 2`.
					// NOTE: This exactly replicates a quirk in the reference
					// LAPACK zsyconvf routine: the swap branch here is reached
					// Whenever the 2x2 block is followed by at least one
					// Additional column, and produces a swap that is not a
					// Clean inverse of the convert step — the fixture captures
					// This literal behavior.
					i += 1;
					ip = -i - 2;
					if ( i < N - 1 && ip !== i - 1 ) {
						for ( j = i + 1; j < N; j++ ) {
							ia = oA + ( ip * sa1 ) + ( j * sa2 );
							ib = oA + ( ( i - 1 ) * sa1 ) + ( j * sa2 );
							tmpRe = Av[ ia ];
							tmpIm = Av[ ia + 1 ];
							Av[ ia ] = Av[ ib ];
							Av[ ia + 1 ] = Av[ ib + 1 ];
							Av[ ib ] = tmpRe;
							Av[ ib + 1 ] = tmpIm;
						}
					}
					// IPIV[i] = IPIV[i-1]
					IPIV[ offsetIPIV + ( i * strideIPIV ) ] = IPIV[ offsetIPIV + ( ( i - 1 ) * strideIPIV ) ];
				}
				i += 1;
			}

			// UPPER, REVERT — VALUE step:
			// Walk i from N-1 down to 1; copy E[i] back into A[i-1, i]
			// For each 2x2 pivot.
			i = N - 1;
			while ( i > 0 ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] < 0 ) {
					// A[i-1, i] = E[i]
					ia = oA + ( ( i - 1 ) * sa1 ) + ( i * sa2 );
					Av[ ia ] = Ev[ oE + ( i * se ) ];
					Av[ ia + 1 ] = Ev[ oE + ( i * se ) + 1 ];
					i -= 1;
				}
				i -= 1;
			}
		}
	} else if ( convert ) {
		// LOWER, CONVERT — VALUE step:
		// E[N-1] = 0; walk i from 0 up to N-1. For each 2x2 pivot at index i
		// (i < N-1), extract A[i+1, i] into E[i], zero A[i+1,i] and E[i+1].
		i = 0;
		Ev[ oE + ( ( N - 1 ) * se ) ] = 0.0;
		Ev[ oE + ( ( N - 1 ) * se ) + 1 ] = 0.0;
		while ( i < N ) {
			if ( i < N - 1 && IPIV[ offsetIPIV + ( i * strideIPIV ) ] < 0 ) {
				// E[i] = A[i+1, i]
				ia = oA + ( ( i + 1 ) * sa1 ) + ( i * sa2 );
				Ev[ oE + ( i * se ) ] = Av[ ia ];
				Ev[ oE + ( i * se ) + 1 ] = Av[ ia + 1 ];

				// E[i+1] = 0
				Ev[ oE + ( ( i + 1 ) * se ) ] = 0.0;
				Ev[ oE + ( ( i + 1 ) * se ) + 1 ] = 0.0;

				// A[i+1, i] = 0
				Av[ ia ] = 0.0;
				Av[ ia + 1 ] = 0.0;
				i += 1;
			} else {
				// E[i] = 0
				Ev[ oE + ( i * se ) ] = 0.0;
				Ev[ oE + ( i * se ) + 1 ] = 0.0;
			}
			i += 1;
		}

		// LOWER, CONVERT — PERMUTATIONS & IPIV step:
		// Walk i from 0 up to N-1. Apply row swaps to the leading submatrix
		// Columns 0..i-1. For 2x2 pivots, rewrite IPIV[i] = i.
		i = 0;
		while ( i < N ) {
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
				// 1x1 pivot: swap rows ip and i in columns 0..i-1
				ip = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
				if ( i > 0 && ip !== i ) {
					for ( j = 0; j < i; j++ ) {
						ia = oA + ( i * sa1 ) + ( j * sa2 );
						ib = oA + ( ip * sa1 ) + ( j * sa2 );
						tmpRe = Av[ ia ];
						tmpIm = Av[ ia + 1 ];
						Av[ ia ] = Av[ ib ];
						Av[ ia + 1 ] = Av[ ib + 1 ];
						Av[ ib ] = tmpRe;
						Av[ ib + 1 ] = tmpIm;
					}
				}
			} else {
				// 2x2 pivot: swap rows ip and i+1 in columns 0..i-1
				ip = ~IPIV[ offsetIPIV + ( i * strideIPIV ) ];
				if ( i > 0 && ip !== i + 1 ) {
					for ( j = 0; j < i; j++ ) {
						ia = oA + ( ( i + 1 ) * sa1 ) + ( j * sa2 );
						ib = oA + ( ip * sa1 ) + ( j * sa2 );
						tmpRe = Av[ ia ];
						tmpIm = Av[ ia + 1 ];
						Av[ ia ] = Av[ ib ];
						Av[ ia + 1 ] = Av[ ib + 1 ];
						Av[ ib ] = tmpRe;
						Av[ ib + 1 ] = tmpIm;
					}
				}
				// IPIV[i] = i
				IPIV[ offsetIPIV + ( i * strideIPIV ) ] = i;
				i += 1;
			}
			i += 1;
		}
	} else {
		// LOWER, REVERT — PERMUTATIONS & IPIV step:
		// Walk i from N-1 down to 0. Reverse the row swaps. For 2x2 pivots,
		// Restore IPIV[i] = IPIV[i+1].
		i = N - 1;
		while ( i >= 0 ) {
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
				// 1x1 pivot
				ip = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
				if ( i > 0 && ip !== i ) {
					for ( j = 0; j < i; j++ ) {
						ia = oA + ( ip * sa1 ) + ( j * sa2 );
						ib = oA + ( i * sa1 ) + ( j * sa2 );
						tmpRe = Av[ ia ];
						tmpIm = Av[ ia + 1 ];
						Av[ ia ] = Av[ ib ];
						Av[ ia + 1 ] = Av[ ib + 1 ];
						Av[ ib ] = tmpRe;
						Av[ ib + 1 ] = tmpIm;
					}
				}
			} else {
				// 2x2 pivot: Fortran decrements I before reading IPIV(I).
				// At that point IPIV at the new (smaller) position is
				// Positive (set to its own 1-based index during convert),
				// So Fortran's `IP = -IPIV(I)` produces a raw negative row
				// index. See the matching note in the upper revert branch —
				// This replicates a literal quirk in reference LAPACK.
				i -= 1;
				ip = -i - 2;
				if ( i > 0 && ip !== i + 1 ) {
					for ( j = 0; j < i; j++ ) {
						ia = oA + ( ip * sa1 ) + ( j * sa2 );
						ib = oA + ( ( i + 1 ) * sa1 ) + ( j * sa2 );
						tmpRe = Av[ ia ];
						tmpIm = Av[ ia + 1 ];
						Av[ ia ] = Av[ ib ];
						Av[ ia + 1 ] = Av[ ib + 1 ];
						Av[ ib ] = tmpRe;
						Av[ ib + 1 ] = tmpIm;
					}
				}
				// IPIV[i] = IPIV[i+1]
				IPIV[ offsetIPIV + ( i * strideIPIV ) ] = IPIV[ offsetIPIV + ( ( i + 1 ) * strideIPIV ) ];
			}
			i -= 1;
		}

		// LOWER, REVERT — VALUE step:
		// Walk i from 0 up to N-2; copy E[i] back into A[i+1, i] for each 2x2.
		i = 0;
		while ( i < N - 1 ) {
			if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] < 0 ) {
				// A[i+1, i] = E[i]
				ia = oA + ( ( i + 1 ) * sa1 ) + ( i * sa2 );
				Av[ ia ] = Ev[ oE + ( i * se ) ];
				Av[ ia + 1 ] = Ev[ oE + ( i * se ) + 1 ];
				i += 1;
			}
			i += 1;
		}
	}

	return 0;
}


// EXPORTS //

export default zsyconvf;
