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

/* eslint-disable max-len, max-params, max-statements, max-depth, max-lines-per-function, max-lines */

// MODULES //

import FLOAT64_SMALLEST_NORMAL from '@stdlib/constants/float64/smallest-normal/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import izamax from './../../../../blas/base/izamax/lib/base.js';
import zscal from './../../../../blas/base/zscal/lib/base.js';
import zswap from './../../../../blas/base/zswap/lib/base.js';
import zsyr from './../../zsyr/lib/base.js';


// VARIABLES //

var ALPHA = ( 1.0 + Math.sqrt( 17.0 ) ) / 8.0;
var SFMIN = FLOAT64_SMALLEST_NORMAL;

// Module-level scratch for Smith's-formula complex division output.
var cdR = 0.0;
var cdI = 0.0;


// FUNCTIONS //

/**
* Computes `(aR + i*aI) / (bR + i*bI)` using Smith's formula for numerical stability. The result is stored in the module-level `cdR`/`cdI`.
*
* @private
* @param {number} aR - numerator real part
* @param {number} aI - numerator imaginary part
* @param {number} bR - denominator real part
* @param {number} bI - denominator imaginary part
*/
function smithDiv( aR, aI, bR, bI ) {
	var r;
	var d;
	if ( Math.abs( bI ) <= Math.abs( bR ) ) {
		r = bI / bR;
		d = bR + ( bI * r );
		cdR = ( aR + ( aI * r ) ) / d;
		cdI = ( aI - ( aR * r ) ) / d;
	} else {
		r = bR / bI;
		d = bI + ( bR * r );
		cdR = ( ( aR * r ) + aI ) / d;
		cdI = ( ( aI * r ) - aR ) / d;
	}
}


// MAIN //

