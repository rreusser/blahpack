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

/* eslint-disable max-len, max-params, max-depth, max-statements, no-mixed-operators, max-lines-per-function */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import dzasum from '../../../../blas/base/dzasum/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import zlatrs from '../../zlatrs/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;

// Machine constants (hoisted)
var UNFL = dlamch( 'safe-minimum' );
var ULP = dlamch( 'precision' );


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
* Computes some or all of the right and/or left eigenvectors of a complex.
* upper triangular matrix T.
*
* The right eigenvector x and the left eigenvector y of T corresponding
* to an eigenvalue w are defined by:
*   T_x = w_x,     (y**H)_T = w_(y**H)
*
* This implementation uses the NB=1 (non-blocked) back-transformation path
* with ZLATRS for the triangular solve.
*
* @private
* @param {string} side - `'right'`, `'left'`, or `'both'`
* @param {string} howmny - `'all'`, `'backtransform'`, or `'selected'`
* @param {(Uint8Array|Array)} SELECT - boolean selection array (used only if howmny=`'selected'`)
* @param {integer} strideSELECT - stride for SELECT
* @param {NonNegativeInteger} offsetSELECT - offset for SELECT
* @param {NonNegativeInteger} N - order of matrix T
* @param {Complex128Array} T - upper triangular Schur matrix (N x N), modified then restored
* @param {integer} strideT1 - first dimension stride of T (complex elements)
* @param {integer} strideT2 - second dimension stride of T (complex elements)
* @param {NonNegativeInteger} offsetT - offset for T (complex elements)
* @param {Complex128Array} VL - left eigenvector matrix (N x MM)
* @param {integer} strideVL1 - first dimension stride of VL (complex elements)
* @param {integer} strideVL2 - second dimension stride of VL (complex elements)
* @param {NonNegativeInteger} offsetVL - offset for VL (complex elements)
* @param {Complex128Array} VR - right eigenvector matrix (N x MM)
* @param {integer} strideVR1 - first dimension stride of VR (complex elements)
* @param {integer} strideVR2 - second dimension stride of VR (complex elements)
* @param {NonNegativeInteger} offsetVR - offset for VR (complex elements)
* @param {integer} mm - number of columns available in VL/VR
* @param {integer} M - (unused, set internally)
* @param {Complex128Array} WORK - workspace array
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - offset for WORK (complex elements)
* @param {integer} lwork - length of WORK (in complex elements)
* @param {Float64Array} RWORK - real workspace array of length >= N
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - offset for RWORK
* @param {integer} lrwork - length of RWORK
* @returns {integer} info (0 = success)
*/
function ztrevc3( side, howmny, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWork, offsetWork, lwork, RWORK, strideRWork, offsetRWork, lrwork ) {
	var rightv;
	var leftv;
	var over;
	var somev;
	var smlnum;
	var smin;
	var remax;
	var scale;
	var tv;
	var wv;
	var vv;
	var rv;
	var st1;
	var st2;
	var oT;
	var sv1;
	var sv2;
	var oV;
	var ii;
	var is;
	var ki;
	var k;
	var j;
	var m;

	rightv = ( side === 'right' || side === 'both' );
	leftv = ( side === 'left' || side === 'both' );

	over = ( howmny === 'backtransform' );
	somev = ( howmny === 'selected' );

	// Count selected eigenvectors
	if ( somev ) {
		m = 0;
		for ( j = 0; j < N; j++ ) {
			if ( SELECT[ offsetSELECT + j * strideSELECT ] ) {
				m += 1;
			}
		}
	} else {
		m = N;
	}

	if ( N === 0 ) {
		return 0;
	}

	// Set constants
	smlnum = UNFL * ( N / ULP );

	// Allocate the scale output for zlatrs
	scale = new Float64Array( 1 );

	// Get Float64 views
	tv = reinterpret( T, 0 );
	st1 = strideT1 * 2;
	st2 = strideT2 * 2;
	oT = offsetT * 2;

	// Use WORK as complex workspace. Layout: WORK[0..N-1] stores original diagonal

	// WORK[N..2*N-1] stores the working vector for the triangular solve.

	// We use NB=1 path.
	wv = reinterpret( WORK, 0 );

	// Store original diagonal elements of T in WORK[0..N-1]
	for ( k = 0; k < N; k++ ) {
		wv[ ( offsetWork + k ) * 2 ] = tv[ oT + k * st1 + k * st2 ];
		wv[ ( offsetWork + k ) * 2 + 1 ] = tv[ oT + k * st1 + k * st2 + 1 ];
	}

	// Compute 1-norm of each column of strictly upper triangular part of T for RWORK
	rv = RWORK;
	rv[ offsetRWork ] = ZERO;
	for ( j = 1; j < N; j++ ) {
		rv[ offsetRWork + j * strideRWork ] = dzasum( j, T, strideT1, offsetT + j * strideT2 );
	}

	if ( rightv ) {
		// Compute right eigenvectors
		is = m - 1;
		for ( ki = N - 1; ki >= 0; ki-- ) {
			if ( somev ) {
				if ( !SELECT[ offsetSELECT + ki * strideSELECT ] ) {
					continue;
				}
			}
			smin = Math.max( ULP * cabs1( tv, oT + ki * st1 + ki * st2 ), smlnum );

			// Set WORK[N+ki] = 1 (the ki-th component of the eigenvector)
			wv[ ( offsetWork + N + ki ) * 2 ] = ONE;
			wv[ ( offsetWork + N + ki ) * 2 + 1 ] = ZERO;

			// Form right-hand side: WORK[N+k] = -T(k,ki) for k=0..ki-1
			for ( k = 0; k < ki; k++ ) {
				wv[ ( offsetWork + N + k ) * 2 ] = -tv[ oT + k * st1 + ki * st2 ];
				wv[ ( offsetWork + N + k ) * 2 + 1 ] = -tv[ oT + k * st1 + ki * st2 + 1 ];
			}

			// Shift diagonal: T(k,k) -= T(ki,ki) for k=0..ki-1
			for ( k = 0; k < ki; k++ ) {
				tv[ oT + k * st1 + k * st2 ] -= tv[ oT + ki * st1 + ki * st2 ];
				tv[ oT + k * st1 + k * st2 + 1 ] -= tv[ oT + ki * st1 + ki * st2 + 1 ];

				// Clamp small diagonal
				if ( cabs1( tv, oT + k * st1 + k * st2 ) < smin ) {
					tv[ oT + k * st1 + k * st2 ] = smin;
					tv[ oT + k * st1 + k * st2 + 1 ] = ZERO;
				}
			}

			// Solve (T(0:ki-1,0:ki-1) - T(ki,ki)) * x = scale * work
			if ( ki > 0 ) {
				zlatrs( 'upper', 'no-transpose', 'non-unit', 'yes', ki, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork + N, scale, RWORK, strideRWork, offsetRWork );

				// WORK[N+ki] = scale
				wv[ ( offsetWork + N + ki ) * 2 ] = scale[ 0 ];
				wv[ ( offsetWork + N + ki ) * 2 + 1 ] = ZERO;
			}

			// Copy the vector or back-transform
			if ( !over ) {
				// No back-transform: copy to VR and normalize
				vv = reinterpret( VR, 0 );
				sv1 = strideVR1 * 2;
				sv2 = strideVR2 * 2;
				oV = offsetVR * 2;

				zcopy( ki + 1, WORK, strideWork, offsetWork + N, VR, strideVR1, offsetVR + is * strideVR2 );

				ii = izamax( ki + 1, VR, strideVR1, offsetVR + is * strideVR2 );
				remax = ONE / cabs1( vv, oV + ii * sv1 + is * sv2 );
				zdscal( ki + 1, remax, VR, strideVR1, offsetVR + is * strideVR2 );

				// Zero out below ki
				for ( k = ki + 1; k < N; k++ ) {
					vv[ oV + k * sv1 + is * sv2 ] = ZERO;
					vv[ oV + k * sv1 + is * sv2 + 1 ] = ZERO;
				}
			} else {
				// Back-transform with ZGEMV: VR(:,ki) = VR * work
				vv = reinterpret( VR, 0 );
				sv1 = strideVR1 * 2;
				sv2 = strideVR2 * 2;
				oV = offsetVR * 2;

				if ( ki > 0 ) {
					zgemv( 'no-transpose', N, ki, new Complex128( ONE, ZERO ), VR, strideVR1, strideVR2, offsetVR, WORK, strideWork, offsetWork + N, new Complex128( scale[ 0 ], ZERO ), VR, strideVR1, offsetVR + ki * strideVR2 );
				}

				ii = izamax( N, VR, strideVR1, offsetVR + ki * strideVR2 );
				remax = ONE / cabs1( vv, oV + ii * sv1 + ki * sv2 );
				zdscal( N, remax, VR, strideVR1, offsetVR + ki * strideVR2 );
			}

			// Restore original diagonal elements of T
			for ( k = 0; k < ki; k++ ) {
				tv[ oT + k * st1 + k * st2 ] = wv[ ( offsetWork + k ) * 2 ];
				tv[ oT + k * st1 + k * st2 + 1 ] = wv[ ( offsetWork + k ) * 2 + 1 ];
			}

			is -= 1;
		}
	}

	if ( leftv ) {
		// Compute left eigenvectors
		is = 0;
		for ( ki = 0; ki < N; ki++ ) {
			if ( somev ) {
				if ( !SELECT[ offsetSELECT + ki * strideSELECT ] ) {
					continue;
				}
			}
			smin = Math.max( ULP * cabs1( tv, oT + ki * st1 + ki * st2 ), smlnum );

			// Set WORK[N+ki] = 1
			wv[ ( offsetWork + N + ki ) * 2 ] = ONE;
			wv[ ( offsetWork + N + ki ) * 2 + 1 ] = ZERO;

			// Form right-hand side: WORK[N+k] = -conj(T(ki,k)) for k=ki+1..N-1
			for ( k = ki + 1; k < N; k++ ) {
				// -conj(T(ki,k))
				wv[ ( offsetWork + N + k ) * 2 ] = -tv[ oT + ki * st1 + k * st2 ];
				wv[ ( offsetWork + N + k ) * 2 + 1 ] = tv[ oT + ki * st1 + k * st2 + 1 ];
			}

			// Shift diagonal: T(k,k) -= T(ki,ki) for k=ki+1..N-1
			for ( k = ki + 1; k < N; k++ ) {
				tv[ oT + k * st1 + k * st2 ] -= tv[ oT + ki * st1 + ki * st2 ];
				tv[ oT + k * st1 + k * st2 + 1 ] -= tv[ oT + ki * st1 + ki * st2 + 1 ];
				if ( cabs1( tv, oT + k * st1 + k * st2 ) < smin ) {
					tv[ oT + k * st1 + k * st2 ] = smin;
					tv[ oT + k * st1 + k * st2 + 1 ] = ZERO;
				}
			}

			// Solve (T(ki+1:N-1,ki+1:N-1) - T(ki,ki))^H * x = scale * work
			if ( ki < N - 1 ) {
				zlatrs( 'upper', 'conjugate-transpose', 'non-unit', 'yes', N - ki - 1, T, strideT1, strideT2, offsetT + ( ki + 1 ) * strideT1 + ( ki + 1 ) * strideT2, WORK, strideWork, offsetWork + N + ki + 1, scale, RWORK, strideRWork, offsetRWork );
				wv[ ( offsetWork + N + ki ) * 2 ] = scale[ 0 ];
				wv[ ( offsetWork + N + ki ) * 2 + 1 ] = ZERO;
			}

			// Copy the vector or back-transform
			if ( !over ) {
				vv = reinterpret( VL, 0 );
				sv1 = strideVL1 * 2;
				sv2 = strideVL2 * 2;
				oV = offsetVL * 2;

				zcopy( N - ki, WORK, strideWork, offsetWork + N + ki, VL, strideVL1, offsetVL + ki * strideVL1 + is * strideVL2 );

				ii = izamax( N - ki, VL, strideVL1, offsetVL + ki * strideVL1 + is * strideVL2 ) + ki;
				remax = ONE / cabs1( vv, oV + ii * sv1 + is * sv2 );
				zdscal( N - ki, remax, VL, strideVL1, offsetVL + ki * strideVL1 + is * strideVL2 );

				// Zero out above ki
				for ( k = 0; k < ki; k++ ) {
					vv[ oV + k * sv1 + is * sv2 ] = ZERO;
					vv[ oV + k * sv1 + is * sv2 + 1 ] = ZERO;
				}
			} else {
				vv = reinterpret( VL, 0 );
				sv1 = strideVL1 * 2;
				sv2 = strideVL2 * 2;
				oV = offsetVL * 2;

				if ( ki < N - 1 ) {
					zgemv( 'no-transpose', N, N - ki - 1, new Complex128( ONE, ZERO ), VL, strideVL1, strideVL2, offsetVL + ( ki + 1 ) * strideVL2, WORK, strideWork, offsetWork + N + ki + 1, new Complex128( scale[ 0 ], ZERO ), VL, strideVL1, offsetVL + ki * strideVL2 );
				}

				ii = izamax( N, VL, strideVL1, offsetVL + ki * strideVL2 );
				remax = ONE / cabs1( vv, oV + ii * sv1 + ki * sv2 );
				zdscal( N, remax, VL, strideVL1, offsetVL + ki * strideVL2 );
			}

			// Restore original diagonal elements of T
			for ( k = ki + 1; k < N; k++ ) {
				tv[ oT + k * st1 + k * st2 ] = wv[ ( offsetWork + k ) * 2 ];
				tv[ oT + k * st1 + k * st2 + 1 ] = wv[ ( offsetWork + k ) * 2 + 1 ];
			}

			is += 1;
		}
	}

	return 0;
}


// EXPORTS //

export default ztrevc3;
