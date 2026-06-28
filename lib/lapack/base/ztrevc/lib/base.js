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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dzasum from '../../../../blas/base/dzasum/lib/base.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zlatrs from '../../zlatrs/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var CMONE = new Complex128( 1.0, 0.0 );

var UNFL = dlamch( 'safe-minimum' );
var ULP = dlamch( 'precision' );


// FUNCTIONS //

/**
* Computes CABS1(z) = |Re(z)| + |Im(z)| from a Float64 view at index idx.
*
* @private
* @param {Float64Array} v - Float64 view of complex array
* @param {integer} idx - Float64 index (points to real part)
* @returns {number} CABS1 value
*/
function cabs1At( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Computes some or all of the right and/or left eigenvectors of a complex upper triangular matrix T.
*
* The right eigenvector x and the left eigenvector y of T corresponding
* to an eigenvalue w are defined by: T\*x = w\*x, y^H\*T = w\*y^H
*
* @private
* @param {string} side - `'right'`, `'left'`, or `'both'`
* @param {string} howmny - `'all'`, `'backtransform'`, or `'selected'`
* @param {(Uint8Array|Array)} SELECT - boolean selection array (used only if howmny=`'selected'`)
* @param {integer} strideSELECT - stride for SELECT
* @param {NonNegativeInteger} offsetSELECT - offset for SELECT
* @param {NonNegativeInteger} N - order of matrix T
* @param {Complex128Array} T - upper triangular Schur matrix (N x N)
* @param {integer} strideT1 - first dimension stride of T (complex elements)
* @param {integer} strideT2 - second dimension stride of T (complex elements)
* @param {NonNegativeInteger} offsetT - offset for T (complex elements)
* @param {Complex128Array} VL - left eigenvector matrix
* @param {integer} strideVL1 - first dimension stride of VL (complex elements)
* @param {integer} strideVL2 - second dimension stride of VL (complex elements)
* @param {NonNegativeInteger} offsetVL - offset for VL (complex elements)
* @param {Complex128Array} VR - right eigenvector matrix
* @param {integer} strideVR1 - first dimension stride of VR (complex elements)
* @param {integer} strideVR2 - second dimension stride of VR (complex elements)
* @param {NonNegativeInteger} offsetVR - offset for VR (complex elements)
* @param {integer} mm - number of columns available in VL/VR
* @param {integer} M - (unused input, overwritten with actual count)
* @param {Complex128Array} WORK - complex workspace of length at least 2*N
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - offset for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace of length at least N
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - offset for RWORK
* @returns {integer} info (0 = success)
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
*
* var T = new Complex128Array( [ 2, 1, 0, 0, 0, 0, 1, 0.5, 3, -1, 0, 0, 0.5, -0.5, 1, 1, 4, 0.5 ] );
* var VR = new Complex128Array( 9 );
* var VL = new Complex128Array( 9 );
* var WORK = new Complex128Array( 6 );
* var RWORK = new Float64Array( 3 );
*
* var info = ztrevc( 'both', 'all', new Uint8Array( 3 ), 1, 0, 3, T, 1, 3, 0, VL, 1, 3, 0, VR, 1, 3, 0, 3, 0, WORK, 1, 0, RWORK, 1, 0 );
* // info => 0
*/
function ztrevc( side, howmny, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) { // eslint-disable-line max-len, max-params
	var rightv;
	var smlnum;
	var bothv;
	var leftv;
	var somev;
	var remax;
	var scale;
	var over;
	var smin;
	var sVL1;
	var sVL2;
	var sVR1;
	var sVR2;
	var vlv;
	var vrv;
	var sT1;
	var sT2;
	var oVL;
	var oVR;
	var tv;
	var wv;
	var sW;
	var oT;
	var oW;
	var is;
	var ki;
	var ii;
	var re;
	var im;
	var j;
	var k;
	var m;

	// Decode side
	bothv = ( side === 'both' );
	rightv = ( side === 'right' ) || bothv;
	leftv = ( side === 'left' ) || bothv;

	// Decode howmny
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

	// Quick return
	if ( N === 0 ) {
		return 0;
	}

	// Machine constants
	smlnum = UNFL * ( N / ULP );

	// Float64 views for element access
	tv = reinterpret( T, 0 );
	wv = reinterpret( WORK, 0 );
	vlv = reinterpret( VL, 0 );
	vrv = reinterpret( VR, 0 );

	// Float64 strides (complex stride * 2)
	sT1 = strideT1 * 2;
	sT2 = strideT2 * 2;
	sVL1 = strideVL1 * 2;
	sVL2 = strideVL2 * 2;
	sVR1 = strideVR1 * 2;
	sVR2 = strideVR2 * 2;
	sW = strideWork * 2;
	oT = offsetT * 2;
	oVL = offsetVL * 2;
	oVR = offsetVR * 2;
	oW = offsetWork * 2;

	// scale is passed to zlatrs as Float64Array
	scale = new Float64Array( 1 );

	// Store the diagonal of T in WORK(N..2N-1) (complex elements N through 2N-1)
	for ( j = 0; j < N; j++ ) {
		// WORK(j+N) = T(j,j) -- copy diagonal
		wv[ oW + ( j + N ) * sW ] = tv[ oT + j * sT1 + j * sT2 ];
		wv[ oW + ( j + N ) * sW + 1 ] = tv[ oT + j * sT1 + j * sT2 + 1 ];
	}

	// Compute column norms of strictly upper triangular part into RWORK
	RWORK[ offsetRWork ] = ZERO;
	for ( j = 1; j < N; j++ ) {
		// Dzasum expects Complex128Array, stride in complex elements, offset in complex elements
		RWORK[ offsetRWork + j * strideRWork ] = dzasum( j, T, strideT1, offsetT + j * strideT2 );
	}

	// ---- Right eigenvectors ----
	if ( rightv ) {
		is = m - 1; // 0-based column index in VR (counts down)
		for ( ki = N - 1; ki >= 0; ki-- ) {
			if ( somev ) {
				if ( !SELECT[ offsetSELECT + ki * strideSELECT ] ) {
					continue;
				}
			}
			smin = Math.max( ULP * cabs1At( tv, oT + ki * sT1 + ki * sT2 ), smlnum );

			// WORK(0) = CMONE (1,0)
			wv[ oW ] = ONE;
			wv[ oW + 1 ] = ZERO;

			// Form right-hand side: WORK(k) = -T(k,ki) for k=0..ki-1
			for ( k = 0; k < ki; k++ ) {
				// WORK(k) = -T(k, ki)
				wv[ oW + k * sW ] = -tv[ oT + k * sT1 + ki * sT2 ];
				wv[ oW + k * sW + 1 ] = -tv[ oT + k * sT1 + ki * sT2 + 1 ];
			}

			// Modify diagonal of T: T(k,k) = T(k,k) - T(ki,ki), clamped by smin
			for ( k = 0; k < ki; k++ ) {
				// T(k,k) -= T(ki,ki)
				tv[ oT + k * sT1 + k * sT2 ] -= tv[ oT + ki * sT1 + ki * sT2 ];
				tv[ oT + k * sT1 + k * sT2 + 1 ] -= tv[ oT + ki * sT1 + ki * sT2 + 1 ];
				if ( cabs1At( tv, oT + k * sT1 + k * sT2 ) < smin ) {
					tv[ oT + k * sT1 + k * sT2 ] = smin;
					tv[ oT + k * sT1 + k * sT2 + 1 ] = ZERO;
				}
			}

			if ( ki > 0 ) {
				// Solve upper triangular system using zlatrs
				// zlatrs( uplo, trans, diag, normin, N, A, strideA1, strideA2, offsetA, x, strideX, offsetX, scale, CNORM, strideCNORM, offsetCNORM )
				zlatrs( 'upper', 'no-transpose', 'non-unit', 'yes', ki, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork, scale, RWORK, strideRWork, offsetRWork );

				// WORK(ki) = scale
				wv[ oW + ki * sW ] = scale[ 0 ];
				wv[ oW + ki * sW + 1 ] = ZERO;
			}

			if ( over ) {
				// Back-transform: VR(:,ki) = VR(:,0:ki-1) * WORK(0:ki-1) + scale * VR(:,ki)
				if ( ki > 0 ) {
					zgemv( 'no-transpose', N, ki, CMONE, VR, strideVR1, strideVR2, offsetVR, WORK, strideWork, offsetWork, new Complex128( scale[ 0 ], 0.0 ), VR, strideVR1, offsetVR + ki * strideVR2 );
				}

				ii = izamax( N, VR, strideVR1, offsetVR + ki * strideVR2 );
				remax = ONE / cabs1At( vrv, oVR + ii * sVR1 + ki * sVR2 );
				zdscal( N, remax, VR, strideVR1, offsetVR + ki * strideVR2 );
			} else {
				// Copy WORK(0..ki) to VR(0..ki, is)
				zcopy( ki + 1, WORK, strideWork, offsetWork, VR, strideVR1, offsetVR + is * strideVR2 );

				// Find element with largest CABS1 for normalization
				ii = izamax( ki + 1, VR, strideVR1, offsetVR + is * strideVR2 );
				remax = ONE / cabs1At( vrv, oVR + ii * sVR1 + is * sVR2 );
				zdscal( ki + 1, remax, VR, strideVR1, offsetVR + is * strideVR2 );

				// Zero out elements ki+1..N-1
				for ( k = ki + 1; k < N; k++ ) {
					vrv[ oVR + k * sVR1 + is * sVR2 ] = ZERO;
					vrv[ oVR + k * sVR1 + is * sVR2 + 1 ] = ZERO;
				}
			}

			// Restore diagonal of T from WORK(k+N)
			for ( k = 0; k < ki; k++ ) {
				tv[ oT + k * sT1 + k * sT2 ] = wv[ oW + ( k + N ) * sW ];
				tv[ oT + k * sT1 + k * sT2 + 1 ] = wv[ oW + ( k + N ) * sW + 1 ];
			}

			is -= 1;
		}
	}

	// ---- Left eigenvectors ----
	if ( leftv ) {
		is = 0; // 0-based column index in VL (counts up)
		for ( ki = 0; ki < N; ki++ ) {
			if ( somev ) {
				if ( !SELECT[ offsetSELECT + ki * strideSELECT ] ) {
					continue;
				}
			}
			smin = Math.max( ULP * cabs1At( tv, oT + ki * sT1 + ki * sT2 ), smlnum );

			// WORK(N-1) = CMONE (use index N-1 as the ki-th slot marker, but Fortran uses WORK(N)=CMONE)

			// In Fortran: WORK(N) = CMONE; here we use 0-based: WORK(N-1) would be wrong.

			// Actually re-reading: Fortran WORK(N) = CMONE, and WORK(K) for K=KI+1..N.

			// In 0-based: WORK(N-1) = CMONE
			wv[ oW + ( N - 1 ) * sW ] = ONE;
			wv[ oW + ( N - 1 ) * sW + 1 ] = ZERO;

			// Form right-hand side: WORK(k) = -conj(T(ki,k)) for k=ki+1..N-1
			for ( k = ki + 1; k < N; k++ ) {
				// WORK(k) = -conj(T(ki,k))
				re = tv[ oT + ki * sT1 + k * sT2 ];
				im = tv[ oT + ki * sT1 + k * sT2 + 1 ];
				wv[ oW + k * sW ] = -re;
				wv[ oW + k * sW + 1 ] = im; // conjugate: negate imag, then negate both = negate real, keep imag
			}

			// Modify diagonal: T(k,k) -= T(ki,ki), clamped by smin
			for ( k = ki + 1; k < N; k++ ) {
				tv[ oT + k * sT1 + k * sT2 ] -= tv[ oT + ki * sT1 + ki * sT2 ];
				tv[ oT + k * sT1 + k * sT2 + 1 ] -= tv[ oT + ki * sT1 + ki * sT2 + 1 ];
				if ( cabs1At( tv, oT + k * sT1 + k * sT2 ) < smin ) {
					tv[ oT + k * sT1 + k * sT2 ] = smin;
					tv[ oT + k * sT1 + k * sT2 + 1 ] = ZERO;
				}
			}

			if ( ki < N - 1 ) {
				// Solve using conjugate transpose of upper triangular part
				// Zlatrs on T(ki+1:N-1, ki+1:N-1)
				zlatrs( 'upper', 'conjugate-transpose', 'non-unit', 'yes', N - ki - 1, T, strideT1, strideT2, offsetT + ( ki + 1 ) * strideT1 + ( ki + 1 ) * strideT2, WORK, strideWork, offsetWork + ( ki + 1 ) * strideWork, scale, RWORK, strideRWork, offsetRWork );

				// WORK(ki) = scale
				wv[ oW + ki * sW ] = scale[ 0 ];
				wv[ oW + ki * sW + 1 ] = ZERO;
			}

			if ( over ) {
				// Back-transform
				if ( ki < N - 1 ) {
					zgemv( 'no-transpose', N, N - ki - 1, CMONE, VL, strideVL1, strideVL2, offsetVL + ( ki + 1 ) * strideVL2, WORK, strideWork, offsetWork + ( ki + 1 ) * strideWork, new Complex128( scale[ 0 ], 0.0 ), VL, strideVL1, offsetVL + ki * strideVL2 );
				}

				ii = izamax( N, VL, strideVL1, offsetVL + ki * strideVL2 );
				remax = ONE / cabs1At( vlv, oVL + ii * sVL1 + ki * sVL2 );
				zdscal( N, remax, VL, strideVL1, offsetVL + ki * strideVL2 );
			} else {
				// Copy WORK(ki..N-1) to VL(ki..N-1, is)
				zcopy( N - ki, WORK, strideWork, offsetWork + ki * strideWork, VL, strideVL1, offsetVL + ki * strideVL1 + is * strideVL2 );

				// Find element with largest CABS1 for normalization
				ii = izamax( N - ki, VL, strideVL1, offsetVL + ki * strideVL1 + is * strideVL2 ) + ki;
				remax = ONE / cabs1At( vlv, oVL + ii * sVL1 + is * sVL2 );
				zdscal( N - ki, remax, VL, strideVL1, offsetVL + ki * strideVL1 + is * strideVL2 );

				// Zero out elements 0..ki-1
				for ( k = 0; k < ki; k++ ) {
					vlv[ oVL + k * sVL1 + is * sVL2 ] = ZERO;
					vlv[ oVL + k * sVL1 + is * sVL2 + 1 ] = ZERO;
				}
			}

			// Restore diagonal of T from WORK(k+N)
			for ( k = ki + 1; k < N; k++ ) {
				tv[ oT + k * sT1 + k * sT2 ] = wv[ oW + ( k + N ) * sW ];
				tv[ oT + k * sT1 + k * sT2 + 1 ] = wv[ oW + ( k + N ) * sW + 1 ];
			}

			is += 1;
		}
	}

	return 0;
}


// EXPORTS //

export default ztrevc;
