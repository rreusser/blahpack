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

/* eslint-disable max-len, max-params, max-statements, camelcase */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgetrs from '../../zgetrs/lib/base.js';
import zlacn2 from '../../zlacn2/lib/base.js';


// MAIN //

/**
* Estimates the infinity norm condition number for a general complex matrix with inverse-c scaling.
*
* Uses a `zlacn2` reverse communication loop with `zgetrs` solves to estimate
* `|| op(A) * inv(diag(C)) ||_inf * || (op(A) * inv(diag(C)))^{-1} ||_inf`.
*
* ## Notes
*
* -   `WORK` must have length at least `2*N` complex elements.
* -   `RWORK` must have length at least `N`.
* -   `A` and `AF` are `Complex128Array` views; `C` and `RWORK` are `Float64Array`.
* -   When `capply` is `true`, `C` is applied as inverse scaling (`inv(diag(C))`); otherwise `C` is ignored.
*
* @private
* @param {string} trans - specifies the operation type (`'no-transpose'` or `'conjugate-transpose'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - original N-by-N matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} AF - LU-factored N-by-N matrix (from zgetrf)
* @param {integer} strideAF1 - stride of the first dimension of `AF`
* @param {integer} strideAF2 - stride of the second dimension of `AF`
* @param {NonNegativeInteger} offsetAF - starting index for `AF`
* @param {Int32Array} IPIV - pivot indices from zgetrf (0-based)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Float64Array} c - real scaling vector of length `N`
* @param {integer} strideC - stride length for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {boolean} capply - if `true`, apply inverse column scaling by `C`
* @param {Complex128Array} WORK - complex workspace of length at least `2*N`
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Float64Array} RWORK - real workspace of length at least `N`
* @param {integer} strideRWork - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @returns {number} estimated reciprocal infinity-norm condition number
*/
function zla_gercond_c( trans, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, c, strideC, offsetC, capply, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) { // eslint-disable-line max-len
	var notrans;
	var ainvnm;
	var WORKv;
	var ISAVE;
	var anorm;
	var KASE;
	var EST;
	var sa1;
	var sa2;
	var tmp;
	var Av;
	var sw;
	var oA;
	var oW;
	var ir;
	var ic;
	var i;
	var j;

	if ( N === 0 ) {
		return 1.0;
	}

	notrans = ( trans === 'no-transpose' );

	// Reinterpret complex arrays as Float64 views for element access
	Av = reinterpret( A, 0 );
	WORKv = reinterpret( WORK, 0 );

	// Double-based strides/offsets
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sw = strideWork * 2;
	oA = offsetA * 2;
	oW = offsetWork * 2;

	// Compute the row-wise sum of CABS1 entries of the scaled matrix

	// RWORK[i] = sum_j |A(i,j)| [ / C(j) if capply ]    (for notrans)

	// RWORK[i] = sum_j |A(j,i)| [ / C(j) if capply ]    (for trans)
	anorm = 0.0;
	if ( notrans ) {
		for ( i = 0; i < N; i++ ) {
			tmp = 0.0;
			ic = offsetC;
			if ( capply ) {
				for ( j = 0; j < N; j++ ) {
					// CABS1(A(i,j)) / C(j)
					tmp += ( Math.abs( Av[ oA + ( i * sa1 ) + ( j * sa2 ) ] ) + Math.abs( Av[ oA + ( i * sa1 ) + ( j * sa2 ) + 1 ] ) ) / c[ ic ];
					ic += strideC;
				}
			} else {
				for ( j = 0; j < N; j++ ) {
					// CABS1(A(i,j))
					tmp += Math.abs( Av[ oA + ( i * sa1 ) + ( j * sa2 ) ] ) + Math.abs( Av[ oA + ( i * sa1 ) + ( j * sa2 ) + 1 ] );
				}
			}
			RWORK[ offsetRWork + ( i * strideRWork ) ] = tmp;
			if ( tmp > anorm ) {
				anorm = tmp;
			}
		}
	} else {
		for ( i = 0; i < N; i++ ) {
			tmp = 0.0;
			ic = offsetC;
			if ( capply ) {
				for ( j = 0; j < N; j++ ) {
					// CABS1(A(j,i)) / C(j)
					tmp += ( Math.abs( Av[ oA + ( j * sa1 ) + ( i * sa2 ) ] ) + Math.abs( Av[ oA + ( j * sa1 ) + ( i * sa2 ) + 1 ] ) ) / c[ ic ];
					ic += strideC;
				}
			} else {
				for ( j = 0; j < N; j++ ) {
					// CABS1(A(j,i))
					tmp += Math.abs( Av[ oA + ( j * sa1 ) + ( i * sa2 ) ] ) + Math.abs( Av[ oA + ( j * sa1 ) + ( i * sa2 ) + 1 ] );
				}
			}
			RWORK[ offsetRWork + ( i * strideRWork ) ] = tmp;
			if ( tmp > anorm ) {
				anorm = tmp;
			}
		}
	}

	// Quick return if zero
	if ( anorm === 0.0 ) {
		return 0.0;
	}

	// Estimate the norm of inv(op(A)) via dlacn2 reverse communication
	ainvnm = 0.0;
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );
	ISAVE = new Int32Array( 3 );

	while ( true ) { // eslint-disable-line no-constant-condition
		zlacn2( N, WORK, strideWork, offsetWork + ( N * strideWork ), WORK, strideWork, offsetWork, EST, KASE, ISAVE, 1, 0 );
		ainvnm = EST[ 0 ];

		if ( KASE[ 0 ] === 0 ) {
			break;
		}

		if ( KASE[ 0 ] === 2 ) {
			// Multiply by R: WORK(i) = WORK(i) * RWORK(i)
			ir = oW;
			for ( i = 0; i < N; i++ ) {
				WORKv[ ir ] *= RWORK[ offsetRWork + ( i * strideRWork ) ];
				WORKv[ ir + 1 ] *= RWORK[ offsetRWork + ( i * strideRWork ) ];
				ir += sw;
			}

			// Solve op(A) * X = WORK (using factored AF)
			if ( notrans ) {
				zgetrs( 'no-transpose', N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			} else {
				zgetrs( 'conjugate-transpose', N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			}

			// Multiply by inv(C) if requested: WORK(i) *= C(i)
			// (inverse scaling: inv(diag(C)) applied on the right means |op(A)*inv(diag(C))|
			// Row norms were divided by C(j); here the adjoint-direction step multiplies by C)
			if ( capply ) {
				ir = oW;
				ic = offsetC;
				for ( i = 0; i < N; i++ ) {
					WORKv[ ir ] *= c[ ic ];
					WORKv[ ir + 1 ] *= c[ ic ];
					ir += sw;
					ic += strideC;
				}
			}
		} else {
			// KASE === 1: Multiply by inv(C), solve transposed, multiply by R
			if ( capply ) {
				ir = oW;
				ic = offsetC;
				for ( i = 0; i < N; i++ ) {
					WORKv[ ir ] *= c[ ic ];
					WORKv[ ir + 1 ] *= c[ ic ];
					ir += sw;
					ic += strideC;
				}
			}

			if ( notrans ) {
				zgetrs( 'conjugate-transpose', N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			} else {
				zgetrs( 'no-transpose', N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			}

			// Multiply by row norms: WORK(i) *= RWORK(i)
			ir = oW;
			for ( i = 0; i < N; i++ ) {
				WORKv[ ir ] *= RWORK[ offsetRWork + ( i * strideRWork ) ];
				WORKv[ ir + 1 ] *= RWORK[ offsetRWork + ( i * strideRWork ) ];
				ir += sw;
			}
		}
	}

	// Compute the reciprocal condition number
	if ( ainvnm !== 0.0 ) {
		return 1.0 / ainvnm;
	}
	return 0.0;
}


// EXPORTS //

export default zla_gercond_c;
