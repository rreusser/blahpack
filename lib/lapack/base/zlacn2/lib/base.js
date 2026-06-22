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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dzsum1 from '../../dzsum1/lib/base.js';
import izmax1 from '../../izmax1/lib/base.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import cabs from '@stdlib/math/base/special/cabs/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';


// VARIABLES //

var ITMAX = 5;
var ONE = 1.0;
var TWO = 2.0;
var SAFMIN = dlamch( 'Safe minimum' );


// MAIN //

/**
* Estimates the 1-norm of a square complex matrix A using reverse communication.
*
* This is a reverse communication interface routine. The caller must:
*
* 1. Set `KASE[0]` = 0 on the first call.
*
* 2. Call zlacn2 in a loop. After each return, if `KASE[0]` = 1,
*    compute `X = A*X` and call zlacn2 again; if `KASE[0]` = 2,
*    compute `X = A**H * X` and call zlacn2 again; if `KASE[0]` = 0,
*    the estimate is complete and `EST[0]` holds the result.
*
* ISAVE is used to maintain state between calls (3 elements).
*
* @private
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} V - workspace vector of length N
* @param {integer} strideV - stride for V (in complex elements)
* @param {NonNegativeInteger} offsetV - starting index for V (in complex elements)
* @param {Complex128Array} X - input/output vector of length N
* @param {integer} strideX - stride for X (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for X (in complex elements)
* @param {Float64Array} EST - in/out: EST[0] is the estimated 1-norm
* @param {Int32Array} KASE - in/out: KASE[0] is the operation to perform
* @param {Int32Array} ISAVE - state array of length 3
* @param {integer} strideISAVE - stride for ISAVE
* @param {NonNegativeInteger} offsetISAVE - starting index for ISAVE
*/
function zlacn2( N, V, strideV, offsetV, X, strideX, offsetX, EST, KASE, ISAVE, strideISAVE, offsetISAVE ) {
	var altsgn;
	var estold;
	var absxi;
	var jlast;
	var temp;
	var xv;
	var vv;
	var sx;
	var ix;
	var xr;
	var xi;
	var s0;
	var s1;
	var s2;
	var i;

	s0 = offsetISAVE;
	s1 = offsetISAVE + strideISAVE;
	s2 = offsetISAVE + ( 2 * strideISAVE );

	xv = reinterpret( X, 0 );
	vv = reinterpret( V, 0 );
	sx = strideX * 2;

	if ( KASE[ 0 ] === 0 ) {
		ix = offsetX * 2;
		for ( i = 0; i < N; i++ ) {
			xv[ ix ] = ONE / N;
			xv[ ix + 1 ] = 0.0;
			ix += sx;
		}
		KASE[ 0 ] = 1;
		ISAVE[ s0 ] = 1;
		return;
	}

	switch ( ISAVE[ s0 ] ) {
	case 1:
		// First iteration. X has been overwritten by A*X.
		if ( N === 1 ) {
			vv[ offsetV * 2 ] = xv[ offsetX * 2 ];
			vv[ offsetV * 2 + 1 ] = xv[ offsetX * 2 + 1 ];
			EST[ 0 ] = cabs( new Complex128( vv[ offsetV * 2 ], vv[ offsetV * 2 + 1 ] ) );
			KASE[ 0 ] = 0;
			return;
		}
		EST[ 0 ] = dzsum1( N, X, strideX, offsetX );

		ix = offsetX * 2;
		for ( i = 0; i < N; i++ ) {
			xr = xv[ ix ];
			xi = xv[ ix + 1 ];
			absxi = cabs( new Complex128( xr, xi ) );
			if ( absxi > SAFMIN ) {
				xv[ ix ] = xr / absxi;
				xv[ ix + 1 ] = xi / absxi;
			} else {
				xv[ ix ] = ONE;
				xv[ ix + 1 ] = 0.0;
			}
			ix += sx;
		}
		KASE[ 0 ] = 2;
		ISAVE[ s0 ] = 2;
		return;

	case 2:
		// First iteration. X has been overwritten by A**H * X.
		ISAVE[ s1 ] = izmax1( N, X, strideX, offsetX ); // 0-based
		ISAVE[ s2 ] = 2; // iteration count

		// Set up unit vector for column ISAVE[1] (label 50)
		ix = offsetX * 2;
		for ( i = 0; i < N; i++ ) {
			xv[ ix ] = 0.0;
			xv[ ix + 1 ] = 0.0;
			ix += sx;
		}
		ix = ( offsetX + ISAVE[ s1 ] * strideX ) * 2;
		xv[ ix ] = ONE;
		xv[ ix + 1 ] = 0.0;
		KASE[ 0 ] = 1;
		ISAVE[ s0 ] = 3;
		return;

	case 3:
		// X has been overwritten by A*X (label 70).
		zcopy( N, X, strideX, offsetX, V, strideV, offsetV );
		estold = EST[ 0 ];
		EST[ 0 ] = dzsum1( N, V, strideV, offsetV );

		// Test for cycling
		if ( EST[ 0 ] <= estold ) {
			// Go to final stage (label 100)
			altsgn = ONE;
			ix = offsetX * 2;
			for ( i = 0; i < N; i++ ) {
				xv[ ix ] = altsgn * ( ONE + i / ( N - 1 ) );
				xv[ ix + 1 ] = 0.0;
				altsgn = -altsgn;
				ix += sx;
			}
			KASE[ 0 ] = 1;
			ISAVE[ s0 ] = 5;
			return;
		}

		ix = offsetX * 2;
		for ( i = 0; i < N; i++ ) {
			xr = xv[ ix ];
			xi = xv[ ix + 1 ];
			absxi = cabs( new Complex128( xr, xi ) );
			if ( absxi > SAFMIN ) {
				xv[ ix ] = xr / absxi;
				xv[ ix + 1 ] = xi / absxi;
			} else {
				xv[ ix ] = ONE;
				xv[ ix + 1 ] = 0.0;
			}
			ix += sx;
		}
		KASE[ 0 ] = 2;
		ISAVE[ s0 ] = 4;
		return;

	case 4:
		// X has been overwritten by A**H * X (label 90).
		jlast = ISAVE[ s1 ];
		ISAVE[ s1 ] = izmax1( N, X, strideX, offsetX ); // 0-based

		ix = ( offsetX + jlast * strideX ) * 2;
		temp = cabs( new Complex128( xv[ ix ], xv[ ix + 1 ] ) );
		ix = ( offsetX + ISAVE[ s1 ] * strideX ) * 2;
		if ( temp !== cabs( new Complex128( xv[ ix ], xv[ ix + 1 ] ) ) && ISAVE[ s2 ] < ITMAX ) {
			ISAVE[ s2 ] += 1;

			// Go to label 50: set up unit vector
			ix = offsetX * 2;
			for ( i = 0; i < N; i++ ) {
				xv[ ix ] = 0.0;
				xv[ ix + 1 ] = 0.0;
				ix += sx;
			}
			ix = ( offsetX + ISAVE[ s1 ] * strideX ) * 2;
			xv[ ix ] = ONE;
			xv[ ix + 1 ] = 0.0;
			KASE[ 0 ] = 1;
			ISAVE[ s0 ] = 3;
			return;
		}

		// Iteration complete. Final stage (label 100).
		altsgn = ONE;
		ix = offsetX * 2;
		for ( i = 0; i < N; i++ ) {
			xv[ ix ] = altsgn * ( ONE + i / ( N - 1 ) );
			xv[ ix + 1 ] = 0.0;
			altsgn = -altsgn;
			ix += sx;
		}
		KASE[ 0 ] = 1;
		ISAVE[ s0 ] = 5;
		return;

	case 5:
		// X has been overwritten by A*X (label 120).
		temp = TWO * ( dzsum1( N, X, strideX, offsetX ) / ( 3 * N ) );
		if ( temp > EST[ 0 ] ) {
			zcopy( N, X, strideX, offsetX, V, strideV, offsetV );
			EST[ 0 ] = temp;
		}
		KASE[ 0 ] = 0;
		break;
	default:
	}
}


// EXPORTS //

export default zlacn2;
