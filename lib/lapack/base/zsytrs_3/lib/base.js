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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zscal from './../../../../blas/base/zscal/lib/base.js';
import zswap from './../../../../blas/base/zswap/lib/base.js';
import ztrsm from './../../../../blas/base/ztrsm/lib/base.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );

// Module-level scratch values for complex-division output.
var cdR = 0.0;
var cdI = 0.0;


// FUNCTIONS //

/**
* Performs robust complex division `(ar+ai*i) / (br+bi*i)` using Smith's algorithm. The result is written to module-level scratch `cdR` and `cdI`.
*
* @private
* @param {number} ar - real part of numerator
* @param {number} ai - imaginary part of numerator
* @param {number} br - real part of denominator
* @param {number} bi - imaginary part of denominator
*/
function cDiv( ar, ai, br, bi ) {
	var r;
	var d;
	if ( Math.abs( bi ) <= Math.abs( br ) ) {
		r = bi / br;
		d = br + ( bi * r );
		cdR = ( ar + ( ai * r ) ) / d;
		cdI = ( ai - ( ar * r ) ) / d;
	} else {
		r = br / bi;
		d = bi + ( br * r );
		cdR = ( ( ar * r ) + ai ) / d;
		cdI = ( ( ai * r ) - ar ) / d;
	}
}


// MAIN //

