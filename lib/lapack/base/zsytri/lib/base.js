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

/* eslint-disable max-depth, max-statements, max-lines-per-function, max-len, max-lines */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zdotu from '../../../../blas/base/zdotu/lib/base.js';
import zsymv from '../../../../lapack/base/zsymv/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';


// VARIABLES //

var NCONE = new Complex128( -1.0, 0.0 );
var CZERO = new Complex128( 0.0, 0.0 );

// Module-level temporaries for complex division results (avoids allocation):
var cdivR = 0.0;
var cdivI = 0.0;


// FUNCTIONS //

/**
* Performs complex division, storing the result of `(aR + aI*i) / (bR + bI*i)` in module-level variables `cdivR` and `cdivI`.
*
* ## Notes
*
* -   Uses Smith's formula for numerical stability.
*
* @private
* @param {number} aR - real part of the numerator
* @param {number} aI - imaginary part of the numerator
* @param {number} bR - real part of the denominator
* @param {number} bI - imaginary part of the denominator
*/
function cdivTo( aR, aI, bR, bI ) {
	var r;
	var d;
	if ( Math.abs( bI ) <= Math.abs( bR ) ) {
		r = bI / bR;
		d = bR + ( bI * r );
		cdivR = ( aR + ( aI * r ) ) / d;
		cdivI = ( aI - ( aR * r ) ) / d;
	} else {
		r = bR / bI;
		d = bI + ( bR * r );
		cdivR = ( ( aR * r ) + aI ) / d;
		cdivI = ( ( aI * r ) - aR ) / d;
	}
}

/**
* Performs complex division in-place, storing the result of `(aR + aI*i) / (bR + bI*i)` into `out[idx]` and `out[idx+1]`.
*
* @private
* @param {Float64Array} out - output array
* @param {NonNegativeInteger} idx - Float64 index of the real part
* @param {number} aR - real part of the numerator
* @param {number} aI - imaginary part of the numerator
* @param {number} bR - real part of the denominator
* @param {number} bI - imaginary part of the denominator
*/
function cdivInPlace( out, idx, aR, aI, bR, bI ) {
	cdivTo( aR, aI, bR, bI );
	out[ idx ] = cdivR;
	out[ idx + 1 ] = cdivI;
}


// MAIN //

