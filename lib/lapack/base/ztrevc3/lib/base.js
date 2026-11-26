/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-depth, max-statements, no-mixed-operators, max-lines-per-function */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import dzasum from '../../../../blas/base/dzasum/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zlaset from '../../zlaset/lib/base.js';
import zlatrs from '../../zlatrs/lib/base.js';


// VARIABLES //

const ZERO = 0.0;
const ONE = 1.0;

// Machine constants (hoisted)
const UNFL = dlamch( 'safe-minimum' );
const ULP = dlamch( 'precision' );

// Smallest and largest block sizes of the blocked back-transformation (the reference's PARAMETERs):
const NBMIN = 8;
const NBMAX = 128;

const CONE = new Complex128( ONE, ZERO );
const CZERO = new Complex128( ZERO, ZERO );


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
* As in the reference, the back-transformation (`howmny = 'backtransform'`) is
* blocked, NB vectors at a time with zgemm, when the workspace has at least
* `N + 2*N*NBMIN` (NBMIN = 8) elements, with `NB = min( floor((length-N)/(2*N)), 128 )`;
* otherwise it is done one vector at a time with zgemv. ZLATRS does the
* triangular solves.
*
* @private
* @param {('left'|'right'|'both')} side - `'right'`, `'left'`, or `'both'`
* @param {('all'|'backtransform'|'selected')} howmny - `'all'`, `'backtransform'`, or `'selected'`
* @param {Uint8Array} SELECT - boolean selection array (used only if howmny=`'selected'`)
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
* @param {NonNegativeInteger} mm - number of columns available in VL/VR
* @param {Int32Array} M - output (length-1 array): the number of columns in the arrays VL and/or VR actually used to store the eigenvectors
* @param {Complex128Array} WORK - workspace; length from `offsetWork` at least `max(1,2*N)`; when back-transforming, a length of at least `N + 2*N*8` enables the blocked back-transformation, and `N + 2*N*64` is optimal
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - offset for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace array of length >= N
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - offset for RWORK
* @returns {integer} status code (0 = success)
*/
function ztrevc3( side, howmny, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	let lwork, smin, remax, vv, sv1, sv2, oV, ii, is, ki, iv, nb, cw, k, j, m;

	const rightv = ( side === 'right' || side === 'both' );
	const leftv = ( side === 'left' || side === 'both' );

	const over = ( howmny === 'backtransform' );
	const somev = ( howmny === 'selected' );

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
	M[ 0 ] = m;

	if ( N === 0 ) {
		return 0;
	}

	// As in the reference, use the blocked back-transformation (NB vectors at a time, with zgemm) when back-transforming and WORK has room for at least NBMIN of them; otherwise NB = 1 (zgemv, one vector at a time):
	lwork = Math.floor( ( WORK.length - offsetWork ) / Math.abs( strideWork ) );
	if ( over && lwork >= N + ( 2 * N * NBMIN ) ) {
		nb = Math.floor( ( lwork - N ) / ( 2 * N ) );
		nb = Math.min( nb, NBMAX );
		zlaset( 'all', N, 1 + ( 2 * nb ), CZERO, CZERO, WORK, 1, N, offsetWork );
	} else {
		nb = 1;
	}

	// Set constants
	const smlnum = UNFL * ( N / ULP );

	// Allocate the scale output for zlatrs
	const scale = new Float64Array( 1 );

	// Get Float64 views
	const tv = reinterpret( T, 0 );
	const st1 = strideT1 * 2;
	const st2 = strideT2 * 2;
	const oT = offsetT * 2;

	// WORK layout (the reference's), an N-by-(1+2*NB) column-major matrix:
	// column 0: the original diagonal of T;
	// columns 1..NB (Fortran IV = 1..NB): the vectors being computed (with NB = 1, column 1 only);
	// columns NB+1..2*NB: the back-transformed block (blocked path only).
	const wv = reinterpret( WORK, 0 );

	// Store original diagonal elements of T in WORK[0..N-1]
	for ( k = 0; k < N; k++ ) {
		wv[ ( offsetWork + k ) * 2 ] = tv[ oT + k * st1 + k * st2 ];
		wv[ ( offsetWork + k ) * 2 + 1 ] = tv[ oT + k * st1 + k * st2 + 1 ];
	}

	// Compute 1-norm of each column of strictly upper triangular part of T for RWORK
	const rv = RWORK;
	rv[ offsetRWork ] = ZERO;
	for ( j = 1; j < N; j++ ) {
		rv[ offsetRWork + j * strideRWork ] = dzasum( j, T, strideT1, offsetT + j * strideT2 );
	}

	if ( rightv ) {
		// Compute right eigenvectors
		iv = nb;
		is = m - 1;
		for ( ki = N - 1; ki >= 0; ki-- ) {
			if ( somev ) {
				if ( !SELECT[ offsetSELECT + ki * strideSELECT ] ) {
					continue;
				}
			}
			smin = Math.max( ULP * cabs1( tv, oT + ki * st1 + ki * st2 ), smlnum );

			// Column IV of WORK (Fortran numbering) holds the vector being computed:
			cw = offsetWork + ( iv * N );

			// Set WORK[N+ki] = 1 (the ki-th component of the eigenvector)
			wv[ ( cw + ki ) * 2 ] = ONE;
			wv[ ( cw + ki ) * 2 + 1 ] = ZERO;

			// Form right-hand side: WORK[N+k] = -T(k,ki) for k=0..ki-1
			for ( k = 0; k < ki; k++ ) {
				wv[ ( cw + k ) * 2 ] = -tv[ oT + k * st1 + ki * st2 ];
				wv[ ( cw + k ) * 2 + 1 ] = -tv[ oT + k * st1 + ki * st2 + 1 ];
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
				zlatrs( 'upper', 'no-transpose', 'non-unit', 'yes', ki, T, strideT1, strideT2, offsetT, WORK, strideWork, cw, scale, RWORK, strideRWork, offsetRWork );

				// WORK[N+ki] = scale
				wv[ ( cw + ki ) * 2 ] = scale[ 0 ];
				wv[ ( cw + ki ) * 2 + 1 ] = ZERO;
			}

			// Copy the vector or back-transform
			if ( !over ) {
				// No back-transform: copy to VR and normalize
				vv = reinterpret( VR, 0 );
				sv1 = strideVR1 * 2;
				sv2 = strideVR2 * 2;
				oV = offsetVR * 2;

				zcopy( ki + 1, WORK, strideWork, cw, VR, strideVR1, offsetVR + is * strideVR2 );

				ii = izamax( ki + 1, VR, strideVR1, offsetVR + is * strideVR2 );
				remax = ONE / cabs1( vv, oV + ii * sv1 + is * sv2 );
				zdscal( ki + 1, remax, VR, strideVR1, offsetVR + is * strideVR2 );

				// Zero out below ki
				for ( k = ki + 1; k < N; k++ ) {
					vv[ oV + k * sv1 + is * sv2 ] = ZERO;
					vv[ oV + k * sv1 + is * sv2 + 1 ] = ZERO;
				}
			} else if ( nb === 1 ) {
				// Back-transform with ZGEMV: VR(:,ki) = VR * work
				vv = reinterpret( VR, 0 );
				sv1 = strideVR1 * 2;
				sv2 = strideVR2 * 2;
				oV = offsetVR * 2;

				if ( ki > 0 ) {
					zgemv( 'no-transpose', N, ki, new Complex128( ONE, ZERO ), VR, strideVR1, strideVR2, offsetVR, WORK, strideWork, cw, new Complex128( scale[ 0 ], ZERO ), VR, strideVR1, offsetVR + ki * strideVR2 );
				}

				ii = izamax( N, VR, strideVR1, offsetVR + ki * strideVR2 );
				remax = ONE / cabs1( vv, oV + ii * sv1 + ki * sv2 );
				zdscal( N, remax, VR, strideVR1, offsetVR + ki * strideVR2 );
			} else {
				// Blocked: zero the rest of the vector; once the block is full, or the last vector is in, form VR*WORK with zgemm, normalize, and copy it into VR
				for ( k = ki + 1; k < N; k++ ) {
					wv[ ( cw + k ) * 2 ] = ZERO;
					wv[ ( ( cw + k ) * 2 ) + 1 ] = ZERO;
				}
				if ( iv === 1 || ki === 0 ) {
					zgemm( 'no-transpose', 'no-transpose', N, nb - iv + 1, ki + 1 + nb - iv, CONE, VR, strideVR1, strideVR2, offsetVR, WORK, 1, N, offsetWork + ( iv * N ), CZERO, WORK, 1, N, offsetWork + ( ( nb + iv ) * N ) );
					for ( k = iv; k <= nb; k++ ) {
						ii = izamax( N, WORK, 1, offsetWork + ( ( nb + k ) * N ) );
						remax = ONE / cabs1( wv, ( offsetWork + ii + ( ( nb + k ) * N ) ) * 2 );
						zdscal( N, remax, WORK, 1, offsetWork + ( ( nb + k ) * N ) );
					}
					zlacpy( 'all', N, nb - iv + 1, WORK, 1, N, offsetWork + ( ( nb + iv ) * N ), VR, strideVR1, strideVR2, offsetVR + ( ki * strideVR2 ) );
					iv = nb;
				} else {
					iv -= 1;
				}
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
		iv = 1;
		is = 0;
		for ( ki = 0; ki < N; ki++ ) {
			if ( somev ) {
				if ( !SELECT[ offsetSELECT + ki * strideSELECT ] ) {
					continue;
				}
			}
			smin = Math.max( ULP * cabs1( tv, oT + ki * st1 + ki * st2 ), smlnum );

			// Column IV of WORK (Fortran numbering) holds the vector being computed:
			cw = offsetWork + ( iv * N );

			// Set WORK[N+ki] = 1
			wv[ ( cw + ki ) * 2 ] = ONE;
			wv[ ( cw + ki ) * 2 + 1 ] = ZERO;

			// Form right-hand side: WORK[N+k] = -conj(T(ki,k)) for k=ki+1..N-1
			for ( k = ki + 1; k < N; k++ ) {
				// -conj(T(ki,k))
				wv[ ( cw + k ) * 2 ] = -tv[ oT + ki * st1 + k * st2 ];
				wv[ ( cw + k ) * 2 + 1 ] = tv[ oT + ki * st1 + k * st2 + 1 ];
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
				zlatrs( 'upper', 'conjugate-transpose', 'non-unit', 'yes', N - ki - 1, T, strideT1, strideT2, offsetT + ( ki + 1 ) * strideT1 + ( ki + 1 ) * strideT2, WORK, strideWork, cw + ki + 1, scale, RWORK, strideRWork, offsetRWork );
				wv[ ( cw + ki ) * 2 ] = scale[ 0 ];
				wv[ ( cw + ki ) * 2 + 1 ] = ZERO;
			}

			// Copy the vector or back-transform
			if ( !over ) {
				vv = reinterpret( VL, 0 );
				sv1 = strideVL1 * 2;
				sv2 = strideVL2 * 2;
				oV = offsetVL * 2;

				zcopy( N - ki, WORK, strideWork, cw + ki, VL, strideVL1, offsetVL + ki * strideVL1 + is * strideVL2 );

				ii = izamax( N - ki, VL, strideVL1, offsetVL + ki * strideVL1 + is * strideVL2 ) + ki;
				remax = ONE / cabs1( vv, oV + ii * sv1 + is * sv2 );
				zdscal( N - ki, remax, VL, strideVL1, offsetVL + ki * strideVL1 + is * strideVL2 );

				// Zero out above ki
				for ( k = 0; k < ki; k++ ) {
					vv[ oV + k * sv1 + is * sv2 ] = ZERO;
					vv[ oV + k * sv1 + is * sv2 + 1 ] = ZERO;
				}
			} else if ( nb === 1 ) {
				vv = reinterpret( VL, 0 );
				sv1 = strideVL1 * 2;
				sv2 = strideVL2 * 2;
				oV = offsetVL * 2;

				if ( ki < N - 1 ) {
					zgemv( 'no-transpose', N, N - ki - 1, new Complex128( ONE, ZERO ), VL, strideVL1, strideVL2, offsetVL + ( ki + 1 ) * strideVL2, WORK, strideWork, cw + ki + 1, new Complex128( scale[ 0 ], ZERO ), VL, strideVL1, offsetVL + ki * strideVL2 );
				}

				ii = izamax( N, VL, strideVL1, offsetVL + ki * strideVL2 );
				remax = ONE / cabs1( vv, oV + ii * sv1 + ki * sv2 );
				zdscal( N, remax, VL, strideVL1, offsetVL + ki * strideVL2 );
			} else {
				// Blocked: zero the rest of the vector; once the block is full, or the last vector is in, form VL*WORK with zgemm, normalize, and copy it into VL
				for ( k = 0; k < ki; k++ ) {
					wv[ ( cw + k ) * 2 ] = ZERO;
					wv[ ( ( cw + k ) * 2 ) + 1 ] = ZERO;
				}
				if ( iv === nb || ki === N - 1 ) {
					zgemm( 'no-transpose', 'no-transpose', N, iv, N - ki - 1 + iv, CONE, VL, strideVL1, strideVL2, offsetVL + ( ( ki + 1 - iv ) * strideVL2 ), WORK, 1, N, offsetWork + ( ki + 1 - iv ) + N, CZERO, WORK, 1, N, offsetWork + ( ( nb + 1 ) * N ) );
					for ( k = 1; k <= iv; k++ ) {
						ii = izamax( N, WORK, 1, offsetWork + ( ( nb + k ) * N ) );
						remax = ONE / cabs1( wv, ( offsetWork + ii + ( ( nb + k ) * N ) ) * 2 );
						zdscal( N, remax, WORK, 1, offsetWork + ( ( nb + k ) * N ) );
					}
					zlacpy( 'all', N, iv, WORK, 1, N, offsetWork + ( ( nb + 1 ) * N ), VL, strideVL1, strideVL2, offsetVL + ( ( ki + 1 - iv ) * strideVL2 ) );
					iv = 1;
				} else {
					iv += 1;
				}
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
