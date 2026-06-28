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

/* eslint-disable max-len, max-params */

// MODULES //

import dasum from './../../../../blas/base/dasum/lib/base.js';
import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import idamax from './../../../../blas/base/idamax/lib/base.js';


// VARIABLES //

var ITMAX = 5;

// Module-level persistent state (equivalent to Fortran SAVE):
var JUMP = 0;
var J = 0;
var ITER = 0;


// MAIN //

/**
* Estimates the 1-norm of a square real matrix using reverse communication.
*
* This is a reverse communication interface routine. The caller must:
*
* 1.  Set `KASE[0]` = 0 on the first call.
*
* 2.  Call dlacon in a loop. After each return, if `KASE[0]` = 1,
*     compute `x = A*x` and call dlacon again; if `KASE[0]` = 2,
*     compute `x = A^T*x` and call dlacon again; if `KASE[0]` = 0,
*     the estimate is complete and `EST[0]` holds the result.
*
* Unlike dlacn2, this routine uses module-level persistent state instead
* of an ISAVE array for maintaining JUMP, J, JLAST, and ITER between calls.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} v - workspace array of length N
* @param {integer} strideV - stride length for `v`
* @param {NonNegativeInteger} offsetV - starting index for `v`
* @param {Float64Array} x - input/output vector of length N
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Int32Array} ISGN - sign array of length N
* @param {integer} strideISGN - stride length for `ISGN`
* @param {NonNegativeInteger} offsetISGN - starting index for `ISGN`
* @param {Float64Array} EST - in/out: EST[0] is the estimated norm
* @param {Int32Array} KASE - in/out: KASE[0] is the operation to perform
*/
function dlacon( N, v, strideV, offsetV, x, strideX, offsetX, ISGN, strideISGN, offsetISGN, EST, KASE ) {
	var altsgn;
	var estold;
	var jlast;
	var temp;
	var xs;
	var ix;
	var ii;
	var si;
	var i;

	if ( KASE[ 0 ] === 0 ) {
		ix = offsetX;
		for ( i = 0; i < N; i++ ) {
			x[ ix ] = 1.0 / N;
			ix += strideX;
		}
		KASE[ 0 ] = 1;
		JUMP = 1;
		return;
	}

	// Computed goto equivalent: dispatch on JUMP
	switch ( JUMP ) {
	case 1:
		// First iteration entry point (label 20)
		if ( N === 1 ) {
			v[ offsetV ] = x[ offsetX ];
			EST[ 0 ] = Math.abs( v[ offsetV ] );

			// Done
			KASE[ 0 ] = 0;
			return;
		}
		EST[ 0 ] = dasum( N, x, strideX, offsetX );

		ix = offsetX;
		si = offsetISGN;
		for ( i = 0; i < N; i++ ) {
			if ( x[ ix ] >= 0.0 ) {
				x[ ix ] = 1.0;
			} else {
				x[ ix ] = -1.0;
			}
			ISGN[ si ] = Math.round( x[ ix ] );
			ix += strideX;
			si += strideISGN;
		}
		KASE[ 0 ] = 2;
		JUMP = 2;
		return;

	case 2:
		// Label 40
		J = idamax( N, x, strideX, offsetX ); // 0-based index
		ITER = 2;

		// Fall through to label 50: set up unit vector for column J
		ix = offsetX;
		for ( i = 0; i < N; i++ ) {
			x[ ix ] = 0.0;
			ix += strideX;
		}
		x[ offsetX + ( J * strideX ) ] = 1.0;
		KASE[ 0 ] = 1;
		JUMP = 3;
		return;

	case 3:
		// Label 70
		dcopy( N, x, strideX, offsetX, v, strideV, offsetV );
		estold = EST[ 0 ];
		EST[ 0 ] = dasum( N, v, strideV, offsetV );

		// Check for cycling: all signs same as previous iteration
		ix = offsetX;
		si = offsetISGN;
		for ( i = 0; i < N; i++ ) {
			if ( x[ ix ] >= 0.0 ) {
				xs = 1.0;
			} else {
				xs = -1.0;
			}
			ii = Math.round( xs );
			if ( ii !== ISGN[ si ] ) {
				// Signs differ — no cycling
				break;
			}
			ix += strideX;
			si += strideISGN;
		}
		// If i === N, all signs are same — go to label 120 (final stage)
		if ( i === N ) {
			// Label 120: final stage — alternating vector
			altsgn = 1.0;
			ix = offsetX;
			for ( i = 0; i < N; i++ ) {
				x[ ix ] = altsgn * ( 1.0 + ( i / ( N - 1 ) ) );
				altsgn = -altsgn;
				ix += strideX;
			}
			KASE[ 0 ] = 1;
			JUMP = 5;
			return;
		}

		// Check if estimate decreased — if so, go to final stage
		if ( EST[ 0 ] <= estold ) {
			// Label 120: final stage — alternating vector
			altsgn = 1.0;
			ix = offsetX;
			for ( i = 0; i < N; i++ ) {
				x[ ix ] = altsgn * ( 1.0 + ( i / ( N - 1 ) ) );
				altsgn = -altsgn;
				ix += strideX;
			}
			KASE[ 0 ] = 1;
			JUMP = 5;
			return;
		}

		// Update signs and continue iteration
		ix = offsetX;
		si = offsetISGN;
		for ( i = 0; i < N; i++ ) {
			if ( x[ ix ] >= 0.0 ) {
				x[ ix ] = 1.0;
			} else {
				x[ ix ] = -1.0;
			}
			ISGN[ si ] = Math.round( x[ ix ] );
			ix += strideX;
			si += strideISGN;
		}
		KASE[ 0 ] = 2;
		JUMP = 4;
		return;

	case 4:
		// Label 110
		jlast = J;
		J = idamax( N, x, strideX, offsetX ); // 0-based

		if ( ( x[ offsetX + ( jlast * strideX ) ] !== Math.abs( x[ offsetX + ( J * strideX ) ] ) ) && ( ITER < ITMAX ) ) {
			ITER += 1;

			// Go to label 50: set up unit vector for new column
			ix = offsetX;
			for ( i = 0; i < N; i++ ) {
				x[ ix ] = 0.0;
				ix += strideX;
			}
			x[ offsetX + ( J * strideX ) ] = 1.0;
			KASE[ 0 ] = 1;
			JUMP = 3;
			return;
		}

		// Label 120: final stage — alternating vector
		altsgn = 1.0;
		ix = offsetX;
		for ( i = 0; i < N; i++ ) {
			x[ ix ] = altsgn * ( 1.0 + ( i / ( N - 1 ) ) );
			altsgn = -altsgn;
			ix += strideX;
		}
		KASE[ 0 ] = 1;
		JUMP = 5;
		return;

	case 5:
		// Label 140
		temp = 2.0 * ( dasum( N, x, strideX, offsetX ) / ( 3.0 * N ) );
		if ( temp > EST[ 0 ] ) {
			dcopy( N, x, strideX, offsetX, v, strideV, offsetV );
			EST[ 0 ] = temp;
		}
		// Label 150: done
		KASE[ 0 ] = 0;
		break;
	default:
	}
}


// EXPORTS //

export default dlacon;
