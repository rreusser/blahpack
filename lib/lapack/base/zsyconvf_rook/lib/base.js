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

/* eslint-disable max-len, max-params, max-statements, max-depth, max-lines-per-function, camelcase */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// FUNCTIONS //

/**
* Swaps two rows of the complex matrix view `av` across a contiguous range of columns.
*
* @private
* @param {Float64Array} av - reinterpreted matrix view
* @param {integer} oA - base offset (Float64 units)
* @param {integer} sa1 - first-dimension stride (Float64 units)
* @param {integer} sa2 - second-dimension stride (Float64 units)
* @param {NonNegativeInteger} r1 - first row index (0-based)
* @param {NonNegativeInteger} r2 - second row index (0-based)
* @param {NonNegativeInteger} jStart - starting column index (0-based, inclusive)
* @param {NonNegativeInteger} jEnd - ending column index (0-based, exclusive)
* @returns {void}
*/
function swapRows( av, oA, sa1, sa2, r1, r2, jStart, jEnd ) {
	var tr;
	var ti;
	var ia;
	var ib;
	var j;
	if ( r1 === r2 ) {
		return;
	}
	for ( j = jStart; j < jEnd; j++ ) {
		ia = oA + ( r1 * sa1 ) + ( j * sa2 );
		ib = oA + ( r2 * sa1 ) + ( j * sa2 );
		tr = av[ ia ];
		ti = av[ ia + 1 ];
		av[ ia ] = av[ ib ];
		av[ ia + 1 ] = av[ ib + 1 ];
		av[ ib ] = tr;
		av[ ib + 1 ] = ti;
	}
}


// MAIN //

