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
import abs from '@stdlib/math/base/special/abs/lib/index.js';
import max from '@stdlib/math/base/special/max/lib/index.js';
import min from '@stdlib/math/base/special/min/lib/index.js';
import dlacn2 from '../../dlacn2/lib/base.js';
import dgbtrs from '../../dgbtrs/lib/base.js';


// MAIN //

/**
* Estimates the Skeel condition number for a general banded matrix.
*
* Uses iterative refinement with a dlacn2 reverse communication loop.
* Requires pre-factored input (IPIV from dgbtrf).
*
* WORK must have at least 5*N elements. IWORK must have at least N elements.
*
* @private
* @param {string} trans - specifies the form of the system of equations: `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {Float64Array} AB - original banded matrix in band storage, (KL+KU+1) by N
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} AFB - LU factored banded matrix from dgbtrf, (2*KL+KU+1) by N
* @param {integer} strideAFB1 - stride of the first dimension of `AFB`
* @param {integer} strideAFB2 - stride of the second dimension of `AFB`
* @param {NonNegativeInteger} offsetAFB - starting index for `AFB`
* @param {Int32Array} IPIV - pivot indices from dgbtrf (0-based)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {integer} cmode - scaling mode: 1 means C is used to scale columns, 0 means no scaling, -1 means C^{-1} scaling
* @param {Float64Array} c - scaling vector of length N
* @param {integer} strideC - stride length for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Float64Array} WORK - workspace array of length at least 5*N
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - workspace array of length at least N
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @returns {number} estimated reciprocal Skeel condition number
*/
function dla_gbrcond( trans, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, cmode, c, strideC, offsetC, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len
	var notrans;
	var ainvnm;
	var ISAVE;
	var KASE;
	var EST;
	var tmp;
	var jlo;
	var jhi;
	var kd;
	var ke;
	var sw;
	var sc;
	var i;
	var j;

	if ( N === 0 ) {
		return 1.0;
	}

	notrans = ( trans === 'no-transpose' );
	sw = strideWork;
	sc = strideC;

	// KD is the 0-based row offset within AB for the diagonal when not transposed

	// Fortran: KD = KU + 1 (1-based), so 0-based = ku
	kd = ku;

	// KE is the 0-based row offset within AB for the transpose case

	// Fortran: KE = KL + 1 (1-based), so 0-based = kl
	ke = kl;

	// Compute absolute-value row sums (stored in WORK(2*N .. 3*N-1))
	if ( notrans ) {
		for ( i = 0; i < N; i++ ) {
			tmp = 0.0;
			jlo = max( i - kl, 0 );
			jhi = min( i + ku, N - 1 );
			if ( cmode === 1 ) {
				for ( j = jlo; j <= jhi; j++ ) {
					tmp += abs( AB[ offsetAB + ((kd + i - j) * strideAB1) + (j * strideAB2) ] * c[ offsetC + (j * sc) ] );
				}
			} else if ( cmode === 0 ) {
				for ( j = jlo; j <= jhi; j++ ) {
					tmp += abs( AB[ offsetAB + ((kd + i - j) * strideAB1) + (j * strideAB2) ] );
				}
			} else {
				for ( j = jlo; j <= jhi; j++ ) {
					tmp += abs( AB[ offsetAB + ((kd + i - j) * strideAB1) + (j * strideAB2) ] / c[ offsetC + (j * sc) ] );
				}
			}
			WORK[ offsetWork + (((2 * N) + i) * sw) ] = tmp;
		}
	} else {
		for ( i = 0; i < N; i++ ) {
			tmp = 0.0;
			jlo = max( i - kl, 0 );
			jhi = min( i + ku, N - 1 );
			if ( cmode === 1 ) {
				for ( j = jlo; j <= jhi; j++ ) {
					tmp += abs( AB[ offsetAB + ((ke - i + j) * strideAB1) + (i * strideAB2) ] * c[ offsetC + (j * sc) ] );
				}
			} else if ( cmode === 0 ) {
				for ( j = jlo; j <= jhi; j++ ) {
					tmp += abs( AB[ offsetAB + ((ke - i + j) * strideAB1) + (i * strideAB2) ] );
				}
			} else {
				for ( j = jlo; j <= jhi; j++ ) {
					tmp += abs( AB[ offsetAB + ((ke - i + j) * strideAB1) + (i * strideAB2) ] / c[ offsetC + (j * sc) ] );
				}
			}
			WORK[ offsetWork + (((2 * N) + i) * sw) ] = tmp;
		}
	}

	// Allocate state arrays for dlacn2 reverse communication
	ISAVE = new Int32Array( 3 );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );

	ainvnm = 0.0;
	KASE[ 0 ] = 0;

	// Reverse communication loop
	while ( true ) {
		dlacn2( N, WORK, sw, offsetWork + (N * sw), WORK, sw, offsetWork, IWORK, strideIWork, offsetIWork, EST, KASE, ISAVE, 1, 0 ); // eslint-disable-line max-len

		if ( KASE[ 0 ] === 0 ) {
			break;
		}

		if ( KASE[ 0 ] === 2 ) {
			// Multiply by absolute-value row sums, then solve, then scale by C
			for ( i = 0; i < N; i++ ) {
				WORK[ offsetWork + (i * sw) ] *= WORK[ offsetWork + (((2 * N) + i) * sw) ];
			}

			if ( notrans ) {
				dgbtrs( 'no-transpose', N, kl, ku, 1, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, WORK, sw, N * sw, offsetWork );
			} else {
				dgbtrs( 'transpose', N, kl, ku, 1, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, WORK, sw, N * sw, offsetWork );
			}

			if ( cmode === 1 ) {
				for ( i = 0; i < N; i++ ) {
					WORK[ offsetWork + (i * sw) ] /= c[ offsetC + (i * sc) ];
				}
			} else if ( cmode === -1 ) {
				for ( i = 0; i < N; i++ ) {
					WORK[ offsetWork + (i * sw) ] *= c[ offsetC + (i * sc) ];
				}
			}
		} else {
			// KASE === 1: scale by C, then solve with transposed system, then multiply by row sums
			if ( cmode === 1 ) {
				for ( i = 0; i < N; i++ ) {
					WORK[ offsetWork + (i * sw) ] /= c[ offsetC + (i * sc) ];
				}
			} else if ( cmode === -1 ) {
				for ( i = 0; i < N; i++ ) {
					WORK[ offsetWork + (i * sw) ] *= c[ offsetC + (i * sc) ];
				}
			}

			if ( notrans ) {
				dgbtrs( 'transpose', N, kl, ku, 1, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, WORK, sw, N * sw, offsetWork );
			} else {
				dgbtrs( 'no-transpose', N, kl, ku, 1, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, WORK, sw, N * sw, offsetWork );
			}

			for ( i = 0; i < N; i++ ) {
				WORK[ offsetWork + (i * sw) ] *= WORK[ offsetWork + (((2 * N) + i) * sw) ];
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

export default dla_gbrcond;