/**
* Computes the inverse of a complex symmetric matrix using the factorization `A = U*D*U**T` or `A = L*D*L**T` computed by zsytrf.
*
* ## Notes
*
* -   IPIV is 0-based. Negative values encode 2x2 pivot blocks via bitwise NOT (`~p`).
* -   A is a Complex128Array representing an N-by-N matrix in 2D storage.
* -   WORK is a Complex128Array of length `N`.
* -   Returns INFO: 0 = success, k > 0 = `D(k,k)` is zero (1-based).
*
* @private
* @param {string} uplo - specifies whether upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - symmetric matrix (overwritten with inverse)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Int32Array} IPIV - pivot indices from zsytrf
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} WORK - workspace array of length `N`
* @param {integer} strideWork - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @returns {integer} status code (0 = success)
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Int32Array = require( '@stdlib/array/int32' );
*
* var A = new Complex128Array( [ 4.0, 1.0 ] );
* var IPIV = new Int32Array( [ 0 ] );
* var WORK = new Complex128Array( 1 );
*
* var info = zsytri( 'upper', 1, A, 1, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
* // returns 0
*/
function zsytri( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	var akkp1R;
	var akkp1I;
	var kstep;
	var tempR;
	var tempI;
	var akp1R;
	var akp1I;
	var dotu;
	var info;
	var sa1;
	var sa2;
	var akR;
	var akI;
	var Av;
	var oA;
	var tR;
	var tI;
	var dR;
	var dI;
	var ip;
	var kp;
	var p;
	var q;
	var k;

	// All internal indices (k, kp) use 1-based Fortran convention.

	// Av is the Float64 reinterpretation; positions are 0-based Float64 indices.
	// A(i,j) in 1-based => Av[ oA + (i-1)*sa1 + (j-1)*sa2 ] (real part)

	Av = reinterpret( A, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;
	info = 0;

	if ( N === 0 ) {
		return 0;
	}

	// Check that the diagonal of D is non-zero (singularity check)...
	if ( uplo === 'upper' ) {
		for ( info = N; info >= 1; info -= 1 ) {
			ip = IPIV[ offsetIPIV + ( ( info - 1 ) * strideIPIV ) ];
			p = oA + ( ( info - 1 ) * sa1 ) + ( ( info - 1 ) * sa2 );
			if ( ip >= 0 && Av[ p ] === 0.0 && Av[ p + 1 ] === 0.0 ) {
				return info;
			}
		}
	} else {
		for ( info = 1; info <= N; info += 1 ) {
			ip = IPIV[ offsetIPIV + ( ( info - 1 ) * strideIPIV ) ];
			p = oA + ( ( info - 1 ) * sa1 ) + ( ( info - 1 ) * sa2 );
			if ( ip >= 0 && Av[ p ] === 0.0 && Av[ p + 1 ] === 0.0 ) {
				return info;
			}
		}
	}
	info = 0;

	if ( uplo === 'upper' ) {
		// Compute inv(A) from the factorization A = U*D*U**T
		k = 1;

		while ( k <= N ) {
			ip = IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
			if ( ip >= 0 ) {
				// 1x1 pivot block: A(k,k) = ONE / A(k,k) (complex division)
				p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				cdivInPlace( Av, p, 1.0, 0.0, Av[ p ], Av[ p + 1 ] );

				if ( k > 1 ) {
					// Copy column k (rows 1..k-1) to WORK
					zcopy( k - 1, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ), WORK, strideWork, offsetWork );

					// A(1..k-1, k) = -A * WORK (symmetric matvec)
					zsymv( uplo, k - 1, NCONE, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork, CZERO, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ) );

					// A(k,k) -= zdotu(WORK, A(1..k-1,k)) (full complex subtraction)
					dotu = zdotu( k - 1, WORK, strideWork, offsetWork, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ) );
					Av[ p ] -= real( dotu );
					Av[ p + 1 ] -= imag( dotu );
				}
				kstep = 1;
			} else {
				// 2x2 pivot block: T = A(k, k+1) (fully complex)
				q = oA + ( ( k - 1 ) * sa1 ) + ( k * sa2 );
				tR = Av[ q ];
				tI = Av[ q + 1 ];

				// AK = A(k,k) / T (complex division)
				p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				cdivTo( Av[ p ], Av[ p + 1 ], tR, tI );
				akR = cdivR;
				akI = cdivI;

				// AKP1 = A(k+1,k+1) / T
				q = oA + ( k * sa1 ) + ( k * sa2 );
				cdivTo( Av[ q ], Av[ q + 1 ], tR, tI );
				akp1R = cdivR;
				akp1I = cdivI;

				// AKKP1 = A(k,k+1) / T
				q = oA + ( ( k - 1 ) * sa1 ) + ( k * sa2 );
				cdivTo( Av[ q ], Av[ q + 1 ], tR, tI );
				akkp1R = cdivR;
				akkp1I = cdivI;

				// D = T * (AK*AKP1 - ONE): complex multiply, subtract one, multiply by T
				tempR = ( akR * akp1R ) - ( akI * akp1I );
				tempI = ( akR * akp1I ) + ( akI * akp1R );
				tempR -= 1.0;
				dR = ( tR * tempR ) - ( tI * tempI );
				dI = ( tR * tempI ) + ( tI * tempR );

				// A(k,k) = AKP1 / D
				p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				cdivTo( akp1R, akp1I, dR, dI );
				Av[ p ] = cdivR;
				Av[ p + 1 ] = cdivI;

				// A(k+1,k+1) = AK / D
				q = oA + ( k * sa1 ) + ( k * sa2 );
				cdivTo( akR, akI, dR, dI );
				Av[ q ] = cdivR;
				Av[ q + 1 ] = cdivI;

				// A(k,k+1) = -AKKP1 / D
				q = oA + ( ( k - 1 ) * sa1 ) + ( k * sa2 );
				cdivTo( -akkp1R, -akkp1I, dR, dI );
				Av[ q ] = cdivR;
				Av[ q + 1 ] = cdivI;

				if ( k > 1 ) {
					// Process column k
					zcopy( k - 1, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ), WORK, strideWork, offsetWork );
					zsymv( uplo, k - 1, NCONE, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork, CZERO, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ) );

					p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
					dotu = zdotu( k - 1, WORK, strideWork, offsetWork, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ) );
					Av[ p ] -= real( dotu );
					Av[ p + 1 ] -= imag( dotu );

					// A(k, k+1) -= zdotu(A col k, A col k+1)
					dotu = zdotu( k - 1, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ), A, strideA1, offsetA + ( k * strideA2 ) );
					q = oA + ( ( k - 1 ) * sa1 ) + ( k * sa2 );
					Av[ q ] -= real( dotu );
					Av[ q + 1 ] -= imag( dotu );

					// Process column k+1
					zcopy( k - 1, A, strideA1, offsetA + ( k * strideA2 ), WORK, strideWork, offsetWork );
					zsymv( uplo, k - 1, NCONE, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork, CZERO, A, strideA1, offsetA + ( k * strideA2 ) );

					q = oA + ( k * sa1 ) + ( k * sa2 );
					dotu = zdotu( k - 1, WORK, strideWork, offsetWork, A, strideA1, offsetA + ( k * strideA2 ) );
					Av[ q ] -= real( dotu );
					Av[ q + 1 ] -= imag( dotu );
				}
				kstep = 2;
			}

			// Interchange rows and columns kp and k
			kp = ( ip >= 0 ) ? ip + 1 : ( ~ip ) + 1; // 0-based IPIV -> 1-based kp
			if ( kp !== k ) {
				// Swap elements 1..kp-1 of columns k and kp
				zswap( kp - 1, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ), A, strideA1, offsetA + ( ( kp - 1 ) * strideA2 ) );

				// Swap elements kp+1..k-1 of column k with row kp (symmetric, no conjugation)
				zswap( k - kp - 1, A, strideA1, offsetA + ( kp * strideA1 ) + ( ( k - 1 ) * strideA2 ), A, strideA2, offsetA + ( ( kp - 1 ) * strideA1 ) + ( kp * strideA2 ) );

				// Swap diagonal elements A(k,k) <-> A(kp,kp)
				p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				q = oA + ( ( kp - 1 ) * sa1 ) + ( ( kp - 1 ) * sa2 );
				tempR = Av[ p ];
				tempI = Av[ p + 1 ];
				Av[ p ] = Av[ q ];
				Av[ p + 1 ] = Av[ q + 1 ];
				Av[ q ] = tempR;
				Av[ q + 1 ] = tempI;

				if ( kstep === 2 ) {
					// Swap A(k, k+1) <-> A(kp, k+1)
					p = oA + ( ( k - 1 ) * sa1 ) + ( k * sa2 );
					q = oA + ( ( kp - 1 ) * sa1 ) + ( k * sa2 );
					tempR = Av[ p ];
					tempI = Av[ p + 1 ];
					Av[ p ] = Av[ q ];
					Av[ p + 1 ] = Av[ q + 1 ];
					Av[ q ] = tempR;
					Av[ q + 1 ] = tempI;
				}
			}

			k += kstep;
		}
	} else {
		// Lower triangle: compute inv(A) from A = L*D*L**T
		k = N;

		while ( k >= 1 ) {
			ip = IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
			if ( ip >= 0 ) {
				// 1x1 pivot block: A(k,k) = ONE / A(k,k) (complex division)
				p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				cdivInPlace( Av, p, 1.0, 0.0, Av[ p ], Av[ p + 1 ] );

				if ( k < N ) {
					// Copy column k (rows k+1..N) to WORK
					zcopy( N - k, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ), WORK, strideWork, offsetWork );

					// A(k+1..N, k) = -A_trailing * WORK
					zsymv( uplo, N - k, NCONE, A, strideA1, strideA2, offsetA + ( k * strideA1 ) + ( k * strideA2 ), WORK, strideWork, offsetWork, CZERO, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ) );

					// A(k,k) -= zdotu(WORK, A(k+1..N,k))
					dotu = zdotu( N - k, WORK, strideWork, offsetWork, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ) );
					Av[ p ] -= real( dotu );
					Av[ p + 1 ] -= imag( dotu );
				}
				kstep = 1;
			} else {
				// 2x2 pivot block: T = A(k, k-1) (fully complex)
				q = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 );
				tR = Av[ q ];
				tI = Av[ q + 1 ];

				// AK = A(k-1, k-1) / T
				p = oA + ( ( k - 2 ) * sa1 ) + ( ( k - 2 ) * sa2 );
				cdivTo( Av[ p ], Av[ p + 1 ], tR, tI );
				akR = cdivR;
				akI = cdivI;

				// AKP1 = A(k, k) / T
				q = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				cdivTo( Av[ q ], Av[ q + 1 ], tR, tI );
				akp1R = cdivR;
				akp1I = cdivI;

				// AKKP1 = A(k, k-1) / T
				q = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 );
				cdivTo( Av[ q ], Av[ q + 1 ], tR, tI );
				akkp1R = cdivR;
				akkp1I = cdivI;

				// D = T * (AK*AKP1 - ONE)
				tempR = ( akR * akp1R ) - ( akI * akp1I );
				tempI = ( akR * akp1I ) + ( akI * akp1R );
				tempR -= 1.0;
				dR = ( tR * tempR ) - ( tI * tempI );
				dI = ( tR * tempI ) + ( tI * tempR );

				// A(k-1,k-1) = AKP1 / D
				p = oA + ( ( k - 2 ) * sa1 ) + ( ( k - 2 ) * sa2 );
				cdivTo( akp1R, akp1I, dR, dI );
				Av[ p ] = cdivR;
				Av[ p + 1 ] = cdivI;

				// A(k,k) = AK / D
				q = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				cdivTo( akR, akI, dR, dI );
				Av[ q ] = cdivR;
				Av[ q + 1 ] = cdivI;

				// A(k,k-1) = -AKKP1 / D
				q = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 );
				cdivTo( -akkp1R, -akkp1I, dR, dI );
				Av[ q ] = cdivR;
				Av[ q + 1 ] = cdivI;

				if ( k < N ) {
					// Process column k
					zcopy( N - k, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ), WORK, strideWork, offsetWork );
					zsymv( uplo, N - k, NCONE, A, strideA1, strideA2, offsetA + ( k * strideA1 ) + ( k * strideA2 ), WORK, strideWork, offsetWork, CZERO, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ) );

					q = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
					dotu = zdotu( N - k, WORK, strideWork, offsetWork, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ) );
					Av[ q ] -= real( dotu );
					Av[ q + 1 ] -= imag( dotu );

					// A(k, k-1) -= zdotu(A col k, A col k-1)
					dotu = zdotu( N - k, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ), A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 2 ) * strideA2 ) );
					q = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 );
					Av[ q ] -= real( dotu );
					Av[ q + 1 ] -= imag( dotu );

					// Process column k-1
					zcopy( N - k, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 2 ) * strideA2 ), WORK, strideWork, offsetWork );
					zsymv( uplo, N - k, NCONE, A, strideA1, strideA2, offsetA + ( k * strideA1 ) + ( k * strideA2 ), WORK, strideWork, offsetWork, CZERO, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 2 ) * strideA2 ) );

					p = oA + ( ( k - 2 ) * sa1 ) + ( ( k - 2 ) * sa2 );
					dotu = zdotu( N - k, WORK, strideWork, offsetWork, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 2 ) * strideA2 ) );
					Av[ p ] -= real( dotu );
					Av[ p + 1 ] -= imag( dotu );
				}
				kstep = 2;
			}

			// Interchange rows and columns kp and k
			kp = ( ip >= 0 ) ? ip + 1 : ( ~ip ) + 1; // 0-based IPIV -> 1-based kp
			if ( kp !== k ) {
				// Swap elements after row kp (rows kp+1..N of columns k and kp)
				if ( kp < N ) {
					zswap( N - kp, A, strideA1, offsetA + ( kp * strideA1 ) + ( ( k - 1 ) * strideA2 ), A, strideA1, offsetA + ( kp * strideA1 ) + ( ( kp - 1 ) * strideA2 ) );
				}

				// Swap elements k+1..kp-1 of column k with row kp (symmetric, no conjugation)
				zswap( kp - k - 1, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ), A, strideA2, offsetA + ( ( kp - 1 ) * strideA1 ) + ( k * strideA2 ) );

				// Swap diagonal elements A(k,k) <-> A(kp,kp)
				p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				q = oA + ( ( kp - 1 ) * sa1 ) + ( ( kp - 1 ) * sa2 );
				tempR = Av[ p ];
				tempI = Av[ p + 1 ];
				Av[ p ] = Av[ q ];
				Av[ p + 1 ] = Av[ q + 1 ];
				Av[ q ] = tempR;
				Av[ q + 1 ] = tempI;

				if ( kstep === 2 ) {
					// Swap A(k, k-1) <-> A(kp, k-1)
					p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 );
					q = oA + ( ( kp - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 );
					tempR = Av[ p ];
					tempI = Av[ p + 1 ];
					Av[ p ] = Av[ q ];
					Av[ p + 1 ] = Av[ q + 1 ];
					Av[ q ] = tempR;
					Av[ q + 1 ] = tempI;
				}
			}

			k -= kstep;
		}
	}

	return info;
}


// EXPORTS //

export default zsytri;
