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

import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zaxpy from './../../../../blas/base/zaxpy/lib/base.js';
import zdotc from './../../../../blas/base/zdotc/lib/base.js';
import zlacn2 from '../../zlacn2/lib/base.js';
import zlatbs from '../../zlatbs/lib/base.js';
import zdrscl from '../../zdrscl/lib/base.js';
import izamax from './../../../../blas/base/izamax/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var SMLNUM = dlamch( 'safe-minimum' );


// FUNCTIONS //

/**
* CABS1: |re(z)| + |im(z)|.
*
* @private
* @param {Float64Array} v - Float64 view
* @param {integer} idx - index of real part
* @returns {number} CABS1 value
*/
function cabs1( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Estimates the reciprocal of the condition number of a complex general band.
* matrix A, in either the 1-norm or the infinity-norm, using the LU
* factorization computed by zgbtrf.
*
* @private
* @param {string} norm - 'one-norm' for 1-norm, 'inf-norm' for infinity-norm
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {Complex128Array} AB - LU factorization from zgbtrf, (2*KL+KU+1) by N
* @param {integer} strideAB1 - stride of the first dimension of `AB` (complex elements)
* @param {integer} strideAB2 - stride of the second dimension of `AB` (complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for `AB` (complex elements)
* @param {Int32Array} IPIV - pivot indices from zgbtrf (0-based)
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {number} anorm - the 1-norm or infinity-norm of the original matrix
* @param {Float64Array} rcond - out: rcond[0] is the reciprocal condition number
* @param {Complex128Array} WORK - workspace array of length 2*N
* @param {integer} strideWORK - stride for `WORK` (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (complex elements)
* @param {Float64Array} RWORK - workspace array of length N
* @param {integer} strideRWORK - stride for `RWORK`
* @param {NonNegativeInteger} offsetRWORK - starting index for `RWORK`
* @returns {integer} info - 0 if successful
*/
function zgbcon( norm, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, IPIV, strideIPIV, offsetIPIV, anorm, rcond, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) {
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
	var dot;
	var sa1;
	var sa2;
	var wv;
	var lm;
	var jp;
	var kd;
	var ix;
	var sw;
	var si;
	var pw;
	var tr;
	var ti;
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

	// Allocate state arrays for zlacn2
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

	// KD is the row index (complex elements) of the main diagonal in zgbtrf banded storage
	kd = kl + ku;

	// LNOTI: do we have subdiagonal multipliers?
	lnoti = ( kl > 0 );

	KASE[ 0 ] = 0;
	wv = reinterpret( WORK, 0 );

	// Reverse-communication loop
	bail = false;

	while ( true ) {
		zlacn2( N, WORK, sw, offsetWORK + ( N * sw ),  // v
			WORK, sw, offsetWORK,                // x
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
					jp = IPIV[ offsetIPIV + ( j * si ) ];

					// T = WORK(jp) - read from Float64 view
					pw = ( offsetWORK + ( jp * sw ) ) * 2;
					tr = wv[ pw ];
					ti = wv[ pw + 1 ];
					if ( jp !== j ) {
						// Swap WORK(jp) and WORK(j)
						wv[ pw ] = wv[ ( offsetWORK + ( j * sw ) ) * 2 ];
						wv[ pw + 1 ] = wv[ ( offsetWORK + ( j * sw ) ) * 2 + 1 ];
						wv[ ( offsetWORK + ( j * sw ) ) * 2 ] = tr;
						wv[ ( offsetWORK + ( j * sw ) ) * 2 + 1 ] = ti;
					}
					// ZAXPY(lm, -t, AB(KD+1,j), 1, WORK(j+1), 1)
					zaxpy( lm, new Complex128( -tr, -ti ), AB, sa1, offsetAB + ( ( kd + 1 ) * sa1 ) + ( j * sa2 ), WORK, sw, offsetWORK + ( ( j + 1 ) * sw ) );
				}
			}

			// Solve U*x = y using zlatbs
			zlatbs( 'upper', 'no-transpose', 'non-unit', normin, N, kl + ku, AB, sa1, sa2, offsetAB, WORK, sw, offsetWORK, scale, RWORK, strideRWORK, offsetRWORK );
		} else {
			// Multiply by inv(U^H), then inv(L^H)

			// Solve U^H*x = y using zlatbs
			zlatbs( 'upper', 'conjugate-transpose', 'non-unit', normin, N, kl + ku, AB, sa1, sa2, offsetAB, WORK, sw, offsetWORK, scale, RWORK, strideRWORK, offsetRWORK );

			// Apply L^H: backward elimination with pivots
			if ( lnoti ) {
				for ( j = N - 2; j >= 0; j-- ) {
					lm = Math.min( kl, N - j - 1 );

					// WORK(j) -= ZDOTC(lm, AB(KD+1,j), 1, WORK(j+1), 1)
					dot = zdotc( lm, AB, sa1, offsetAB + ( ( kd + 1 ) * sa1 ) + ( j * sa2 ), WORK, sw, offsetWORK + ( ( j + 1 ) * sw ) );
					pw = ( offsetWORK + ( j * sw ) ) * 2;
					wv[ pw ] -= real( dot );
					wv[ pw + 1 ] -= imag( dot );
					jp = IPIV[ offsetIPIV + ( j * si ) ];
					if ( jp !== j ) {
						pw = ( offsetWORK + ( jp * sw ) ) * 2;
						tr = wv[ pw ];
						ti = wv[ pw + 1 ];
						wv[ pw ] = wv[ ( offsetWORK + ( j * sw ) ) * 2 ];
						wv[ pw + 1 ] = wv[ ( offsetWORK + ( j * sw ) ) * 2 + 1 ];
						wv[ ( offsetWORK + ( j * sw ) ) * 2 ] = tr;
						wv[ ( offsetWORK + ( j * sw ) ) * 2 + 1 ] = ti;
					}
				}
			}
		}

		// Combine scaling
		normin = 'yes';
		if ( scale[ 0 ] !== 1.0 ) {
			ix = izamax( N, WORK, sw, offsetWORK );
			if ( scale[ 0 ] < cabs1( wv, ( offsetWORK + ( ix * sw ) ) * 2 ) * SMLNUM || scale[ 0 ] === 0.0 ) {
				bail = true;
				break;
			}
			zdrscl( N, scale[ 0 ], WORK, sw, offsetWORK );
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

export default zgbcon;
