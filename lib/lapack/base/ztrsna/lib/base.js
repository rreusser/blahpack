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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dznrm2 from '../../../../blas/base/dznrm2/lib/base.js';
import zdotc from '../../../../blas/base/zdotc/lib/base.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';
import zdrscl from '../../zdrscl/lib/base.js';
import zlacn2 from '../../zlacn2/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zlatrs from '../../zlatrs/lib/base.js';
import ztrexc from '../../ztrexc/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;


// MAIN //

/**
* Estimates reciprocal condition numbers for specified eigenvalues and/or.
* right eigenvectors of a complex upper triangular matrix T (or of any matrix
* Q_T_Q**H with Q unitary).
*
* @private
* @param {string} job - `'eigenvalues'`, `'eigenvectors'`, or `'both'`
* @param {string} howmny - `'all'` or `'selected'`
* @param {(Uint8Array|Array)} SELECT - boolean selection array (used only if howmny=`'selected'`)
* @param {integer} strideSELECT - stride for SELECT
* @param {NonNegativeInteger} offsetSELECT - offset for SELECT
* @param {NonNegativeInteger} N - order of the matrix T
* @param {Complex128Array} T - N-by-N upper triangular matrix
* @param {integer} strideT1 - stride of first dimension of T (in complex elements)
* @param {integer} strideT2 - stride of second dimension of T (in complex elements)
* @param {NonNegativeInteger} offsetT - starting index for T (in complex elements)
* @param {Complex128Array} VL - N-by-mm left eigenvector matrix
* @param {integer} strideVL1 - stride of first dimension of VL (in complex elements)
* @param {integer} strideVL2 - stride of second dimension of VL (in complex elements)
* @param {NonNegativeInteger} offsetVL - starting index for VL (in complex elements)
* @param {Complex128Array} VR - N-by-mm right eigenvector matrix
* @param {integer} strideVR1 - stride of first dimension of VR (in complex elements)
* @param {integer} strideVR2 - stride of second dimension of VR (in complex elements)
* @param {NonNegativeInteger} offsetVR - starting index for VR (in complex elements)
* @param {Float64Array} s - output: reciprocal condition numbers of eigenvalues
* @param {integer} strideS - stride for s
* @param {NonNegativeInteger} offsetS - offset for s
* @param {Float64Array} SEP - output: estimated reciprocal condition numbers of eigenvectors
* @param {integer} strideSEP - stride for SEP
* @param {NonNegativeInteger} offsetSEP - offset for SEP
* @param {NonNegativeInteger} mm - column dimension of VL, VR, and work arrays
* @param {Int32Array} M - output: M[0] = number of condition numbers produced
* @param {Complex128Array} WORK - N-by-(mm+1) complex workspace
* @param {integer} strideWORK1 - stride of first dimension of WORK (in complex elements)
* @param {integer} strideWORK2 - stride of second dimension of WORK (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (in complex elements)
* @param {Float64Array} RWORK - real workspace of length N
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - offset for RWORK
* @returns {integer} info (0 = success)
*/
function ztrsna( job, howmny, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, s, strideS, offsetS, SEP, strideSEP, offsetSEP, mm, M, WORK, strideWORK1, strideWORK2, offsetWORK, RWORK, strideRWORK, offsetRWORK ) {
	var skipEstimate;
	var somcon;
	var wantbh;
	var wantsp;
	var normin;
	var smlnum;
	var wants;
	var xnorm;
	var dummy;
	var isave;
	var scale;
	var prod;
	var rnrm;
	var lnrm;
	var kase;
	var eps;
	var est;
	var sw1;
	var sw2;
	var wii;
	var w11;
	var ks;
	var ix;
	var tv;
	var wv;
	var oW;
	var m;
	var k;
	var i;

	wantbh = ( job === 'both' );
	wants = ( job === 'eigenvalues' ) || wantbh;
	wantsp = ( job === 'eigenvectors' ) || wantbh;
	somcon = ( howmny === 'selected' );

	// Count selected eigenvalues
	if ( somcon ) {
		m = 0;
		for ( k = 0; k < N; k++ ) {
			if ( SELECT[ offsetSELECT + ( k * strideSELECT ) ] ) {
				m += 1;
			}
		}
	} else {
		m = N;
	}
	M[ 0 ] = m;

	if ( N === 0 ) {
		return 0;
	}

	if ( N === 1 ) {
		if ( somcon ) {
			if ( !SELECT[ offsetSELECT ] ) {
				return 0;
			}
		}
		if ( wants ) {
			s[ offsetS ] = ONE;
		}
		if ( wantsp ) {
			tv = reinterpret( T, 0 );
			SEP[ offsetSEP ] = cmplx.absAt( tv, offsetT * 2 );
		}
		return 0;
	}

	// Constants
	eps = dlamch( 'precision' );
	smlnum = dlamch( 'safe-minimum' ) / eps;

	wv = reinterpret( WORK, 0 );
	sw1 = strideWORK1 * 2;
	sw2 = strideWORK2 * 2;

	// Dummy workspace for ztrexc 'no-q' case
	dummy = new Complex128Array( 1 );

	// Scalars for reverse communication
	est = new Float64Array( 1 );
	kase = new Int32Array( 1 );
	isave = new Int32Array( 3 );
	scale = new Float64Array( 1 );

	ks = 0;
	for ( k = 0; k < N; k++ ) {
		if ( somcon ) {
			if ( !SELECT[ offsetSELECT + ( k * strideSELECT ) ] ) {
				continue;
			}
		}

		if ( wants ) {
			// PROD = ZDOTC( N, VR(:,ks), 1, VL(:,ks), 1 )
			prod = zdotc( N, VR, strideVR1, offsetVR + ( ks * strideVR2 ), VL, strideVL1, offsetVL + ( ks * strideVL2 ) );
			rnrm = dznrm2( N, VR, strideVR1, offsetVR + ( ks * strideVR2 ) );
			lnrm = dznrm2( N, VL, strideVL1, offsetVL + ( ks * strideVL2 ) );
			s[ offsetS + ( ks * strideS ) ] = cmplx.abs( prod ) / ( rnrm * lnrm );
		}

		if ( wantsp ) {
			// Copy T to the leading N-by-N block of WORK
			zlacpy( 'full', N, N, T, strideT1, strideT2, offsetT, WORK, strideWORK1, strideWORK2, offsetWORK );

			// Move the eigenvalue at position k+1 (1-based) to the top-left.
			ztrexc( 'none', N, WORK, strideWORK1, strideWORK2, offsetWORK, dummy, 1, 1, 0, k + 1, 1 );

			// Subtract WORK(1,1) from diagonal elements 2..N
			oW = offsetWORK * 2;
			w11 = oW;
			for ( i = 1; i < N; i++ ) {
				wii = oW + ( i * sw1 ) + ( i * sw2 );
				wv[ wii ] -= wv[ w11 ];
				wv[ wii + 1 ] -= wv[ w11 + 1 ];
			}

			// Estimate 1-norm of inverse of T22 (the trailing (N-1)x(N-1) block)
			SEP[ offsetSEP + ( ks * strideSEP ) ] = ZERO;
			est[ 0 ] = ZERO;
			kase[ 0 ] = 0;
			normin = 'no';
			isave[ 0 ] = 0;
			isave[ 1 ] = 0;
			isave[ 2 ] = 0;
			skipEstimate = false;

			// Reverse-communication loop with zlacn2. Column n+1 of WORK

			// (offsetWORK + N*strideWORK2) is the V workspace; column 0 is X.
			while ( true ) { // eslint-disable-line no-constant-condition
				zlacn2( N - 1, WORK, strideWORK1, offsetWORK + ( N * strideWORK2 ), WORK, strideWORK1, offsetWORK, est, kase, isave, 1, 0 );
				if ( kase[ 0 ] === 0 ) {
					break;
				}
				if ( kase[ 0 ] === 1 ) {
					// Solve T22**H * X = scale*X
					zlatrs( 'upper', 'conjugate-transpose', 'non-unit', normin, N - 1, WORK, strideWORK1, strideWORK2, offsetWORK + strideWORK1 + strideWORK2, WORK, strideWORK1, offsetWORK, scale, RWORK, strideRWORK, offsetRWORK );
				} else {
					// Solve T22 * X = scale*X
					zlatrs( 'upper', 'no-transpose', 'non-unit', normin, N - 1, WORK, strideWORK1, strideWORK2, offsetWORK + strideWORK1 + strideWORK2, WORK, strideWORK1, offsetWORK, scale, RWORK, strideRWORK, offsetRWORK );
				}
				normin = 'yes';
				if ( scale[ 0 ] !== ONE ) {
					// Multiply X by 1/scale, checking for overflow.
					ix = izamax( N - 1, WORK, strideWORK1, offsetWORK );
					xnorm = cmplx.abs1At( wv, ( offsetWORK + ( ix * strideWORK1 ) ) * 2 );
					if ( scale[ 0 ] < ( xnorm * smlnum ) || scale[ 0 ] === ZERO ) {
						skipEstimate = true;
						break;
					}
					zdrscl( N, scale[ 0 ], WORK, strideWORK1, offsetWORK );
				}
			}

			if ( !skipEstimate ) {
				SEP[ offsetSEP + ( ks * strideSEP ) ] = ONE / Math.max( est[ 0 ], smlnum );
			}
		}

		ks += 1;
	}

	return 0;
}


// EXPORTS //

export default ztrsna;
