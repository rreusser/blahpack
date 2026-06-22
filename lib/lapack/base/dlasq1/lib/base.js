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
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import dlas2 from '../../dlas2/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
import dlasq2 from '../../dlasq2/lib/base.js';
import dlasrt from '../../dlasrt/lib/base.js';


// VARIABLES //

var ZERO = 0.0;


// MAIN //

/**
* Computes all the singular values of a real upper bidiagonal matrix of.
* order N. The singular values are computed to high relative accuracy,
* in the absence of denormalization, underflow, and overflow.
*
* The algorithm is the dqds procedure (differential quotient-difference
* with shifts).
*
* @private
* @param {NonNegativeInteger} N - number of rows and columns
* @param {Float64Array} d - diagonal elements of the bidiagonal matrix, length N
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - off-diagonal elements of the bidiagonal matrix, length N-1
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} WORK - workspace array of length at least 4*N
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @returns {integer} info - status code (0 = success)
*/
function dlasq1( N, d, strideD, offsetD, e, strideE, offsetE, WORK, strideWORK, offsetWORK ) {
	var safmin;
	var sigmx;
	var sigmn;
	var scale;
	var info;
	var eps;
	var out;
	var id;
	var ie;
	var iw;
	var i;

	info = 0;

	if ( N < 0 ) {
		return -1;
	}
	if ( N === 0 ) {
		return 0;
	}
	if ( N === 1 ) {
		d[ offsetD ] = Math.abs( d[ offsetD ] );
		return 0;
	}
	if ( N === 2 ) {
		out = new Float64Array( 2 );
		dlas2( d[ offsetD ], e[ offsetE ], d[ offsetD + strideD ], out );
		sigmn = out[ 0 ];
		sigmx = out[ 1 ];
		d[ offsetD ] = sigmx;
		d[ offsetD + strideD ] = sigmn;
		return 0;
	}

	// General case: N >= 3

	// Take absolute values of D and find max |E|
	sigmx = ZERO;
	id = offsetD;
	ie = offsetE;
	for ( i = 0; i < N - 1; i++ ) {
		d[ id ] = Math.abs( d[ id ] );
		sigmx = Math.max( sigmx, Math.abs( e[ ie ] ) );
		id += strideD;
		ie += strideE;
	}
	d[ id ] = Math.abs( d[ id ] );

	// Early return if matrix is already diagonal
	if ( sigmx === ZERO ) {
		dlasrt( 'decreasing', N, d, strideD, offsetD );
		return 0;
	}

	// Find overall maximum including D values
	id = offsetD;
	for ( i = 0; i < N; i++ ) {
		sigmx = Math.max( sigmx, d[ id ] );
		id += strideD;
	}

	// Scale
	eps = dlamch( 'Precision' );
	safmin = dlamch( 'Safe minimum' );
	scale = Math.sqrt( eps / safmin );

	// Copy D into odd positions and E into even positions of WORK

	// Fortran: DCOPY(N, D, 1, WORK(1), 2) — WORK(1), WORK(3), WORK(5), ...

	// Fortran: DCOPY(N-1, E, 1, WORK(2), 2) — WORK(2), WORK(4), WORK(6), ...

	// In 0-based with strides: WORK[offset+0], WORK[offset+2*stride], ...
	dcopy( N, d, strideD, offsetD, WORK, 2 * strideWORK, offsetWORK );
	dcopy( N - 1, e, strideE, offsetE, WORK, 2 * strideWORK, offsetWORK + strideWORK );

	// Scale WORK(1:2*N-1) by SCALE/SIGMX

	// dlascl('general', 0, 0, SIGMX, SCALE, 2*N-1, 1, WORK, 2*N-1, IINFO)

	// This treats WORK as a (2*N-1)-by-1 matrix in column-major order

	// strideA1 = strideWORK, strideA2 = (2*N-1)*strideWORK (column stride, but 1 column so irrelevant)
	dlascl( 'general', 0, 0, sigmx, scale, (2 * N) - 1, 1, WORK, strideWORK, ( (2 * N) - 1 ) * strideWORK, offsetWORK );

	// Square all elements: WORK(i) = WORK(i)^2
	iw = offsetWORK;
	for ( i = 0; i < (2 * N) - 1; i++ ) {
		WORK[ iw ] *= WORK[ iw ];
		iw += strideWORK;
	}
	// Set WORK(2*N) = 0
	WORK[ offsetWORK + (( (2 * N) - 1 ) * strideWORK) ] = ZERO;

	// Call dlasq2 to compute eigenvalues of the qd array
	info = dlasq2( N, WORK, strideWORK, offsetWORK );

	if ( info === 0 ) {
		// Success: D(i) = sqrt(WORK(i)), then unscale
		iw = offsetWORK;
		id = offsetD;
		for ( i = 0; i < N; i++ ) {
			d[ id ] = Math.sqrt( WORK[ iw ] );
			id += strideD;
			iw += strideWORK;
		}
		// Unscale: dlascl('general', 0, 0, SCALE, SIGMX, N, 1, D, N, IINFO)
		dlascl( 'general', 0, 0, scale, sigmx, N, 1, d, strideD, N * strideD, offsetD );
	} else if ( info === 2 ) {
		// Convergence not achieved: extract D and E from WORK
		// D(i) = sqrt(WORK(2*i-1)), E(i) = sqrt(WORK(2*i))  [Fortran 1-based]
		// In 0-based: D(i) = sqrt(WORK(2*i)), E(i) = sqrt(WORK(2*i+1))
		id = offsetD;
		ie = offsetE;
		iw = offsetWORK;
		for ( i = 0; i < N; i++ ) {
			d[ id ] = Math.sqrt( WORK[ iw ] );
			if ( i < N - 1 ) {
				e[ ie ] = Math.sqrt( WORK[ iw + strideWORK ] );
				ie += strideE;
			}
			id += strideD;
			iw += 2 * strideWORK;
		}
		// Unscale D and E
		dlascl( 'general', 0, 0, scale, sigmx, N, 1, d, strideD, N * strideD, offsetD );
		dlascl( 'general', 0, 0, scale, sigmx, N, 1, e, strideE, N * strideE, offsetE );
	}

	return info;
}


// EXPORTS //

export default dlasq1;