/**
* Solves a system of linear equations `A*X = B` with a complex symmetric (NOT Hermitian) matrix `A` using the factorization `A = P*U*D*U^T*P^T` or `A = P*L*D*L^T*P^T` computed by `zsytrf_rk` (rook, bounded Bunch-Kaufman).
*
* The diagonal block matrix `D` has fully complex diagonal entries stored on the diagonal of `A`; complex super- (UPLO='upper') or sub- (UPLO='lower') diagonal entries that describe `2x2` pivot blocks live in `e`.
*
* IPIV uses the JS bitwise-NOT convention used by `zsytrf_rk`: positive 0-based indices for `1x1` pivot blocks, and `~kp` for `2x2` pivot blocks.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand side vectors
* @param {Complex128Array} A - factored matrix from `zsytrf_rk`
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} e - super- or sub-diagonal entries of the block diagonal matrix `D`
* @param {integer} strideE - stride length for `e` (in complex elements)
* @param {NonNegativeInteger} offsetE - starting index for `e` (in complex elements)
* @param {Int32Array} IPIV - pivot indices from `zsytrf_rk`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} B - input/output right-hand side / solution matrix
* @param {integer} strideB1 - stride of the first dimension of `B` (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
* @returns {integer} status code (0 = success)
*/
function zsytrs3( uplo, N, nrhs, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
	var akm1kR;
	var akm1kI;
	var denomR;
	var denomI;
	var akm1R;
	var akm1I;
	var bkm1R;
	var bkm1I;
	var dInv;
	var oeF;
	var oaF;
	var obF;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var akR;
	var akI;
	var bkR;
	var bkI;
	var raw;
	var Av;
	var Bv;
	var Ev;
	var p1;
	var p2;
	var pe;
	var kp;
	var tr;
	var ti;
	var i;
	var j;

	// Quick return.
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	// Float64-view strides (each complex element is two doubles wide).
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	oaF = offsetA * 2;
	obF = offsetB * 2;
	oeF = offsetE * 2;
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	Ev = reinterpret( e, 0 );

	if ( uplo === 'upper' ) {
		// Solve A*X = B, where A = P*U*D*U^T*P^T.

		// Apply P^T to B (k = N-1, ..., 0).
		for ( i = N - 1; i >= 0; i-- ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			kp = ( raw >= 0 ) ? raw : ~raw;
			if ( kp !== i ) {
				zswap( nrhs, B, strideB2, offsetB + ( i * strideB1 ), B, strideB2, offsetB + ( kp * strideB1 ) );
			}
		}

		// Compute (U \ P^T * B) -> B.
		ztrsm( 'left', 'upper', 'no-transpose', 'unit', N, nrhs, CONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );

		// Compute D \ B -> B.
		i = N - 1;
		while ( i >= 0 ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			if ( raw >= 0 ) {
				// 1x1 pivot block. Divide row i by A(i,i) (fully complex, NOT real).
				p1 = oaF + ( i * sa1 ) + ( i * sa2 );
				cDiv( 1.0, 0.0, Av[ p1 ], Av[ p1 + 1 ] );
				dInv = new Complex128( cdR, cdI );
				zscal( nrhs, dInv, B, strideB2, offsetB + ( i * strideB1 ) );
			} else if ( i > 0 ) {
				// 2x2 pivot block; consume rows i-1 and i.
				// AKM1K = e(i)
				pe = oeF + ( i * strideE * 2 );
				akm1kR = Ev[ pe ];
				akm1kI = Ev[ pe + 1 ];

				// AKM1 = A(i-1,i-1) / AKM1K   (symmetric: A(i-1,i-1) is fully complex)
				p2 = oaF + ( ( i - 1 ) * sa1 ) + ( ( i - 1 ) * sa2 );
				cDiv( Av[ p2 ], Av[ p2 + 1 ], akm1kR, akm1kI );
				akm1R = cdR;
				akm1I = cdI;

				// AK = A(i,i) / AKM1K   (no conjugation)
				p2 = oaF + ( i * sa1 ) + ( i * sa2 );
				cDiv( Av[ p2 ], Av[ p2 + 1 ], akm1kR, akm1kI );
				akR = cdR;
				akI = cdI;

				// DENOM = AKM1*AK - 1
				denomR = ( akm1R * akR ) - ( akm1I * akI ) - 1.0;
				denomI = ( akm1R * akI ) + ( akm1I * akR );

				for ( j = 0; j < nrhs; j++ ) {
					// BKM1 = B(i-1,j) / AKM1K
					p1 = obF + ( ( i - 1 ) * sb1 ) + ( j * sb2 );
					cDiv( Bv[ p1 ], Bv[ p1 + 1 ], akm1kR, akm1kI );
					bkm1R = cdR;
					bkm1I = cdI;

					// BK = B(i,j) / AKM1K   (no conjugation)
					p2 = obF + ( i * sb1 ) + ( j * sb2 );
					cDiv( Bv[ p2 ], Bv[ p2 + 1 ], akm1kR, akm1kI );
					bkR = cdR;
					bkI = cdI;

					// B(i-1,j) = (AK*BKM1 - BK) / DENOM
					tr = ( akR * bkm1R ) - ( akI * bkm1I ) - bkR;
					ti = ( akR * bkm1I ) + ( akI * bkm1R ) - bkI;
					cDiv( tr, ti, denomR, denomI );
					Bv[ p1 ] = cdR;
					Bv[ p1 + 1 ] = cdI;

					// B(i,j) = (AKM1*BK - BKM1) / DENOM
					tr = ( akm1R * bkR ) - ( akm1I * bkI ) - bkm1R;
					ti = ( akm1R * bkI ) + ( akm1I * bkR ) - bkm1I;
					cDiv( tr, ti, denomR, denomI );
					Bv[ p2 ] = cdR;
					Bv[ p2 + 1 ] = cdI;
				}
				i -= 1;
			}
			i -= 1;
		}

		// Compute (U^T \ B) -> B   (transpose, NOT conjugate-transpose).
		ztrsm( 'left', 'upper', 'transpose', 'unit', N, nrhs, CONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );

		// Apply P to B (k = 0, ..., N-1).
		for ( i = 0; i < N; i++ ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			kp = ( raw >= 0 ) ? raw : ~raw;
			if ( kp !== i ) {
				zswap( nrhs, B, strideB2, offsetB + ( i * strideB1 ), B, strideB2, offsetB + ( kp * strideB1 ) );
			}
		}
	} else {
		// Solve A*X = B, where A = P*L*D*L^T*P^T.

		// Apply P^T to B (k = 0, ..., N-1).
		for ( i = 0; i < N; i++ ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			kp = ( raw >= 0 ) ? raw : ~raw;
			if ( kp !== i ) {
				zswap( nrhs, B, strideB2, offsetB + ( i * strideB1 ), B, strideB2, offsetB + ( kp * strideB1 ) );
			}
		}

		// Compute (L \ P^T * B) -> B.
		ztrsm( 'left', 'lower', 'no-transpose', 'unit', N, nrhs, CONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );

		// Compute D \ B -> B.
		i = 0;
		while ( i < N ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			if ( raw >= 0 ) {
				// 1x1 pivot block. Divide row i by A(i,i).
				p1 = oaF + ( i * sa1 ) + ( i * sa2 );
				cDiv( 1.0, 0.0, Av[ p1 ], Av[ p1 + 1 ] );
				dInv = new Complex128( cdR, cdI );
				zscal( nrhs, dInv, B, strideB2, offsetB + ( i * strideB1 ) );
			} else if ( i < N - 1 ) {
				// 2x2 pivot block; consume rows i and i+1.
				// AKM1K = e(i)
				pe = oeF + ( i * strideE * 2 );
				akm1kR = Ev[ pe ];
				akm1kI = Ev[ pe + 1 ];

				// AKM1 = A(i,i) / AKM1K   (no conjugation)
				p2 = oaF + ( i * sa1 ) + ( i * sa2 );
				cDiv( Av[ p2 ], Av[ p2 + 1 ], akm1kR, akm1kI );
				akm1R = cdR;
				akm1I = cdI;

				// AK = A(i+1,i+1) / AKM1K
				p2 = oaF + ( ( i + 1 ) * sa1 ) + ( ( i + 1 ) * sa2 );
				cDiv( Av[ p2 ], Av[ p2 + 1 ], akm1kR, akm1kI );
				akR = cdR;
				akI = cdI;

				// DENOM = AKM1*AK - 1
				denomR = ( akm1R * akR ) - ( akm1I * akI ) - 1.0;
				denomI = ( akm1R * akI ) + ( akm1I * akR );

				for ( j = 0; j < nrhs; j++ ) {
					// BKM1 = B(i,j) / AKM1K   (no conjugation)
					p1 = obF + ( i * sb1 ) + ( j * sb2 );
					cDiv( Bv[ p1 ], Bv[ p1 + 1 ], akm1kR, akm1kI );
					bkm1R = cdR;
					bkm1I = cdI;

					// BK = B(i+1,j) / AKM1K
					p2 = obF + ( ( i + 1 ) * sb1 ) + ( j * sb2 );
					cDiv( Bv[ p2 ], Bv[ p2 + 1 ], akm1kR, akm1kI );
					bkR = cdR;
					bkI = cdI;

					// B(i,j) = (AK*BKM1 - BK) / DENOM
					tr = ( akR * bkm1R ) - ( akI * bkm1I ) - bkR;
					ti = ( akR * bkm1I ) + ( akI * bkm1R ) - bkI;
					cDiv( tr, ti, denomR, denomI );
					Bv[ p1 ] = cdR;
					Bv[ p1 + 1 ] = cdI;

					// B(i+1,j) = (AKM1*BK - BKM1) / DENOM
					tr = ( akm1R * bkR ) - ( akm1I * bkI ) - bkm1R;
					ti = ( akm1R * bkI ) + ( akm1I * bkR ) - bkm1I;
					cDiv( tr, ti, denomR, denomI );
					Bv[ p2 ] = cdR;
					Bv[ p2 + 1 ] = cdI;
				}
				i += 1;
			}
			i += 1;
		}

		// Compute (L^T \ B) -> B   (transpose, NOT conjugate-transpose).
		ztrsm( 'left', 'lower', 'transpose', 'unit', N, nrhs, CONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );

		// Apply P to B (k = N-1, ..., 0).
		for ( i = N - 1; i >= 0; i-- ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			kp = ( raw >= 0 ) ? raw : ~raw;
			if ( kp !== i ) {
				zswap( nrhs, B, strideB2, offsetB + ( i * strideB1 ), B, strideB2, offsetB + ( kp * strideB1 ) );
			}
		}
	}

	return 0;
}


// EXPORTS //

export default zsytrs3;