/**
* Converts the factorization output format used in `zsytrf_rook` into the `zsytrf_rk` format for a complex symmetric matrix, or reverts the conversion.
*
* ## Notes
*
* -   `way = 'convert'`: extracts the off-diagonal elements of the 2x2 diagonal
*     blocks of `D` into `E`, zeros them in `A`, then applies the rook pivoting
*     permutations to the triangular factor rows in factorization order.
*
* -   `way = 'revert'`: reverses the permutations in reverse factorization order
*     then reinserts the elements of `E` back into `A`.
*
* -   The routine is symmetric (not Hermitian), so no conjugation is performed.
*
* -   `IPIV` uses 0-based indices. Both elements of a 2x2 rook pivot pair are
*     encoded as negative (bitwise NOT of the partner row). `~IPIV[i]` decodes
*     the 0-based row index of the interchange.
*
* -   `A` and `E` are `Complex128Array`; strides and offsets are in complex
*     elements. Internally they are reinterpreted as `Float64Array` views with
*     strides and offsets doubled.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} way - `'convert'` or `'revert'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - input/output matrix (column-major via strides)
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (complex elements)
* @param {Complex128Array} e - array to store/read off-diagonal elements of `D`
* @param {integer} strideE - stride length for `e` (complex elements)
* @param {NonNegativeInteger} offsetE - starting index for `e` (complex elements)
* @param {Int32Array} IPIV - pivot indices from `zsytrf_rook` (0-based)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @returns {integer} status code (0 = success)
*/
function zsyconvf_rook( uplo, way, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV ) {
	var convert;
	var upper;
	var sa1;
	var sa2;
	var ip2;
	var oA;
	var se;
	var oE;
	var Av;
	var Ev;
	var ip;
	var pv;
	var ia;
	var i;

	upper = ( uplo === 'upper' );
	convert = ( way === 'convert' );

	// Quick return
	if ( N === 0 ) {
		return 0;
	}

	Av = reinterpret( A, 0 );
	Ev = reinterpret( e, 0 );

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;
	se = strideE * 2;
	oE = offsetE * 2;

	if ( upper ) {
		if ( convert ) {
			// Upper, Convert VALUE: walk i from N-1 down to 1.
			i = N - 1;

			// E[0] = 0+0i
			Ev[ oE ] = 0.0;
			Ev[ oE + 1 ] = 0.0;
			while ( i > 0 ) {
				pv = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
				if ( pv < 0 ) {
					// E[i] = A[i-1, i]
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
					Ev[ oE + ( i * se ) ] = 0.0;
					Ev[ oE + ( i * se ) + 1 ] = 0.0;
				}
				i -= 1;
			}

			// Upper, Convert PERMUTATIONS: walk i from N-1 down to 0.
			i = N - 1;
			while ( i >= 0 ) {
				pv = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
				if ( pv >= 0 ) {
					// 1x1 pivot: swap rows ip and i across columns i+1..N-1.
					ip = pv;
					if ( i < N - 1 ) {
						swapRows( Av, oA, sa1, sa2, i, ip, i + 1, N );
					}
				} else {
					// 2x2 pivot: swap rows ip and i AND ip2 and i-1.
					ip = ~pv;
					ip2 = ~IPIV[ offsetIPIV + ( ( i - 1 ) * strideIPIV ) ];
					if ( i < N - 1 ) {
						swapRows( Av, oA, sa1, sa2, i, ip, i + 1, N );
						swapRows( Av, oA, sa1, sa2, i - 1, ip2, i + 1, N );
					}
					i -= 1;
				}
				i -= 1;
			}
		} else {
			// Upper, Revert PERMUTATIONS: walk i from 0 up to N-1.
			i = 0;
			while ( i < N ) {
				pv = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
				if ( pv >= 0 ) {
					ip = pv;
					if ( i < N - 1 ) {
						swapRows( Av, oA, sa1, sa2, ip, i, i + 1, N );
					}
				} else {
					// 2x2 pivot: Fortran advances I then reads IPIV(I) and IPIV(I-1).
					i += 1;
					ip = ~IPIV[ offsetIPIV + ( i * strideIPIV ) ];
					ip2 = ~IPIV[ offsetIPIV + ( ( i - 1 ) * strideIPIV ) ];
					if ( i < N - 1 ) {
						swapRows( Av, oA, sa1, sa2, ip2, i - 1, i + 1, N );
						swapRows( Av, oA, sa1, sa2, ip, i, i + 1, N );
					}
				}
				i += 1;
			}

			// Upper, Revert VALUE: walk i from N-1 down to 1.
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
		// Lower, Convert VALUE: walk i from 0 up.
		i = 0;

		// E[N-1] = 0+0i
		Ev[ oE + ( ( N - 1 ) * se ) ] = 0.0;
		Ev[ oE + ( ( N - 1 ) * se ) + 1 ] = 0.0;
		while ( i < N ) {
			pv = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			if ( i < N - 1 && pv < 0 ) {
				// E[i] = A[i+1, i]
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
				Ev[ oE + ( i * se ) ] = 0.0;
				Ev[ oE + ( i * se ) + 1 ] = 0.0;
			}
			i += 1;
		}

		// Lower, Convert PERMUTATIONS: walk i from 0 up to N-1.
		i = 0;
		while ( i < N ) {
			pv = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			if ( pv >= 0 ) {
				ip = pv;
				if ( i > 0 ) {
					swapRows( Av, oA, sa1, sa2, i, ip, 0, i );
				}
			} else {
				ip = ~pv;
				ip2 = ~IPIV[ offsetIPIV + ( ( i + 1 ) * strideIPIV ) ];
				if ( i > 0 ) {
					swapRows( Av, oA, sa1, sa2, i, ip, 0, i );
					swapRows( Av, oA, sa1, sa2, i + 1, ip2, 0, i );
				}
				i += 1;
			}
			i += 1;
		}
	} else {
		// Lower, Revert PERMUTATIONS: walk i from N-1 down to 0.
		i = N - 1;
		while ( i >= 0 ) {
			pv = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			if ( pv >= 0 ) {
				ip = pv;
				if ( i > 0 ) {
					swapRows( Av, oA, sa1, sa2, ip, i, 0, i );
				}
			} else {
				// 2x2: Fortran decrements I then reads IPIV(I) and IPIV(I+1).
				i -= 1;
				ip = ~IPIV[ offsetIPIV + ( i * strideIPIV ) ];
				ip2 = ~IPIV[ offsetIPIV + ( ( i + 1 ) * strideIPIV ) ];
				if ( i > 0 ) {
					swapRows( Av, oA, sa1, sa2, ip2, i + 1, 0, i );
					swapRows( Av, oA, sa1, sa2, ip, i, 0, i );
				}
			}
			i -= 1;
		}

		// Lower, Revert VALUE: walk i from 0 up to N-2.
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

export default zsyconvf_rook;
