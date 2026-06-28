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
import zlacn2 from '../../zlacn2/lib/base.js';
import zgbtrs from '../../zgbtrs/lib/base.js';


// MAIN //

/**
* Estimates the infinity norm condition number of `op(A) * inv(diag(C))` for a complex general banded matrix.
*
* Uses a dlacn2 reverse-communication loop together with `zgbtrs`. Requires a
* pre-factored input (`AFB` and `IPIV` from `zgbtrf`).
*
* `WORK` must have at least `2*N` complex elements. `RWORK` must have at least `N` real elements.
*
* @private
* @param {string} trans - specifies the form of the system of equations: `'no-transpose'` or `'conjugate-transpose'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {Complex128Array} AB - original banded matrix in band storage, `(KL+KU+1)` by `N`
* @param {integer} strideAB1 - stride of the first dimension of `AB` (in complex elements)
* @param {integer} strideAB2 - stride of the second dimension of `AB` (in complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for `AB` (in complex elements)
* @param {Complex128Array} AFB - LU factored banded matrix from `zgbtrf`, `(2*KL+KU+1)` by `N`
* @param {integer} strideAFB1 - stride of the first dimension of `AFB` (in complex elements)
* @param {integer} strideAFB2 - stride of the second dimension of `AFB` (in complex elements)
* @param {NonNegativeInteger} offsetAFB - starting index for `AFB` (in complex elements)
* @param {Int32Array} IPIV - pivot indices from `zgbtrf` (0-based)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Float64Array} c - real scaling vector of length `N`
* @param {integer} strideC - stride length for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {boolean} capply - if `true`, scale by `inv(diag(C))`
* @param {Complex128Array} WORK - complex workspace of length at least `2*N`
* @param {integer} strideWork - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @param {Float64Array} RWORK - real workspace of length at least `N`
* @param {integer} strideRWork - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @returns {number} estimated reciprocal infinity-norm condition number
*/
function zla_gbrcond_c( trans, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, c, strideC, offsetC, capply, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	var notrans;
	var ainvnm;
	var abView;
	var wkView;
	var ISAVE;
	var anorm;
	var KASE;
	var sab1;
	var sab2;
	var EST;
	var oab;
	var sw2;
	var ow2;
	var tmp;
	var jlo;
	var jhi;
	var idx;
	var kd;
	var ke;
	var sr;
	var sc;
	var i;
	var j;

	if ( N === 0 ) {
		return 1.0;
	}

	notrans = ( trans === 'no-transpose' );
	sr = strideRWork;
	sc = strideC;

	// Interleaved Float64 view of AB for per-element |a_ij| reads
	abView = reinterpret( AB, 0 );
	sab1 = strideAB1 * 2;
	sab2 = strideAB2 * 2;
	oab = offsetAB * 2;

	// KD is the 0-based row offset within AB for the diagonal when not transposed

	// Fortran: KD = KU + 1 (1-based), so 0-based = ku
	kd = ku;

	// KE is the 0-based row offset within AB for the transpose case

	// Fortran: KE = KL + 1 (1-based), so 0-based = kl
	ke = kl;

	// Compute absolute-value row sums into RWORK and track ANORM
	anorm = 0.0;
	if ( notrans ) {
		for ( i = 0; i < N; i++ ) {
			tmp = 0.0;
			jlo = max( i - kl, 0 );
			jhi = min( i + ku, N - 1 );
			if ( capply ) {
				for ( j = jlo; j <= jhi; j++ ) {
					idx = oab + ( ( kd + i - j ) * sab1 ) + ( j * sab2 );

					// CABS1( A(kd+i-j, j) ) / C(j)
					tmp += ( abs( abView[ idx ] ) + abs( abView[ idx + 1 ] ) ) / c[ offsetC + ( j * sc ) ];
				}
			} else {
				for ( j = jlo; j <= jhi; j++ ) {
					idx = oab + ( ( kd + i - j ) * sab1 ) + ( j * sab2 );
					tmp += abs( abView[ idx ] ) + abs( abView[ idx + 1 ] );
				}
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
			if ( capply ) {
				for ( j = jlo; j <= jhi; j++ ) {
					idx = oab + ( ( ke - i + j ) * sab1 ) + ( i * sab2 );
					tmp += ( abs( abView[ idx ] ) + abs( abView[ idx + 1 ] ) ) / c[ offsetC + ( j * sc ) ];
				}
			} else {
				for ( j = jlo; j <= jhi; j++ ) {
					idx = oab + ( ( ke - i + j ) * sab1 ) + ( i * sab2 );
					tmp += abs( abView[ idx ] ) + abs( abView[ idx + 1 ] );
				}
			}
			RWORK[ offsetRWork + ( i * sr ) ] = tmp;
			if ( tmp > anorm ) {
				anorm = tmp;
			}
		}
	}

	// Quick return if A is zero
	if ( anorm === 0.0 ) {
		return 0.0;
	}

	// Allocate state arrays for zlacn2 reverse communication
	ISAVE = new Int32Array( 3 );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );

	ainvnm = 0.0;
	KASE[ 0 ] = 0;

	// WORK[0..N-1] is X (input/output), WORK[N..2N-1] is V (workspace)
	sw2 = strideWork * 2;
	ow2 = offsetWork * 2;

	// Interleaved Float64 view of WORK for in-place scaling
	wkView = reinterpret( WORK, 0 );

	// Reverse communication loop
	while ( true ) {
		zlacn2( N, WORK, strideWork, offsetWork + ( N * strideWork ), WORK, strideWork, offsetWork, EST, KASE, ISAVE, 1, 0 );

		if ( KASE[ 0 ] === 0 ) {
			break;
		}

		if ( KASE[ 0 ] === 2 ) {
			// Multiply WORK[i] by RWORK[i] (real-scalar scaling)
			for ( i = 0; i < N; i++ ) {
				idx = ow2 + ( i * sw2 );
				tmp = RWORK[ offsetRWork + ( i * sr ) ];
				wkView[ idx ] *= tmp;
				wkView[ idx + 1 ] *= tmp;
			}

			if ( notrans ) {
				zgbtrs( 'no-transpose', N, kl, ku, 1, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			} else {
				zgbtrs( 'conjugate-transpose', N, kl, ku, 1, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			}

			// Multiply by C (only if CAPPLY)
			if ( capply ) {
				for ( i = 0; i < N; i++ ) {
					idx = ow2 + ( i * sw2 );
					tmp = c[ offsetC + ( i * sc ) ];
					wkView[ idx ] *= tmp;
					wkView[ idx + 1 ] *= tmp;
				}
			}
		} else {
			// KASE === 1: multiply by C, solve transposed system, multiply by RWORK
			if ( capply ) {
				for ( i = 0; i < N; i++ ) {
					idx = ow2 + ( i * sw2 );
					tmp = c[ offsetC + ( i * sc ) ];
					wkView[ idx ] *= tmp;
					wkView[ idx + 1 ] *= tmp;
				}
			}

			if ( notrans ) {
				zgbtrs( 'conjugate-transpose', N, kl, ku, 1, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			} else {
				zgbtrs( 'no-transpose', N, kl, ku, 1, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, N * strideWork, offsetWork );
			}

			for ( i = 0; i < N; i++ ) {
				idx = ow2 + ( i * sw2 );
				tmp = RWORK[ offsetRWork + ( i * sr ) ];
				wkView[ idx ] *= tmp;
				wkView[ idx + 1 ] *= tmp;
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

export default zla_gbrcond_c;
