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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
import ztrsm from '../../../../blas/base/ztrsm/lib/base.js';
import zsyconv from '../../zsyconv/lib/base.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );
var cdR = 0.0;
var cdI = 0.0;


// FUNCTIONS //

/**
* Complex division storing result in module-level cdR, cdI.
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
		d = br + (bi * r);
		cdR = ( ar + (ai * r) ) / d;
		cdI = ( ai - (ar * r) ) / d;
	} else {
		r = br / bi;
		d = bi + (br * r);
		cdR = ( (ar * r) + ai ) / d;
		cdI = ( (ai * r) - ar ) / d;
	}
}


// MAIN //

/**
* Solves A_X = B with a complex Hermitian matrix A using the factorization.
_ A = U_D_U^H or A = L_D*L^H computed by ZHETRF.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {integer} N - order of the matrix
* @param {integer} nrhs - number of right hand sides
* @param {Complex128Array} A - factored matrix from zhetrf
* @param {integer} strideA1 - first stride of A
* @param {integer} strideA2 - second stride of A
* @param {integer} offsetA - offset into A
* @param {Int32Array} IPIV - pivot indices from zhetrf
* @param {integer} strideIPIV - stride of IPIV
* @param {integer} offsetIPIV - offset into IPIV
* @param {Complex128Array} B - right hand side / solution matrix
* @param {integer} strideB1 - first stride of B
* @param {integer} strideB2 - second stride of B
* @param {integer} offsetB - offset into B
* @param {Complex128Array} WORK - workspace, length N
* @param {integer} strideWork - stride of WORK
* @param {integer} offsetWork - offset into WORK
* @returns {integer} info - 0 if successful
*/
function zhetrs2( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork ) {
	var akm1kR;
	var akm1kI;
	var denomR;
	var denomI;
	var akm1R;
	var akm1I;
	var akR;
	var akI;
	var bkm1R;
	var bkm1I;
	var bkR;
	var bkI;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var Av;
	var Bv;
	var Wv;
	var sw;
	var oA;
	var oB;
	var oW;
	var kp;
	var s;
	var i;
	var j;
	var k;
	var p1;
	var p2;

	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	Wv = reinterpret( WORK, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	sw = strideWork * 2;
	oA = offsetA * 2;
	oB = offsetB * 2;
	oW = offsetWork * 2;

	// Convert: extract off-diagonal of D into WORK, apply permutations
	zsyconv( uplo, 'convert', N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork );

	if ( uplo === 'upper' ) {
		// Apply row permutations: backward
		k = N - 1;
		while ( k >= 0 ) {
			if ( IPIV[ offsetIPIV + (k * strideIPIV) ] >= 0 ) {
				kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}
				k -= 1;
			} else {
				kp = ~IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp === ( ~IPIV[ offsetIPIV + (( k - 1 ) * strideIPIV) ] ) ) {
					zswap( nrhs, B, strideB2, offsetB + (( k - 1 ) * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}
				k -= 2;
			}
		}

		// Solve U*X = B
		ztrsm( 'left', 'upper', 'no-transpose', 'unit', N, nrhs, CONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );

		// Solve D*X = B
		i = N - 1;
		while ( i >= 0 ) {
			if ( IPIV[ offsetIPIV + (i * strideIPIV) ] >= 0 ) {
				s = 1.0 / Av[ oA + (i * sa1) + (i * sa2) ];
				zdscal( nrhs, s, B, strideB2, offsetB + (i * strideB1) );
			} else if ( i > 0 ) {
				if ( ( ~IPIV[ offsetIPIV + (( i - 1 ) * strideIPIV) ] ) === ( ~IPIV[ offsetIPIV + (i * strideIPIV) ] ) ) {
					akm1kR = Wv[ oW + (i * sw) ];
					akm1kI = Wv[ oW + (i * sw) + 1 ];

					cDiv( Av[ oA + (( i - 1 ) * sa1) + (( i - 1 ) * sa2) ], 0.0, akm1kR, akm1kI );
					akm1R = cdR;
					akm1I = cdI;

					cDiv( Av[ oA + (i * sa1) + (i * sa2) ], 0.0, akm1kR, -akm1kI );
					akR = cdR;
					akI = cdI;

					denomR = (akm1R * akR) - (akm1I * akI) - 1.0;
					denomI = (akm1R * akI) + (akm1I * akR);

					for ( j = 0; j < nrhs; j++ ) {
						p1 = oB + (( i - 1 ) * sb1) + (j * sb2);
						p2 = oB + (i * sb1) + (j * sb2);

						cDiv( Bv[ p1 ], Bv[ p1 + 1 ], akm1kR, akm1kI );
						bkm1R = cdR;
						bkm1I = cdI;

						cDiv( Bv[ p2 ], Bv[ p2 + 1 ], akm1kR, -akm1kI );
						bkR = cdR;
						bkI = cdI;

						cDiv( (akR * bkm1R) - (akI * bkm1I) - bkR, (akR * bkm1I) + (akI * bkm1R) - bkI, denomR, denomI );
						Bv[ p1 ] = cdR;
						Bv[ p1 + 1 ] = cdI;

						cDiv( (akm1R * bkR) - (akm1I * bkI) - bkm1R, (akm1R * bkI) + (akm1I * bkR) - bkm1I, denomR, denomI );
						Bv[ p2 ] = cdR;
						Bv[ p2 + 1 ] = cdI;
					}
					i -= 1;
				}
			}
			i -= 1;
		}

		// Solve U^H * X = B
		ztrsm( 'left', 'upper', 'conjugate-transpose', 'unit', N, nrhs, CONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );

		// Reverse permutations: forward
		k = 0;
		while ( k < N ) {
			if ( IPIV[ offsetIPIV + (k * strideIPIV) ] >= 0 ) {
				kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}
				k += 1;
			} else {
				kp = ~IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( k < N - 1 && kp === ( ~IPIV[ offsetIPIV + (( k + 1 ) * strideIPIV) ] ) ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}
				k += 2;
			}
		}
	} else {
		// Lower

		// Forward permutations
		k = 0;
		while ( k < N ) {
			if ( IPIV[ offsetIPIV + (k * strideIPIV) ] >= 0 ) {
				kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}
				k += 1;
			} else {
				kp = ~IPIV[ offsetIPIV + (( k + 1 ) * strideIPIV) ];
				if ( kp === ( ~IPIV[ offsetIPIV + (k * strideIPIV) ] ) ) {
					zswap( nrhs, B, strideB2, offsetB + (( k + 1 ) * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}
				k += 2;
			}
		}

		// Solve L*X = B
		ztrsm( 'left', 'lower', 'no-transpose', 'unit', N, nrhs, CONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );

		// Solve D*X = B
		i = 0;
		while ( i < N ) {
			if ( IPIV[ offsetIPIV + (i * strideIPIV) ] >= 0 ) {
				s = 1.0 / Av[ oA + (i * sa1) + (i * sa2) ];
				zdscal( nrhs, s, B, strideB2, offsetB + (i * strideB1) );
			} else {
				akm1kR = Wv[ oW + (i * sw) ];
				akm1kI = Wv[ oW + (i * sw) + 1 ];

				cDiv( Av[ oA + (i * sa1) + (i * sa2) ], 0.0, akm1kR, -akm1kI );
				akm1R = cdR;
				akm1I = cdI;

				cDiv( Av[ oA + (( i + 1 ) * sa1) + (( i + 1 ) * sa2) ], 0.0, akm1kR, akm1kI );
				akR = cdR;
				akI = cdI;

				denomR = (akm1R * akR) - (akm1I * akI) - 1.0;
				denomI = (akm1R * akI) + (akm1I * akR);

				for ( j = 0; j < nrhs; j++ ) {
					p1 = oB + (i * sb1) + (j * sb2);
					p2 = oB + (( i + 1 ) * sb1) + (j * sb2);

					cDiv( Bv[ p1 ], Bv[ p1 + 1 ], akm1kR, -akm1kI );
					bkm1R = cdR;
					bkm1I = cdI;

					cDiv( Bv[ p2 ], Bv[ p2 + 1 ], akm1kR, akm1kI );
					bkR = cdR;
					bkI = cdI;

					cDiv( (akR * bkm1R) - (akI * bkm1I) - bkR, (akR * bkm1I) + (akI * bkm1R) - bkI, denomR, denomI );
					Bv[ p1 ] = cdR;
					Bv[ p1 + 1 ] = cdI;

					cDiv( (akm1R * bkR) - (akm1I * bkI) - bkm1R, (akm1R * bkI) + (akm1I * bkR) - bkm1I, denomR, denomI );
					Bv[ p2 ] = cdR;
					Bv[ p2 + 1 ] = cdI;
				}
				i += 1;
			}
			i += 1;
		}

		// Solve L^H * X = B
		ztrsm( 'left', 'lower', 'conjugate-transpose', 'unit', N, nrhs, CONE, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB );

		// Reverse permutations: backward
		k = N - 1;
		while ( k >= 0 ) {
			if ( IPIV[ offsetIPIV + (k * strideIPIV) ] >= 0 ) {
				kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}
				k -= 1;
			} else {
				kp = ~IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( k > 0 && kp === ( ~IPIV[ offsetIPIV + (( k - 1 ) * strideIPIV) ] ) ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}
				k -= 2;
			}
		}
	}

	// Revert zsyconv
	zsyconv( uplo, 'revert', N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork );

	return 0;
}


// EXPORTS //

export default zhetrs2;
