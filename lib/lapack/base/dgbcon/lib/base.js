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

/* eslint-disable max-len, max-params */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import daxpy from './../../../../blas/base/daxpy/lib/base.js';
import ddot from './../../../../blas/base/ddot/lib/base.js';
import dlacn2 from '../../dlacn2/lib/base.js';
import dlatbs from '../../dlatbs/lib/base.js';
import drscl from '../../drscl/lib/base.js';
import idamax from './../../../../blas/base/idamax/lib/base.js';


// VARIABLES //

var SMLNUM = 2.2250738585072014e-308; // DLAMCH('S')


// MAIN //

/**
* Estimates the reciprocal of the condition number of a general band matrix A.
* in either the 1-norm or the infinity-norm, using the LU factorization
* computed by dgbtrf.
*
* @private
* @param {string} norm - 'one-norm' for 1-norm, 'inf-norm' for infinity-norm
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {Float64Array} AB - LU factorization from dgbtrf, (2*KL+KU+1) by N
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Int32Array} IPIV - pivot indices from dgbtrf (0-based)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {number} anorm - the 1-norm or infinity-norm of the original matrix
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Float64Array} WORK - workspace array of length 3*N
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @param {Int32Array} IWORK - workspace array of length N
* @param {integer} strideIWORK - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWORK - starting index for `IWORK`
* @returns {integer} info - 0 if successful
*/
function dgbcon( norm, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK ) {
	var ainvnm;
	var normin;
	var onenrm;
	var kase1;
	var scale;
	var ISAVE;
	var lnoti;
	var bail;
	var KASE;
	var EST;
	var sa1;
	var sa2;
	var lm;
	var jp;
	var kd;
	var ix;
	var sw;
	var si;
	var t;
	var j;

	sw = strideWORK;
	si = strideIPIV;
	sa1 = strideAB1;
	sa2 = strideAB2;

	// Determine norm type
	onenrm = ( norm === 'one-norm' );

	rcond[ 0 ] = 0.0;

	if ( N === 0 ) {
		rcond[ 0 ] = 1.0;
		return 0;
	}
	if ( anorm === 0.0 ) {
		return 0;
	}

	// Allocate state arrays for dlacn2
	ISAVE = new Int32Array( 3 );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );
	scale = new Float64Array( 1 );

	ainvnm = 0.0;
	normin = 'no';
	if ( onenrm ) {
		kase1 = 1;
	} else {
		kase1 = 2;
	}

	// KD is the row index (0-based) of the main diagonal in dgbtrf banded storage
	// In Fortran: KD = KL + KU + 1 (1-based row), so 0-based = kl + ku
	kd = kl + ku;

	// LNOTI: do we have subdiagonal multipliers?
	lnoti = ( kl > 0 );

	KASE[ 0 ] = 0;

	// Reverse-communication loop
	bail = false;

	while ( true ) {
		dlacn2( N, WORK, sw, offsetWORK + (N * sw), // v
			WORK, sw, offsetWORK, // x
			IWORK, strideIWORK, offsetIWORK, // isgn
			EST, KASE, ISAVE, 1, 0);

		if ( KASE[ 0 ] === 0 ) {
			break;
		}

		if ( KASE[ 0 ] === kase1 ) {
			// Multiply by inv(L), then inv(U)

			// Apply L: forward elimination with pivots
			if ( lnoti ) {
				for ( j = 0; j < N - 1; j++ ) {
					lm = Math.min( kl, N - j - 1 );

					// IPIV is 0-based in JS
					jp = IPIV[ offsetIPIV + (j * si) ];
					t = WORK[ offsetWORK + (jp * sw) ];
					if ( jp !== j ) {
						WORK[ offsetWORK + (jp * sw) ] = WORK[ offsetWORK + (j * sw) ];
						WORK[ offsetWORK + (j * sw) ] = t;
					}
					// In Fortran: AB(KD+1, J) is 1-based row KD+1, col J
					// 0-based: row (kd+1), col j => but wait, kd is already 0-based row of main diag
					// The L multipliers are stored below the main diagonal at rows kd+1..kd+kl
					// In 0-based: row index (kd+1) corresponds to Fortran row KL+KU+2
					daxpy( lm, -t, AB, sa1, offsetAB + ((kd + 1) * sa1) + (j * sa2), WORK, sw, offsetWORK + ((j + 1) * sw) );
				}
			}

			// Solve U*x = y using dlatbs
			// The upper triangular band has bandwidth KL+KU
			dlatbs( 'upper', 'no-transpose', 'non-unit', normin, N, kl + ku, AB, sa1, sa2, offsetAB, WORK, sw, offsetWORK, scale, WORK, sw, offsetWORK + ((2 * N) * sw) );
		} else {
			// Multiply by inv(U^T), then inv(L^T)

			// Solve U^T*x = y using dlatbs
			dlatbs( 'upper', 'transpose', 'non-unit', normin, N, kl + ku, AB, sa1, sa2, offsetAB, WORK, sw, offsetWORK, scale, WORK, sw, offsetWORK + ((2 * N) * sw) );

			// Apply L^T: backward elimination with pivots
			if ( lnoti ) {
				for ( j = N - 2; j >= 0; j-- ) {
					lm = Math.min( kl, N - j - 1 );
					WORK[ offsetWORK + (j * sw) ] -= ddot( lm, AB, sa1, offsetAB + ((kd + 1) * sa1) + (j * sa2), WORK, sw, offsetWORK + ((j + 1) * sw) );
					jp = IPIV[ offsetIPIV + (j * si) ];
					if ( jp !== j ) {
						t = WORK[ offsetWORK + (jp * sw) ];
						WORK[ offsetWORK + (jp * sw) ] = WORK[ offsetWORK + (j * sw) ];
						WORK[ offsetWORK + (j * sw) ] = t;
					}
				}
			}
		}

		// Combine scaling
		normin = 'yes';
		if ( scale[ 0 ] !== 1.0 ) {
			ix = idamax( N, WORK, sw, offsetWORK );
			if ( scale[ 0 ] < Math.abs( WORK[ offsetWORK + (ix * sw) ] ) * SMLNUM || scale[ 0 ] === 0.0 ) {
				bail = true;
				break;
			}
			drscl( N, scale[ 0 ], WORK, sw, offsetWORK );
		}
	}

	if ( !bail ) {
		ainvnm = EST[ 0 ];
		if ( ainvnm !== 0.0 ) {
			rcond[ 0 ] = ( 1.0 / ainvnm ) / anorm;
		}
	}

	return 0;
}


// EXPORTS //

export default dgbcon;
