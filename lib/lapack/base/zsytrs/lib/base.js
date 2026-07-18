/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zgeru from '../../../../blas/base/zgeru/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
const CONE = new Complex128( 1.0, 0.0 );
const NCONE = new Complex128( -1.0, 0.0 );

/**
* Real part of complex division result.
*
* @private
* @type {number}
*/
let cdR = 0.0;

/**
* Imaginary part of complex division result.
*
* @private
* @type {number}
*/
let cdI = 0.0;

/**
* Perform complex division, storing result in module-level cdR and cdI.
*
* @private
* @param {number} ar - real part of numerator
* @param {number} ai - imaginary part of numerator
* @param {number} br - real part of denominator
* @param {number} bi - imaginary part of denominator
*/
function cDiv( ar, ai, br, bi ) {
	let r, d;
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
/**
* Solve a system of linear equations A*X = B with a complex symmetric matrix using Bunch-Kaufman factorization.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'` indicating upper or lower triangular storage
* @param {integer} N - order of the matrix
* @param {integer} nrhs - number of right-hand sides
* @param {Complex128Array} A - factored matrix from zsytrf
* @param {integer} strideA1 - first stride of A
* @param {integer} strideA2 - second stride of A
* @param {integer} offsetA - offset into A
* @param {Int32Array} IPIV - pivot indices from zsytrf
* @param {integer} strideIPIV - stride of IPIV
* @param {integer} offsetIPIV - offset into IPIV
* @param {Complex128Array} B - input/output right-hand side matrix
* @param {integer} strideB1 - first stride of B
* @param {integer} strideB2 - second stride of B
* @param {integer} offsetB - offset into B
* @returns {integer} info value
*/
function zsytrs( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
	let denomR, denomI, akm1kR, akm1kI, akm1R, akm1I, bkm1R, bkm1I, akR, akI;
	let bkR, bkI, kp, tr, ti, p1, p2, k, j;
	const sa1 = strideA1 * 2;
	const sa2 = strideA2 * 2;
	const sb1 = strideB1 * 2;
	const sb2 = strideB2 * 2;
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}
	if ( uplo === 'upper' ) {
		k = N - 1;
		while ( k >= 0 ) {
			if ( IPIV[ offsetIPIV + (k * strideIPIV) ] >= 0 ) {
				kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}
				if ( k > 0 ) {
					zgeru( k, nrhs, NCONE, A, strideA1, offsetA + (k * strideA2), B, strideB2, offsetB + (k * strideB1), B, strideB1, strideB2, offsetB );
				}
				p1 = (offsetA * 2) + (k * sa1) + (k * sa2);
				tr = Av[ p1 ];
				ti = Av[ p1 + 1 ];
				cDiv( 1.0, 0.0, tr, ti );
				zscal( nrhs, new Complex128( cdR, cdI ), B, strideB2, offsetB + (k * strideB1) );
				k -= 1;
			} else {
				kp = ~IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k - 1 ) {
					zswap( nrhs, B, strideB2, offsetB + (( k - 1 ) * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}
				if ( k > 1 ) {
					zgeru( k - 1, nrhs, NCONE, A, strideA1, offsetA + (k * strideA2), B, strideB2, offsetB + (k * strideB1), B, strideB1, strideB2, offsetB );
					zgeru( k - 1, nrhs, NCONE, A, strideA1, offsetA + (( k - 1 ) * strideA2), B, strideB2, offsetB + (( k - 1 ) * strideB1), B, strideB1, strideB2, offsetB );
				}
				p1 = (offsetA * 2) + (( k - 1 ) * sa1) + (k * sa2);
				akm1kR = Av[ p1 ];
				akm1kI = Av[ p1 + 1 ];
				p2 = (offsetA * 2) + (( k - 1 ) * sa1) + (( k - 1 ) * sa2);
				cDiv( Av[ p2 ], Av[ p2 + 1 ], akm1kR, akm1kI );
				akm1R = cdR;
				akm1I = cdI;
				p2 = (offsetA * 2) + (k * sa1) + (k * sa2);
				cDiv( Av[ p2 ], Av[ p2 + 1 ], akm1kR, akm1kI );
				akR = cdR;
				akI = cdI;
				denomR = (akm1R * akR) - (akm1I * akI) - 1.0;
				denomI = (akm1R * akI) + (akm1I * akR);
				for ( j = 0; j < nrhs; j++ ) {
					p1 = (offsetB * 2) + (( k - 1 ) * sb1) + (j * sb2);
					cDiv( Bv[ p1 ], Bv[ p1 + 1 ], akm1kR, akm1kI );
					bkm1R = cdR;
					bkm1I = cdI;
					p2 = (offsetB * 2) + (k * sb1) + (j * sb2);
					cDiv( Bv[ p2 ], Bv[ p2 + 1 ], akm1kR, akm1kI );
					bkR = cdR;
					bkI = cdI;
					tr = (akR * bkm1R) - (akI * bkm1I) - bkR;
					ti = (akR * bkm1I) + (akI * bkm1R) - bkI;
					cDiv( tr, ti, denomR, denomI );
					Bv[ p1 ] = cdR;
					Bv[ p1 + 1 ] = cdI;
					tr = (akm1R * bkR) - (akm1I * bkI) - bkm1R;
					ti = (akm1R * bkI) + (akm1I * bkR) - bkm1I;
					cDiv( tr, ti, denomR, denomI );
					Bv[ p2 ] = cdR;
					Bv[ p2 + 1 ] = cdI;
				}
				k -= 2;
			}
		}
		k = 0;
		while ( k < N ) {
			if ( IPIV[ offsetIPIV + (k * strideIPIV) ] >= 0 ) {
				if ( k > 0 ) {
					zgemv( 'transpose', k, nrhs, NCONE, B, strideB1, strideB2, offsetB, A, strideA1, offsetA + (k * strideA2), CONE, B, strideB2, offsetB + (k * strideB1) );
				}
				kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}
				k += 1;
			} else {
				if ( k > 0 ) {
					zgemv( 'transpose', k, nrhs, NCONE, B, strideB1, strideB2, offsetB, A, strideA1, offsetA + (k * strideA2), CONE, B, strideB2, offsetB + (k * strideB1) );
					zgemv( 'transpose', k, nrhs, NCONE, B, strideB1, strideB2, offsetB, A, strideA1, offsetA + (( k + 1 ) * strideA2), CONE, B, strideB2, offsetB + (( k + 1 ) * strideB1) );
				}
				kp = ~IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}
				k += 2;
			}
		}
	} else {
		k = 0;
		while ( k < N ) {
			if ( IPIV[ offsetIPIV + (k * strideIPIV) ] >= 0 ) {
				kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}
				if ( k < N - 1 ) {
					zgeru( N - k - 1, nrhs, NCONE, A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2), B, strideB2, offsetB + (k * strideB1), B, strideB1, strideB2, offsetB + (( k + 1 ) * strideB1) );
				}
				p1 = (offsetA * 2) + (k * sa1) + (k * sa2);
				cDiv( 1.0, 0.0, Av[ p1 ], Av[ p1 + 1 ] );
				zscal( nrhs, new Complex128( cdR, cdI ), B, strideB2, offsetB + (k * strideB1) );
				k += 1;
			} else {
				kp = ~IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k + 1 ) {
					zswap( nrhs, B, strideB2, offsetB + (( k + 1 ) * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}
				if ( k < N - 2 ) {
					zgeru( N - k - 2, nrhs, NCONE, A, strideA1, offsetA + (( k + 2 ) * strideA1) + (k * strideA2), B, strideB2, offsetB + (k * strideB1), B, strideB1, strideB2, offsetB + (( k + 2 ) * strideB1) );
					zgeru( N - k - 2, nrhs, NCONE, A, strideA1, offsetA + (( k + 2 ) * strideA1) + (( k + 1 ) * strideA2), B, strideB2, offsetB + (( k + 1 ) * strideB1), B, strideB1, strideB2, offsetB + (( k + 2 ) * strideB1) );
				}
				p1 = (offsetA * 2) + (( k + 1 ) * sa1) + (k * sa2);
				akm1kR = Av[ p1 ];
				akm1kI = Av[ p1 + 1 ];
				p2 = (offsetA * 2) + (k * sa1) + (k * sa2);
				cDiv( Av[ p2 ], Av[ p2 + 1 ], akm1kR, akm1kI );
				akm1R = cdR;
				akm1I = cdI;
				p2 = (offsetA * 2) + (( k + 1 ) * sa1) + (( k + 1 ) * sa2);
				cDiv( Av[ p2 ], Av[ p2 + 1 ], akm1kR, akm1kI );
				akR = cdR;
				akI = cdI;
				denomR = (akm1R * akR) - (akm1I * akI) - 1.0;
				denomI = (akm1R * akI) + (akm1I * akR);
				for ( j = 0; j < nrhs; j++ ) {
					p1 = (offsetB * 2) + (k * sb1) + (j * sb2);
					cDiv( Bv[ p1 ], Bv[ p1 + 1 ], akm1kR, akm1kI );
					bkm1R = cdR;
					bkm1I = cdI;
					p2 = (offsetB * 2) + (( k + 1 ) * sb1) + (j * sb2);
					cDiv( Bv[ p2 ], Bv[ p2 + 1 ], akm1kR, akm1kI );
					bkR = cdR;
					bkI = cdI;
					tr = (akR * bkm1R) - (akI * bkm1I) - bkR;
					ti = (akR * bkm1I) + (akI * bkm1R) - bkI;
					cDiv( tr, ti, denomR, denomI );
					Bv[ p1 ] = cdR;
					Bv[ p1 + 1 ] = cdI;
					tr = (akm1R * bkR) - (akm1I * bkI) - bkm1R;
					ti = (akm1R * bkI) + (akm1I * bkR) - bkm1I;
					cDiv( tr, ti, denomR, denomI );
					Bv[ p2 ] = cdR;
					Bv[ p2 + 1 ] = cdI;
				}
				k += 2;
			}
		}
		k = N - 1;
		while ( k >= 0 ) {
			if ( IPIV[ offsetIPIV + (k * strideIPIV) ] >= 0 ) {
				if ( k < N - 1 ) {
					zgemv( 'transpose', N - k - 1, nrhs, NCONE, B, strideB1, strideB2, offsetB + (( k + 1 ) * strideB1), A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2), CONE, B, strideB2, offsetB + (k * strideB1) );
				}
				kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}
				k -= 1;
			} else {
				if ( k < N - 1 ) {
					zgemv( 'transpose', N - k - 1, nrhs, NCONE, B, strideB1, strideB2, offsetB + (( k + 1 ) * strideB1), A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2), CONE, B, strideB2, offsetB + (k * strideB1) );
					zgemv( 'transpose', N - k - 1, nrhs, NCONE, B, strideB1, strideB2, offsetB + (( k + 1 ) * strideB1), A, strideA1, offsetA + (( k + 1 ) * strideA1) + (( k - 1 ) * strideA2), CONE, B, strideB2, offsetB + (( k - 1 ) * strideB1) );
				}
				kp = ~IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}
				k -= 2;
			}
		}
	}
	return 0;
}
export default zsytrs;
