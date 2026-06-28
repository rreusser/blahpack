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


// MAIN //

/**
* Converts a complex symmetric matrix given by `zsytrf` (Bunch-Kaufman.
* factorization) to L and D and vice-versa. Extracts (or reinserts) the
* off-diagonal elements of the block-diagonal factor D into a separate
* array E, and applies (or reverts) the permutations stored in IPIV.
*
* ## Notes
*
* -   WAY='C' (convert): extracts off-diagonal of D into E, zeroes them in A,
*     then applies permutations from IPIV to the triangular factor rows/columns.
* -   WAY='R' (revert): reverses the permutations, then reinserts E back into A.
* -   IPIV uses 0-based indices. Negative IPIV[i] indicates a 2x2 pivot block.
*     `~IPIV[i]` gives the 0-based row/column index of the interchange.
* -   A and E are Complex128Array; strides and offsets are in complex elements.
*     Internally uses Float64 views with doubled strides/offsets.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} way - `'convert'` or `'revert'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - input/output matrix (column-major via strides)
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (complex elements)
* @param {Int32Array} IPIV - pivot indices from zsytrf (0-based)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} E - array to store off-diagonal elements of D
* @param {integer} strideE - stride length for `E` (complex elements)
* @param {NonNegativeInteger} offsetE - starting index for `E` (complex elements)
* @returns {integer} status code (0 = success)
*/
function zsyconv( uplo, way, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, E, strideE, offsetE ) {
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

	// Reinterpret Complex128Array as Float64Array for element access
	Av = reinterpret( A, 0 );
	Ev = reinterpret( E, 0 );

	// Convert complex-element strides/offsets to Float64 strides/offsets
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;
	se = strideE * 2;
	oE = offsetE * 2;

	if ( upper ) {
		if ( convert ) {
			// Upper, Convert VALUE:
			// Walk from i = N-1 (last row, 0-based) down to i = 1
			// Extract off-diagonal of 2x2 blocks into E, zero them in A
			i = N - 1;

			// E[0] = 0+0i
			Ev[ oE ] = 0.0;
			Ev[ oE + 1 ] = 0.0;
			while ( i > 0 ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] < 0 ) {
					// E[i] = A[i-1, i] (complex)
					ia = oA + ( ( i - 1 ) * sa1 ) + ( i * sa2 );
					Ev[ oE + ( i * se ) ] = Av[ ia ];
					Ev[ oE + ( i * se ) + 1 ] = Av[ ia + 1 ];

					// E[i-1] = 0+0i
					Ev[ oE + ( ( i - 1 ) * se ) ] = 0.0;
					Ev[ oE + ( ( i - 1 ) * se ) + 1 ] = 0.0;

					// A[i-1, i] = 0+0i
					Av[ ia ] = 0.0;
					Av[ ia + 1 ] = 0.0;
					i -= 1;
				} else {
					// E[i] = 0+0i
					Ev[ oE + ( i * se ) ] = 0.0;
					Ev[ oE + ( i * se ) + 1 ] = 0.0;
				}
				i -= 1;
			}

			// Upper, Convert PERMUTATIONS:
			// Walk from i = N-1 down to i = 0
			i = N - 1;
			while ( i >= 0 ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
					// 1x1 pivot: swap rows ip and i for columns i+1..N-1
					ip = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					if ( i < N - 1 ) {
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
					// 2x2 pivot: swap rows ip and i-1 for columns i+1..N-1
					ip = ~IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					if ( i < N - 1 ) {
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
					i -= 1;
				}
				i -= 1;
			}
		} else {
			// Upper, Revert PERMUTATIONS:
			// Walk from i = 0 up to i = N-1
			i = 0;
			while ( i < N ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
					// 1x1 pivot
					ip = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					if ( i < N - 1 ) {
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
					// 2x2 pivot: Fortran increments I before swap
					ip = ~IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					i += 1;
					if ( i < N - 1 ) {
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
				}
				i += 1;
			}

			// Upper, Revert VALUE:
			// Walk from i = N-1 down to i = 1
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
	} else {
		// LOWER
		if ( convert ) {
			// Lower, Convert VALUE:
			// Walk from i = 0 up to i = N-1
			i = 0;

			// E[N-1] = 0+0i
			Ev[ oE + ( ( N - 1 ) * se ) ] = 0.0;
			Ev[ oE + ( ( N - 1 ) * se ) + 1 ] = 0.0;
			while ( i < N ) {
				if ( i < N - 1 && IPIV[ offsetIPIV + ( i * strideIPIV ) ] < 0 ) {
					// E[i] = A[i+1, i] (complex)
					ia = oA + ( ( i + 1 ) * sa1 ) + ( i * sa2 );
					Ev[ oE + ( i * se ) ] = Av[ ia ];
					Ev[ oE + ( i * se ) + 1 ] = Av[ ia + 1 ];

					// E[i+1] = 0+0i
					Ev[ oE + ( ( i + 1 ) * se ) ] = 0.0;
					Ev[ oE + ( ( i + 1 ) * se ) + 1 ] = 0.0;

					// A[i+1, i] = 0+0i
					Av[ ia ] = 0.0;
					Av[ ia + 1 ] = 0.0;
					i += 1;
				} else {
					// E[i] = 0+0i
					Ev[ oE + ( i * se ) ] = 0.0;
					Ev[ oE + ( i * se ) + 1 ] = 0.0;
				}
				i += 1;
			}

			// Lower, Convert PERMUTATIONS:
			// Walk from i = 0 up to i = N-1
			i = 0;
			while ( i < N ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
					// 1x1 pivot: swap rows ip and i for columns 0..i-1
					ip = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					if ( i > 0 ) {
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
					// 2x2 pivot: swap rows ip and i+1 for columns 0..i-1
					ip = ~IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					if ( i > 0 ) {
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
					i += 1;
				}
				i += 1;
			}
		} else {
			// Lower, Revert PERMUTATIONS:
			// Walk from i = N-1 down to i = 0
			i = N - 1;
			while ( i >= 0 ) {
				if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] >= 0 ) {
					// 1x1 pivot
					ip = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					if ( i > 0 ) {
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
					// 2x2 pivot: Fortran decrements I before swap
					ip = ~IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					i -= 1;
					if ( i > 0 ) {
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
				}
				i -= 1;
			}

			// Lower, Revert VALUE:
			// Walk from i = 0 up to i = N-2
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
	}

	return 0;
}


// EXPORTS //

export default zsyconv;
