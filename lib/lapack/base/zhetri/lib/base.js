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
import zdotc from '../../../../blas/base/zdotc/lib/base.js';
import zhemv from '../../../../blas/base/zhemv/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

var NCONE = new Complex128( -1.0, 0.0 );
var CZERO = new Complex128( 0.0, 0.0 );


// MAIN //

/**
* Computes the inverse of a complex Hermitian matrix using the factorization `A = U*D*U**H` or `A = L*D*L**H` computed by zhetrf.
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
* @param {Complex128Array} A - Hermitian matrix (overwritten with inverse)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Int32Array} IPIV - pivot indices from zhetrf
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
* var A = new Complex128Array( [ 4.0, 0.0 ] );
* var IPIV = new Int32Array( [ 0 ] );
* var WORK = new Complex128Array( 1 );
*
* var info = zhetri( 'upper', 1, A, 1, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
* // returns 0
*/
function zhetri( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	var akkp1R;
	var akkp1I;
	var kstep;
	var upper;
	var tempR;
	var tempI;
	var dotc;
	var info;
	var akp1;
	var sa1;
	var sa2;
	var Av;
	var oA;
	var ak;
	var kp;
	var ip;
	var p;
	var q;
	var d;
	var j;
	var k;
	var t;

	// All internal indices (k, kp) use 1-based Fortran convention.

	// Av is the Float64 reinterpretation; positions are 0-based Float64 indices.
	// A(i,j) in 1-based => Av[ oA + (i-1)*sa1 + (j-1)*sa2 ] (real part)

	Av = reinterpret( A, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;
	info = 0;
	upper = ( uplo === 'upper' );

	if ( N === 0 ) {
		return 0;
	}

	// Check that the diagonal of D is non-zero (singularity check)
	if ( upper ) {
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

	if ( upper ) {
		// Compute inv(A) from the factorization A = U*D*U**H
		k = 1;

		while ( k <= N ) {
			ip = IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
			if ( ip >= 0 ) {
				// 1x1 pivot block: invert diagonal
				// A(k,k) = 1.0 / real(A(k,k))
				p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				Av[ p ] = 1.0 / Av[ p ];
				Av[ p + 1 ] = 0.0;

				if ( k > 1 ) {
					// Copy column k (rows 1..k-1) to WORK
					zcopy( k - 1, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ), WORK, strideWork, offsetWork );

					// A(1..k-1, k) = -A * WORK (Hermitian matvec)
					zhemv( uplo, k - 1, NCONE, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork, CZERO, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ) );

					// A(k,k) -= real( conj(WORK) . A(1..k-1, k) )
					dotc = zdotc( k - 1, WORK, strideWork, offsetWork, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ) );
					Av[ p ] -= real( dotc );
				}
				kstep = 1;
			} else {
				// 2x2 pivot block
				// t = |A(k, k+1)| (complex modulus of off-diagonal)
				q = oA + ( ( k - 1 ) * sa1 ) + ( k * sa2 );
				t = cmplx.absAt( Av, q );

				// ak = real(A(k,k)) / t
				p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				ak = Av[ p ] / t;

				// akp1 = real(A(k+1,k+1)) / t
				q = oA + ( k * sa1 ) + ( k * sa2 );
				akp1 = Av[ q ] / t;

				// akkp1 = A(k, k+1) / t (complex)
				q = oA + ( ( k - 1 ) * sa1 ) + ( k * sa2 );
				akkp1R = Av[ q ] / t;
				akkp1I = Av[ q + 1 ] / t;

				// d = t * (ak * akp1 - 1)
				d = t * ( ( ak * akp1 ) - 1.0 );

				// Invert the 2x2 block
				p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				Av[ p ] = akp1 / d;
				Av[ p + 1 ] = 0.0;

				q = oA + ( k * sa1 ) + ( k * sa2 );
				Av[ q ] = ak / d;
				Av[ q + 1 ] = 0.0;

				q = oA + ( ( k - 1 ) * sa1 ) + ( k * sa2 );
				Av[ q ] = -akkp1R / d;
				Av[ q + 1 ] = -akkp1I / d;

				if ( k > 1 ) {
					// Process column k
					zcopy( k - 1, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ), WORK, strideWork, offsetWork );
					zhemv( uplo, k - 1, NCONE, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork, CZERO, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ) );

					p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
					dotc = zdotc( k - 1, WORK, strideWork, offsetWork, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ) );
					Av[ p ] -= real( dotc );

					// A(k, k+1) -= zdotc(A col k, A col k+1)
					dotc = zdotc( k - 1, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ), A, strideA1, offsetA + ( k * strideA2 ) );
					q = oA + ( ( k - 1 ) * sa1 ) + ( k * sa2 );
					Av[ q ] -= real( dotc );
					Av[ q + 1 ] -= imag( dotc );

					// Process column k+1
					zcopy( k - 1, A, strideA1, offsetA + ( k * strideA2 ), WORK, strideWork, offsetWork );
					zhemv( uplo, k - 1, NCONE, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork, CZERO, A, strideA1, offsetA + ( k * strideA2 ) );

					q = oA + ( k * sa1 ) + ( k * sa2 );
					dotc = zdotc( k - 1, WORK, strideWork, offsetWork, A, strideA1, offsetA + ( k * strideA2 ) );
					Av[ q ] -= real( dotc );
				}
				kstep = 2;
			}

			// Interchange rows and columns kp and k
			kp = ( ip >= 0 ) ? ip + 1 : ( ~ip ) + 1; // 0-based IPIV -> 1-based kp
			if ( kp !== k ) {
				// Swap elements 1..kp-1 of columns k and kp
				zswap( kp - 1, A, strideA1, offsetA + ( ( k - 1 ) * strideA2 ), A, strideA1, offsetA + ( ( kp - 1 ) * strideA2 ) );

				// Swap and conjugate elements between rows kp+1..k-1
				for ( j = kp + 1; j <= k - 1; j += 1 ) {
					// Temp = conj(A(j, k))
					p = oA + ( ( j - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
					q = oA + ( ( kp - 1 ) * sa1 ) + ( ( j - 1 ) * sa2 );
					tempR = Av[ p ];
					tempI = -Av[ p + 1 ];

					// A(j, k) = conj(A(kp, j))
					Av[ p ] = Av[ q ];
					Av[ p + 1 ] = -Av[ q + 1 ];

					// A(kp, j) = temp
					Av[ q ] = tempR;
					Av[ q + 1 ] = tempI;
				}

				// Conjugate A(kp, k)
				p = oA + ( ( kp - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				Av[ p + 1 ] = -Av[ p + 1 ];

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
		// Lower triangle: compute inv(A) from A = L*D*L**H
		k = N;

		while ( k >= 1 ) {
			ip = IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
			if ( ip >= 0 ) {
				// 1x1 pivot block: invert diagonal
				// A(k,k) = 1.0 / real(A(k,k))
				p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				Av[ p ] = 1.0 / Av[ p ];
				Av[ p + 1 ] = 0.0;

				if ( k < N ) {
					// Copy column k (rows k+1..N) to WORK
					zcopy( N - k, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ), WORK, strideWork, offsetWork );

					// A(k+1..N, k) = -A_trailing * WORK
					zhemv( uplo, N - k, NCONE, A, strideA1, strideA2, offsetA + ( k * strideA1 ) + ( k * strideA2 ), WORK, strideWork, offsetWork, CZERO, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ) );

					// A(k,k) -= real( conj(WORK) . A(k+1..N, k) )
					dotc = zdotc( N - k, WORK, strideWork, offsetWork, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ) );
					Av[ p ] -= real( dotc );
				}
				kstep = 1;
			} else {
				// 2x2 pivot block
				// t = |A(k, k-1)| (complex modulus of off-diagonal)
				q = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 );
				t = cmplx.absAt( Av, q );

				// ak = real(A(k-1, k-1)) / t
				p = oA + ( ( k - 2 ) * sa1 ) + ( ( k - 2 ) * sa2 );
				ak = Av[ p ] / t;

				// akp1 = real(A(k, k)) / t
				q = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				akp1 = Av[ q ] / t;

				// akkp1 = A(k, k-1) / t (complex)
				q = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 );
				akkp1R = Av[ q ] / t;
				akkp1I = Av[ q + 1 ] / t;

				// d = t * (ak * akp1 - 1)
				d = t * ( ( ak * akp1 ) - 1.0 );

				// Invert the 2x2 block
				p = oA + ( ( k - 2 ) * sa1 ) + ( ( k - 2 ) * sa2 );
				Av[ p ] = akp1 / d;
				Av[ p + 1 ] = 0.0;

				q = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				Av[ q ] = ak / d;
				Av[ q + 1 ] = 0.0;

				q = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 );
				Av[ q ] = -akkp1R / d;
				Av[ q + 1 ] = -akkp1I / d;

				if ( k < N ) {
					// Process column k
					zcopy( N - k, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ), WORK, strideWork, offsetWork );
					zhemv( uplo, N - k, NCONE, A, strideA1, strideA2, offsetA + ( k * strideA1 ) + ( k * strideA2 ), WORK, strideWork, offsetWork, CZERO, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ) );

					q = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
					dotc = zdotc( N - k, WORK, strideWork, offsetWork, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ) );
					Av[ q ] -= real( dotc );

					// A(k, k-1) -= zdotc(A col k, A col k-1)
					dotc = zdotc( N - k, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 1 ) * strideA2 ), A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 2 ) * strideA2 ) );
					q = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 2 ) * sa2 );
					Av[ q ] -= real( dotc );
					Av[ q + 1 ] -= imag( dotc );

					// Process column k-1
					zcopy( N - k, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 2 ) * strideA2 ), WORK, strideWork, offsetWork );
					zhemv( uplo, N - k, NCONE, A, strideA1, strideA2, offsetA + ( k * strideA1 ) + ( k * strideA2 ), WORK, strideWork, offsetWork, CZERO, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 2 ) * strideA2 ) );

					p = oA + ( ( k - 2 ) * sa1 ) + ( ( k - 2 ) * sa2 );
					dotc = zdotc( N - k, WORK, strideWork, offsetWork, A, strideA1, offsetA + ( k * strideA1 ) + ( ( k - 2 ) * strideA2 ) );
					Av[ p ] -= real( dotc );
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

				// Swap and conjugate elements between rows k+1..kp-1
				for ( j = k + 1; j <= kp - 1; j += 1 ) {
					// Temp = conj(A(j, k))
					p = oA + ( ( j - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
					q = oA + ( ( kp - 1 ) * sa1 ) + ( ( j - 1 ) * sa2 );
					tempR = Av[ p ];
					tempI = -Av[ p + 1 ];

					// A(j, k) = conj(A(kp, j))
					Av[ p ] = Av[ q ];
					Av[ p + 1 ] = -Av[ q + 1 ];

					// A(kp, j) = temp
					Av[ q ] = tempR;
					Av[ q + 1 ] = tempI;
				}

				// Conjugate A(kp, k)
				p = oA + ( ( kp - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				Av[ p + 1 ] = -Av[ p + 1 ];

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

export default zhetri;
