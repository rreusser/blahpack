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

/* eslint-disable max-len, max-params, max-statements, max-depth, camelcase */

// MODULES //

import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import abs from '@stdlib/math/base/special/abs/lib/index.js';
import max from '@stdlib/math/base/special/max/lib/index.js';
import min from '@stdlib/math/base/special/min/lib/index.js';
import cmplx from '../../../../cmplx.js';
import zlacn2 from '../../zlacn2/lib/base.js';
import zgbtrs from '../../zgbtrs/lib/base.js';


// MAIN //

/**
* Estimates the infinity norm condition number of `op(A)*diag(x)` for a complex general banded matrix.
*
* Uses reverse-communication norm estimation (zlacn2) combined with a pre-factored LU (zgbtrs).
* The banded matrix `AB` must have leading dimension `KL+KU+1`; the factored form `AFB`
* must have leading dimension `2*KL+KU+1` and was produced by `zgbtrf`.
*
* `WORK` must have at least `2*N` complex elements, `RWORK` at least `N` real elements.
*
* @private
* @param {string} trans - form of the system: `'no-transpose'` or `'conjugate-transpose'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {Complex128Array} AB - original banded matrix, `(KL+KU+1)` by `N`
* @param {integer} strideAB1 - stride of the first dimension of `AB` (complex elements)
* @param {integer} strideAB2 - stride of the second dimension of `AB` (complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for `AB` (complex elements)
* @param {Complex128Array} AFB - LU-factored banded matrix, `(2*KL+KU+1)` by `N`
* @param {integer} strideAFB1 - stride of the first dimension of `AFB` (complex elements)
* @param {integer} strideAFB2 - stride of the second dimension of `AFB` (complex elements)
* @param {NonNegativeInteger} offsetAFB - starting index for `AFB` (complex elements)
* @param {Int32Array} IPIV - pivot indices from `zgbtrf` (0-based)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} x - scaling vector of length `N`
* @param {integer} strideX - stride length for `x` (complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (complex elements)
* @param {Complex128Array} WORK - complex workspace of length at least `2*N`
* @param {integer} strideWork - stride length for `WORK` (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (complex elements)
* @param {Float64Array} RWORK - real workspace of length at least `N`
* @param {integer} strideRWork - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @returns {number} estimated reciprocal condition number
*/
function zla_gbrcond_x( trans, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, x, strideX, offsetX, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	var notrans;
	var ainvnm;
	var ISAVE;
	var anorm;
	var KASE;
	var EST;
	var owN;
	var sa1;
	var sa2;
	var prR;
	var prI;
	var aij;
	var tmp;
	var jlo;
	var jhi;
	var wv;
	var xv;
	var av;
	var sw;
	var sx;
	var sr;
	var oA;
	var oW;
	var oX;
	var kd;
	var ke;
	var aR;
	var aI;
	var xR;
	var xI;
	var wR;
	var wI;
	var i;
	var j;

	if ( N === 0 ) {
		return 1.0;
	}

	notrans = ( trans === 'no-transpose' );

	// Fortran KD = KU + 1 (1-based) → 0-based row offset of the diagonal in AB is `ku`.
	kd = ku;

	// Fortran KE = KL + 1 (1-based) → 0-based row offset for the transpose branch is `kl`.
	ke = kl;

	// Reinterpret complex arrays as Float64 views for direct re/im access.
	av = reinterpret( AB, 0 );
	xv = reinterpret( x, 0 );
	wv = reinterpret( WORK, 0 );

	// Float64 strides/offsets for Complex128 views (one complex element = 2 doubles).
	sa1 = strideAB1 * 2;
	sa2 = strideAB2 * 2;
	sx = strideX * 2;
	sw = strideWork * 2;
	sr = strideRWork;
	oA = offsetAB * 2;
	oW = offsetWork * 2;
	oX = offsetX * 2;

	// Compute per-row sums `sum_j |A[i,j] * x[j]|` (CABS1) and track the infinity norm.
	anorm = 0.0;
	if ( notrans ) {
		for ( i = 0; i < N; i++ ) {
			tmp = 0.0;
			jlo = max( i - kl, 0 );
			jhi = min( i + ku, N - 1 );
			for ( j = jlo; j <= jhi; j++ ) {
				aij = oA + ( ( kd + i - j ) * sa1 ) + ( j * sa2 );
				aR = av[ aij ];
				aI = av[ aij + 1 ];
				xR = xv[ oX + ( j * sx ) ];
				xI = xv[ oX + ( j * sx ) + 1 ];

				// Prod = AB[i,j] * x[j]
				prR = ( aR * xR ) - ( aI * xI );
				prI = ( aR * xI ) + ( aI * xR );

				// CABS1(prod) = |Re(prod)| + |Im(prod)|
				tmp += abs( prR ) + abs( prI );
			}
			RWORK[ offsetRWork + ( i * sr ) ] = tmp;
			if ( tmp > anorm ) {
				anorm = tmp;
			}
		}
	} else {
		for ( i = 0; i < N; i++ ) {
			tmp = 0.0;
			jlo = max( i - kl, 0 );
			jhi = min( i + ku, N - 1 );
			for ( j = jlo; j <= jhi; j++ ) {
				// AB(KE - I + J, I) — column index is `i`, row element depends on `j`.
				aij = oA + ( ( ke - i + j ) * sa1 ) + ( i * sa2 );
				aR = av[ aij ];
				aI = av[ aij + 1 ];
				xR = xv[ oX + ( j * sx ) ];
				xI = xv[ oX + ( j * sx ) + 1 ];

				prR = ( aR * xR ) - ( aI * xI );
				prI = ( aR * xI ) + ( aI * xR );

				tmp += abs( prR ) + abs( prI );
			}
			RWORK[ offsetRWork + ( i * sr ) ] = tmp;
			if ( tmp > anorm ) {
				anorm = tmp;
			}
		}
	}

	// Quick return: a zero row-sum means the infinity norm is zero.
	if ( anorm === 0.0 ) {
		return 0.0;
	}

	// Allocate state for the zlacn2 reverse-communication interface.
	ISAVE = new Int32Array( 3 );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );

	ainvnm = 0.0;
	KASE[ 0 ] = 0;

	// The Fortran call is `ZLACN2(N, WORK(N+1), WORK, ...)`; V starts at `WORK[N]`, X at `WORK[0]`.
	owN = offsetWork + ( N * strideWork );

	// Reverse-communication loop.
	while ( true ) {
		zlacn2( N, WORK, strideWork, owN, WORK, strideWork, offsetWork, EST, KASE, ISAVE, 1, 0 );

		if ( KASE[ 0 ] === 0 ) {
			break;
		}

		if ( KASE[ 0 ] === 2 ) {
			// WORK := RWORK .* WORK (pointwise, real RWORK scales complex WORK).
			for ( i = 0; i < N; i++ ) {
				tmp = RWORK[ offsetRWork + ( i * sr ) ];
				wv[ oW + ( i * sw ) ] *= tmp;
				wv[ oW + ( i * sw ) + 1 ] *= tmp;
			}

			if ( notrans ) {
				zgbtrs( 'no-transpose', N, kl, ku, 1, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			} else {
				zgbtrs( 'conjugate-transpose', N, kl, ku, 1, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			}

			// WORK := WORK ./ x (robust complex division).
			for ( i = 0; i < N; i++ ) {
				cmplx.divAt( wv, oW + ( i * sw ), wv, oW + ( i * sw ), xv, oX + ( i * sx ) );
			}
		} else {
			// KASE === 1: scale by `x^{-1}`, solve the transposed system, then multiply by row sums.
			for ( i = 0; i < N; i++ ) {
				cmplx.divAt( wv, oW + ( i * sw ), wv, oW + ( i * sw ), xv, oX + ( i * sx ) );
			}

			if ( notrans ) {
				zgbtrs( 'conjugate-transpose', N, kl, ku, 1, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			} else {
				zgbtrs( 'no-transpose', N, kl, ku, 1, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			}

			for ( i = 0; i < N; i++ ) {
				tmp = RWORK[ offsetRWork + ( i * sr ) ];
				wR = wv[ oW + ( i * sw ) ];
				wI = wv[ oW + ( i * sw ) + 1 ];
				wv[ oW + ( i * sw ) ] = wR * tmp;
				wv[ oW + ( i * sw ) + 1 ] = wI * tmp;
			}
		}
	}

	ainvnm = EST[ 0 ];
	if ( ainvnm !== 0.0 ) {
		return 1.0 / ainvnm;
	}
	return 0.0;
}


// EXPORTS //

export default zla_gbrcond_x;