/**
* Computes the factorization of a complex symmetric matrix `A` using the bounded Bunch-Kaufman (rook) diagonal pivoting method:.
*
* ```text
* A = P*U*D*(U^T)*(P^T)  or  A = P*L*D*(L^T)*(P^T)
* ```
*
* where `U` (or `L`) is unit upper (lower) triangular, `P` is a permutation, and `D` is complex symmetric and block diagonal with `1x1` and `2x2` blocks.
*
* The diagonal of `D` is stored on the diagonal of `A`; the super-/sub-diagonal entries of `D` are returned in `e`. `IPIV` uses the 0-based encoding with bitwise-NOT for `2x2` blocks.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input/output complex symmetric matrix
* @param {integer} strideA1 - stride of dimension 1 of `A` (in complex elements)
* @param {integer} strideA2 - stride of dimension 2 of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - complex-element offset for `A`
* @param {Complex128Array} e - output super-/sub-diagonal entries of `D`
* @param {integer} strideE - stride for `e`
* @param {NonNegativeInteger} offsetE - complex-element offset for `e`
* @param {Int32Array} IPIV - pivot index output array
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @returns {integer} info - `0` on success; `k>0` (1-based) if `D(k,k)` is exactly zero
*/
function zsytf2rk( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV ) {
	var absakk;
	var colmax;
	var rowmax;
	var itemp;
	var kstep;
	var dtemp;
	var wkm1R;
	var wkm1I;
	var wkp1R;
	var wkp1I;
	var done;
	var info;
	var imax;
	var jmax;
	var d11R;
	var d11I;
	var d12R;
	var d12I;
	var d21R;
	var d21I;
	var d22R;
	var d22I;
	var oa2;
	var oe2;
	var se2;
	var wkR;
	var wkI;
	var sa1;
	var sa2;
	var r1R;
	var r1I;
	var Av;
	var Ev;
	var tR;
	var tI;
	var tr;
	var ti;
	var ii;
	var kk;
	var kp;
	var p1;
	var p2;
	var p3;
	var p4;
	var p;
	var k;
	var i;
	var j;

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oa2 = offsetA * 2;
	se2 = strideE * 2;
	oe2 = offsetE * 2;
	Av = reinterpret( A, 0 );
	Ev = reinterpret( e, 0 );
	info = 0;

	if ( N === 0 ) {
		return 0;
	}

	if ( uplo === 'upper' ) {
		// Factorize A as U * D * U^T using the upper triangle of A.
		Ev[ oe2 ] = 0.0;
		Ev[ oe2 + 1 ] = 0.0;

		k = N - 1;
		while ( k >= 0 ) {
			kstep = 1;
			p = k;

			// ABSAKK = CABS1(A(k,k)).
			p1 = oa2 + (k * sa1) + (k * sa2);
			absakk = Math.abs( Av[ p1 ] ) + Math.abs( Av[ p1 + 1 ] );

			if ( k > 0 ) {
				imax = izamax( k, A, strideA1, offsetA + (k * strideA2) );
				p2 = oa2 + (imax * sa1) + (k * sa2);
				colmax = Math.abs( Av[ p2 ] ) + Math.abs( Av[ p2 + 1 ] );
			} else {
				colmax = 0.0;
				imax = 0;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				if ( info === 0 ) {
					info = k + 1;
				}
				kp = k;
				if ( k > 0 ) {
					Ev[ oe2 + (k * se2) ] = 0.0;
					Ev[ oe2 + (k * se2) + 1 ] = 0.0;
				}
			} else {
				if ( absakk >= ALPHA * colmax ) {
					kp = k;
				} else {
					done = false;
					while ( !done ) {
						if ( imax === k ) {
							rowmax = 0.0;
							jmax = imax;
						} else {
							jmax = imax + 1 + izamax( k - imax, A, strideA2, offsetA + (imax * strideA1) + (( imax + 1 ) * strideA2) );
							p3 = oa2 + (imax * sa1) + (jmax * sa2);
							rowmax = Math.abs( Av[ p3 ] ) + Math.abs( Av[ p3 + 1 ] );
						}

						if ( imax > 0 ) {
							itemp = izamax( imax, A, strideA1, offsetA + (imax * strideA2) );
							p4 = oa2 + (itemp * sa1) + (imax * sa2);
							dtemp = Math.abs( Av[ p4 ] ) + Math.abs( Av[ p4 + 1 ] );
							if ( dtemp > rowmax ) {
								rowmax = dtemp;
								jmax = itemp;
							}
						}

						// CABS1(A(imax,imax)).
						p4 = oa2 + (imax * sa1) + (imax * sa2);
						if ( ( Math.abs( Av[ p4 ] ) + Math.abs( Av[ p4 + 1 ] ) ) >= ALPHA * rowmax ) {
							kp = imax;
							done = true;
						} else if ( p === jmax || rowmax <= colmax ) {
							kp = imax;
							kstep = 2;
							done = true;
						} else {
							p = imax;
							colmax = rowmax;
							imax = jmax;
						}
					}
				}

				kk = k - kstep + 1;

				// First swap: K <-> P for 2x2 pivot.
				if ( kstep === 2 && p !== k ) {
					if ( p > 0 ) {
						zswap( p, A, strideA1, offsetA + (k * strideA2), A, strideA1, offsetA + (p * strideA2) );
					}
					if ( p < k - 1 ) {
						zswap( k - p - 1, A, strideA1, offsetA + (( p + 1 ) * strideA1) + (k * strideA2), A, strideA2, offsetA + (p * strideA1) + (( p + 1 ) * strideA2) );
					}
					// Swap A(k,k) <-> A(p,p).
					p1 = oa2 + (k * sa1) + (k * sa2);
					p2 = oa2 + (p * sa1) + (p * sa2);
					tR = Av[ p1 ];
					tI = Av[ p1 + 1 ];
					Av[ p1 ] = Av[ p2 ];
					Av[ p1 + 1 ] = Av[ p2 + 1 ];
					Av[ p2 ] = tR;
					Av[ p2 + 1 ] = tI;

					// Swap trailing rows K and P across columns K+1..N-1.
					if ( k < N - 1 ) {
						zswap( N - k - 1, A, strideA2, offsetA + (k * strideA1) + (( k + 1 ) * strideA2), A, strideA2, offsetA + (p * strideA1) + (( k + 1 ) * strideA2) );
					}
				}

				// Second swap: KK <-> KP.
				if ( kp !== kk ) {
					if ( kp > 0 ) {
						zswap( kp, A, strideA1, offsetA + (kk * strideA2), A, strideA1, offsetA + (kp * strideA2) );
					}
					if ( kk > 0 && kp < kk - 1 ) {
						zswap( kk - kp - 1, A, strideA1, offsetA + (( kp + 1 ) * strideA1) + (kk * strideA2), A, strideA2, offsetA + (kp * strideA1) + (( kp + 1 ) * strideA2) );
					}
					p1 = oa2 + (kk * sa1) + (kk * sa2);
					p2 = oa2 + (kp * sa1) + (kp * sa2);
					tR = Av[ p1 ];
					tI = Av[ p1 + 1 ];
					Av[ p1 ] = Av[ p2 ];
					Av[ p1 + 1 ] = Av[ p2 + 1 ];
					Av[ p2 ] = tR;
					Av[ p2 + 1 ] = tI;
					if ( kstep === 2 ) {
						// Swap A(k-1,k) <-> A(kp,k).
						p1 = oa2 + (( k - 1 ) * sa1) + (k * sa2);
						p2 = oa2 + (kp * sa1) + (k * sa2);
						tR = Av[ p1 ];
						tI = Av[ p1 + 1 ];
						Av[ p1 ] = Av[ p2 ];
						Av[ p1 + 1 ] = Av[ p2 + 1 ];
						Av[ p2 ] = tR;
						Av[ p2 + 1 ] = tI;
					}
					if ( k < N - 1 ) {
						zswap( N - k - 1, A, strideA2, offsetA + (kk * strideA1) + (( k + 1 ) * strideA2), A, strideA2, offsetA + (kp * strideA1) + (( k + 1 ) * strideA2) );
					}
				}

				// Update the leading submatrix.
				if ( kstep === 1 ) {
					if ( k > 0 ) {
						p1 = oa2 + (k * sa1) + (k * sa2);

						// CABS1(A(k,k)) >= SFMIN ?
						if ( ( Math.abs( Av[ p1 ] ) + Math.abs( Av[ p1 + 1 ] ) ) >= SFMIN ) {
							// D11 = 1 / A(k,k) using Smith's formula.
							smithDiv( 1.0, 0.0, Av[ p1 ], Av[ p1 + 1 ] );
							r1R = cdR;
							r1I = cdI;
							zsyr( uplo, k, new Complex128( -r1R, -r1I ), A, strideA1, offsetA + (k * strideA2), A, strideA1, strideA2, offsetA );
							zscal( k, new Complex128( r1R, r1I ), A, strideA1, offsetA + (k * strideA2) );
						} else {
							// Near-underflow rescaling path.
							d11R = Av[ p1 ];
							d11I = Av[ p1 + 1 ];
							for ( ii = 0; ii < k; ii++ ) {
								p2 = oa2 + (ii * sa1) + (k * sa2);
								smithDiv( Av[ p2 ], Av[ p2 + 1 ], d11R, d11I );
								Av[ p2 ] = cdR;
								Av[ p2 + 1 ] = cdI;
							}
							zsyr( uplo, k, new Complex128( -d11R, -d11I ), A, strideA1, offsetA + (k * strideA2), A, strideA1, strideA2, offsetA );
						}
						Ev[ oe2 + (k * se2) ] = 0.0;
						Ev[ oe2 + (k * se2) + 1 ] = 0.0;
					}
				} else if ( k > 1 ) {
					// 2x2 pivot block D(k-1..k).
					// D12 = A(k-1,k)
					p1 = oa2 + (( k - 1 ) * sa1) + (k * sa2);
					d12R = Av[ p1 ];
					d12I = Av[ p1 + 1 ];

					// D22 = A(k-1,k-1) / D12
					p2 = oa2 + (( k - 1 ) * sa1) + (( k - 1 ) * sa2);
					smithDiv( Av[ p2 ], Av[ p2 + 1 ], d12R, d12I );
					d22R = cdR;
					d22I = cdI;

					// D11 = A(k,k) / D12
					p3 = oa2 + (k * sa1) + (k * sa2);
					smithDiv( Av[ p3 ], Av[ p3 + 1 ], d12R, d12I );
					d11R = cdR;
					d11I = cdI;

					// T = 1 / (D11*D22 - 1)
					tr = ( d11R * d22R ) - ( d11I * d22I ) - 1.0;
					ti = ( d11R * d22I ) + ( d11I * d22R );
					smithDiv( 1.0, 0.0, tr, ti );
					r1R = cdR;
					r1I = cdI;

					// D12 = T / D12
					smithDiv( r1R, r1I, d12R, d12I );
					d12R = cdR;
					d12I = cdI;

					for ( j = k - 2; j >= 0; j-- ) {
						// WKM1 = D12 * (D11*A(j,k-1) - A(j,k))
						p1 = oa2 + (j * sa1) + (( k - 1 ) * sa2);
						p2 = oa2 + (j * sa1) + (k * sa2);
						tr = ( d11R * Av[ p1 ] ) - ( d11I * Av[ p1 + 1 ] );
						ti = ( d11R * Av[ p1 + 1 ] ) + ( d11I * Av[ p1 ] );
						tr -= Av[ p2 ];
						ti -= Av[ p2 + 1 ];
						wkm1R = ( d12R * tr ) - ( d12I * ti );
						wkm1I = ( d12R * ti ) + ( d12I * tr );

						// WK = D12 * (D22*A(j,k) - A(j,k-1))
						tr = ( d22R * Av[ p2 ] ) - ( d22I * Av[ p2 + 1 ] );
						ti = ( d22R * Av[ p2 + 1 ] ) + ( d22I * Av[ p2 ] );
						tr -= Av[ p1 ];
						ti -= Av[ p1 + 1 ];
						wkR = ( d12R * tr ) - ( d12I * ti );
						wkI = ( d12R * ti ) + ( d12I * tr );

						for ( i = j; i >= 0; i-- ) {
							// A(i,j) -= A(i,k)*WK + A(i,k-1)*WKM1
							p3 = oa2 + (i * sa1) + (j * sa2);
							p4 = oa2 + (i * sa1) + (k * sa2);

							// A(i,k)*WK (complex mul)
							tr = ( Av[ p4 ] * wkR ) - ( Av[ p4 + 1 ] * wkI );
							ti = ( Av[ p4 ] * wkI ) + ( Av[ p4 + 1 ] * wkR );

							// A(i,k-1)*WKM1
							p4 = oa2 + (i * sa1) + (( k - 1 ) * sa2);
							tr += ( Av[ p4 ] * wkm1R ) - ( Av[ p4 + 1 ] * wkm1I );
							ti += ( Av[ p4 ] * wkm1I ) + ( Av[ p4 + 1 ] * wkm1R );
							Av[ p3 ] -= tr;
							Av[ p3 + 1 ] -= ti;
						}
						// A(j,k) = WK
						Av[ p2 ] = wkR;
						Av[ p2 + 1 ] = wkI;

						// A(j,k-1) = WKM1
						Av[ p1 ] = wkm1R;
						Av[ p1 + 1 ] = wkm1I;
					}
				}

				if ( kstep === 2 ) {
					// Copy A(k-1,k) into E and zero it out.
					p1 = oa2 + (( k - 1 ) * sa1) + (k * sa2);
					Ev[ oe2 + (k * se2) ] = Av[ p1 ];
					Ev[ oe2 + (k * se2) + 1 ] = Av[ p1 + 1 ];
					Ev[ oe2 + (( k - 1 ) * se2) ] = 0.0;
					Ev[ oe2 + (( k - 1 ) * se2) + 1 ] = 0.0;
					Av[ p1 ] = 0.0;
					Av[ p1 + 1 ] = 0.0;
				}
			}

			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = kp;
			} else {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = ~p;
				IPIV[ offsetIPIV + (( k - 1 ) * strideIPIV) ] = ~kp;
			}

			k -= kstep;
		}
	} else {
		// Factorize A as L * D * L^T using the lower triangle of A.
		Ev[ oe2 + (( N - 1 ) * se2) ] = 0.0;
		Ev[ oe2 + (( N - 1 ) * se2) + 1 ] = 0.0;

		k = 0;
		while ( k < N ) {
			kstep = 1;
			p = k;

			p1 = oa2 + (k * sa1) + (k * sa2);
			absakk = Math.abs( Av[ p1 ] ) + Math.abs( Av[ p1 + 1 ] );

			if ( k < N - 1 ) {
				imax = k + 1 + izamax( N - k - 1, A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2) );
				p2 = oa2 + (imax * sa1) + (k * sa2);
				colmax = Math.abs( Av[ p2 ] ) + Math.abs( Av[ p2 + 1 ] );
			} else {
				colmax = 0.0;
				imax = k;
			}

			if ( Math.max( absakk, colmax ) === 0.0 ) {
				if ( info === 0 ) {
					info = k + 1;
				}
				kp = k;
				if ( k < N - 1 ) {
					Ev[ oe2 + (k * se2) ] = 0.0;
					Ev[ oe2 + (k * se2) + 1 ] = 0.0;
				}
			} else {
				if ( absakk >= ALPHA * colmax ) {
					kp = k;
				} else {
					done = false;
					while ( !done ) {
						if ( imax === k ) {
							rowmax = 0.0;
							jmax = imax;
						} else {
							jmax = k + izamax( imax - k, A, strideA2, offsetA + (imax * strideA1) + (k * strideA2) );
							p3 = oa2 + (imax * sa1) + (jmax * sa2);
							rowmax = Math.abs( Av[ p3 ] ) + Math.abs( Av[ p3 + 1 ] );
						}

						if ( imax < N - 1 ) {
							itemp = imax + 1 + izamax( N - imax - 1, A, strideA1, offsetA + (( imax + 1 ) * strideA1) + (imax * strideA2) );
							p4 = oa2 + (itemp * sa1) + (imax * sa2);
							dtemp = Math.abs( Av[ p4 ] ) + Math.abs( Av[ p4 + 1 ] );
							if ( dtemp > rowmax ) {
								rowmax = dtemp;
								jmax = itemp;
							}
						}

						p4 = oa2 + (imax * sa1) + (imax * sa2);
						if ( ( Math.abs( Av[ p4 ] ) + Math.abs( Av[ p4 + 1 ] ) ) >= ALPHA * rowmax ) {
							kp = imax;
							done = true;
						} else if ( p === jmax || rowmax <= colmax ) {
							kp = imax;
							kstep = 2;
							done = true;
						} else {
							p = imax;
							colmax = rowmax;
							imax = jmax;
						}
					}
				}

				kk = k + kstep - 1;

				// First swap for 2x2: K <-> P.
				if ( kstep === 2 && p !== k ) {
					if ( p < N - 1 ) {
						zswap( N - p - 1, A, strideA1, offsetA + (( p + 1 ) * strideA1) + (k * strideA2), A, strideA1, offsetA + (( p + 1 ) * strideA1) + (p * strideA2) );
					}
					if ( p > k + 1 ) {
						zswap( p - k - 1, A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2), A, strideA2, offsetA + (p * strideA1) + (( k + 1 ) * strideA2) );
					}
					p1 = oa2 + (k * sa1) + (k * sa2);
					p2 = oa2 + (p * sa1) + (p * sa2);
					tR = Av[ p1 ];
					tI = Av[ p1 + 1 ];
					Av[ p1 ] = Av[ p2 ];
					Av[ p1 + 1 ] = Av[ p2 + 1 ];
					Av[ p2 ] = tR;
					Av[ p2 + 1 ] = tI;
					if ( k > 0 ) {
						zswap( k, A, strideA2, offsetA + (k * strideA1), A, strideA2, offsetA + (p * strideA1) );
					}
				}

				// Second swap: KK <-> KP.
				if ( kp !== kk ) {
					if ( kp < N - 1 ) {
						zswap( N - kp - 1, A, strideA1, offsetA + (( kp + 1 ) * strideA1) + (kk * strideA2), A, strideA1, offsetA + (( kp + 1 ) * strideA1) + (kp * strideA2) );
					}
					if ( kk < N - 1 && kp > kk + 1 ) {
						zswap( kp - kk - 1, A, strideA1, offsetA + (( kk + 1 ) * strideA1) + (kk * strideA2), A, strideA2, offsetA + (kp * strideA1) + (( kk + 1 ) * strideA2) );
					}
					p1 = oa2 + (kk * sa1) + (kk * sa2);
					p2 = oa2 + (kp * sa1) + (kp * sa2);
					tR = Av[ p1 ];
					tI = Av[ p1 + 1 ];
					Av[ p1 ] = Av[ p2 ];
					Av[ p1 + 1 ] = Av[ p2 + 1 ];
					Av[ p2 ] = tR;
					Av[ p2 + 1 ] = tI;
					if ( kstep === 2 ) {
						p1 = oa2 + (( k + 1 ) * sa1) + (k * sa2);
						p2 = oa2 + (kp * sa1) + (k * sa2);
						tR = Av[ p1 ];
						tI = Av[ p1 + 1 ];
						Av[ p1 ] = Av[ p2 ];
						Av[ p1 + 1 ] = Av[ p2 + 1 ];
						Av[ p2 ] = tR;
						Av[ p2 + 1 ] = tI;
					}
					if ( k > 0 ) {
						zswap( k, A, strideA2, offsetA + (kk * strideA1), A, strideA2, offsetA + (kp * strideA1) );
					}
				}

				// Update the trailing submatrix.
				if ( kstep === 1 ) {
					if ( k < N - 1 ) {
						p1 = oa2 + (k * sa1) + (k * sa2);
						if ( ( Math.abs( Av[ p1 ] ) + Math.abs( Av[ p1 + 1 ] ) ) >= SFMIN ) {
							smithDiv( 1.0, 0.0, Av[ p1 ], Av[ p1 + 1 ] );
							r1R = cdR;
							r1I = cdI;
							zsyr( uplo, N - k - 1, new Complex128( -r1R, -r1I ), A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2), A, strideA1, strideA2, offsetA + (( k + 1 ) * strideA1) + (( k + 1 ) * strideA2) );
							zscal( N - k - 1, new Complex128( r1R, r1I ), A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2) );
						} else {
							d11R = Av[ p1 ];
							d11I = Av[ p1 + 1 ];
							for ( ii = k + 1; ii < N; ii++ ) {
								p2 = oa2 + (ii * sa1) + (k * sa2);
								smithDiv( Av[ p2 ], Av[ p2 + 1 ], d11R, d11I );
								Av[ p2 ] = cdR;
								Av[ p2 + 1 ] = cdI;
							}
							zsyr( uplo, N - k - 1, new Complex128( -d11R, -d11I ), A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2), A, strideA1, strideA2, offsetA + (( k + 1 ) * strideA1) + (( k + 1 ) * strideA2) );
						}
						Ev[ oe2 + (k * se2) ] = 0.0;
						Ev[ oe2 + (k * se2) + 1 ] = 0.0;
					}
				} else if ( k < N - 2 ) {
					// 2x2 pivot block D(k..k+1).
					p1 = oa2 + (( k + 1 ) * sa1) + (k * sa2);
					d21R = Av[ p1 ];
					d21I = Av[ p1 + 1 ];

					// D11 = A(k+1,k+1) / D21
					p2 = oa2 + (( k + 1 ) * sa1) + (( k + 1 ) * sa2);
					smithDiv( Av[ p2 ], Av[ p2 + 1 ], d21R, d21I );
					d11R = cdR;
					d11I = cdI;

					// D22 = A(k,k) / D21
					p3 = oa2 + (k * sa1) + (k * sa2);
					smithDiv( Av[ p3 ], Av[ p3 + 1 ], d21R, d21I );
					d22R = cdR;
					d22I = cdI;

					// T = 1 / (D11*D22 - 1)
					tr = ( d11R * d22R ) - ( d11I * d22I ) - 1.0;
					ti = ( d11R * d22I ) + ( d11I * d22R );
					smithDiv( 1.0, 0.0, tr, ti );
					r1R = cdR;
					r1I = cdI;

					// D21 = T / D21
					smithDiv( r1R, r1I, d21R, d21I );
					d21R = cdR;
					d21I = cdI;

					for ( j = k + 2; j < N; j++ ) {
						// WK = D21 * (D11*A(j,k) - A(j,k+1))
						p1 = oa2 + (j * sa1) + (k * sa2);
						p2 = oa2 + (j * sa1) + (( k + 1 ) * sa2);
						tr = ( d11R * Av[ p1 ] ) - ( d11I * Av[ p1 + 1 ] );
						ti = ( d11R * Av[ p1 + 1 ] ) + ( d11I * Av[ p1 ] );
						tr -= Av[ p2 ];
						ti -= Av[ p2 + 1 ];
						wkR = ( d21R * tr ) - ( d21I * ti );
						wkI = ( d21R * ti ) + ( d21I * tr );

						// WKP1 = D21 * (D22*A(j,k+1) - A(j,k))
						tr = ( d22R * Av[ p2 ] ) - ( d22I * Av[ p2 + 1 ] );
						ti = ( d22R * Av[ p2 + 1 ] ) + ( d22I * Av[ p2 ] );
						tr -= Av[ p1 ];
						ti -= Av[ p1 + 1 ];
						wkp1R = ( d21R * tr ) - ( d21I * ti );
						wkp1I = ( d21R * ti ) + ( d21I * tr );

						for ( i = j; i < N; i++ ) {
							p3 = oa2 + (i * sa1) + (j * sa2);
							p4 = oa2 + (i * sa1) + (k * sa2);
							tr = ( Av[ p4 ] * wkR ) - ( Av[ p4 + 1 ] * wkI );
							ti = ( Av[ p4 ] * wkI ) + ( Av[ p4 + 1 ] * wkR );
							p4 = oa2 + (i * sa1) + (( k + 1 ) * sa2);
							tr += ( Av[ p4 ] * wkp1R ) - ( Av[ p4 + 1 ] * wkp1I );
							ti += ( Av[ p4 ] * wkp1I ) + ( Av[ p4 + 1 ] * wkp1R );
							Av[ p3 ] -= tr;
							Av[ p3 + 1 ] -= ti;
						}
						Av[ p1 ] = wkR;
						Av[ p1 + 1 ] = wkI;
						Av[ p2 ] = wkp1R;
						Av[ p2 + 1 ] = wkp1I;
					}
				}

				if ( kstep === 2 ) {
					p1 = oa2 + (( k + 1 ) * sa1) + (k * sa2);
					Ev[ oe2 + (k * se2) ] = Av[ p1 ];
					Ev[ oe2 + (k * se2) + 1 ] = Av[ p1 + 1 ];
					Ev[ oe2 + (( k + 1 ) * se2) ] = 0.0;
					Ev[ oe2 + (( k + 1 ) * se2) + 1 ] = 0.0;
					Av[ p1 ] = 0.0;
					Av[ p1 + 1 ] = 0.0;
				}
			}

			if ( kstep === 1 ) {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = kp;
			} else {
				IPIV[ offsetIPIV + (k * strideIPIV) ] = ~p;
				IPIV[ offsetIPIV + (( k + 1 ) * strideIPIV) ] = ~kp;
			}

			k += kstep;
		}
	}

	return info;
}


// EXPORTS //

export default zsytf2rk;
