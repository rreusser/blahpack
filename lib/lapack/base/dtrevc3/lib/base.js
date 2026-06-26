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

/* eslint-disable max-len, max-params, max-depth, no-var, max-statements */

// MODULES //

import daxpy from '../../../../blas/base/daxpy/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import ddot from '../../../../blas/base/ddot/lib/base.js';
import dgemv from '../../../../blas/base/dgemv/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import idamax from '../../../../blas/base/idamax/lib/base.js';
import dlaln2 from '../../dlaln2/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;

// Machine constants (hoisted to module scope)
var UNFL = dlamch( 'safe-minimum' );
var ULP = dlamch( 'precision' );
var SMLNUM = UNFL * ( 1.0 / ULP );  // N/ULP at N=1, close enough
var BIGNUM = ( ONE - ULP ) / SMLNUM;

// Scratch array for dlaln2 output X (2x2)
var X = new Float64Array( 4 );


// MAIN //

/**
* Computes some or all of the right and/or left eigenvectors of a real.
* upper quasi-triangular matrix T.
*
* The right eigenvector x and the left eigenvector y of T corresponding
* to an eigenvalue w are defined by:
*   T_x = w_x,     y**T _ T = w _ y**T
*
* This uses NB=1 (non-blocked) back-transformation.
*
* @private
* @param {string} side - `'right'`, `'left'`, or `'both'`
* @param {string} howmny - `'all'`, `'backtransform'`, or `'selected'`
* @param {(Uint8Array|Array)} SELECT - boolean selection array (used only if howmny=`'selected'`)
* @param {integer} strideSELECT - stride for SELECT
* @param {NonNegativeInteger} offsetSELECT - offset for SELECT
* @param {NonNegativeInteger} N - order of matrix T
* @param {Float64Array} T - quasi-triangular Schur matrix (N x N)
* @param {integer} strideT1 - first dimension stride of T
* @param {integer} strideT2 - second dimension stride of T
* @param {NonNegativeInteger} offsetT - offset for T
* @param {Float64Array} VL - left eigenvector matrix (N x MM)
* @param {integer} strideVL1 - first dimension stride of VL
* @param {integer} strideVL2 - second dimension stride of VL
* @param {NonNegativeInteger} offsetVL - offset for VL
* @param {Float64Array} VR - right eigenvector matrix (N x MM)
* @param {integer} strideVR1 - first dimension stride of VR
* @param {integer} strideVR2 - second dimension stride of VR
* @param {NonNegativeInteger} offsetVR - offset for VR
* @param {integer} mm - number of columns available in VL/VR
* @param {integer} M - (unused, set internally)
* @param {Float64Array} WORK - workspace array of length at least 3*N
* @param {integer} strideWORK - stride for WORK (must be 1)
* @param {NonNegativeInteger} offsetWORK - offset for WORK
* @param {integer} lwork - length of WORK
* @returns {integer} info (0 = success)
*/
function dtrevc3( side, howmny, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWORK, offsetWORK, lwork ) {
	var rightv;
	var bothv;
	var leftv;
	var somev;
	var remax;
	var scale;
	var xnorm;
	var vcrit;
	var over;
	var smin;
	var emax;
	var vmax;
	var beta;
	var pair;
	var jnxt;
	var rec;
	var res;
	var sT1;
	var sT2;
	var wr;
	var wi;
	var ip;
	var is;
	var ki;
	var ii;
	var j1;
	var j2;
	var oT;
	var j;
	var k;
	var m;

	// Decode side
	sT1 = strideT1;
	sT2 = strideT2;
	oT = offsetT;

	bothv = ( side === 'both' );
	rightv = ( side === 'right' ) || bothv;
	leftv = ( side === 'left' ) || bothv;

	over = ( howmny === 'backtransform' );
	somev = ( howmny === 'selected' );

	// Quick return
	if ( N === 0 ) {
		return 0;
	}

	// Compute 1-norm of each column of strictly upper triangular part
	// WORK[0..N-1] stores column norms (0-based)
	WORK[ offsetWORK ] = ZERO;
	for ( j = 1; j < N; j++ ) {
		WORK[ offsetWORK + j ] = ZERO;
		for ( k = 0; k < j; k++ ) {
			WORK[ offsetWORK + j ] += Math.abs( T[ oT + k * sT1 + j * sT2 ] );
		}
	}

	// WORK layout for NB=1:
	// [0..N-1]: column 1-norms
	// [N..2N-1]: column IV=1 (real part or single real vector)
	// [2N..3N-1]: column IV=2 (imaginary part)
	// In Fortran: WORK(i + IV*N) with IV=1,2 and i=1..N
	// In JS 0-based: WORK[offsetWORK + i + IV*N] with IV=1,2 and i=0..N-1

	// Determine M (number of columns)
	if ( somev ) {
		m = 0;
		pair = false;
		for ( j = 0; j < N; j++ ) {
			if ( pair ) {
				pair = false;
			} else if ( j < N - 1 ) {
				if ( T[ oT + ( j + 1 ) * sT1 + j * sT2 ] === ZERO ) {
					if ( SELECT[ offsetSELECT + j * strideSELECT ] ) {
						m += 1;
					}
				} else {
					pair = true;
					if ( SELECT[ offsetSELECT + j * strideSELECT ] || SELECT[ offsetSELECT + ( j + 1 ) * strideSELECT ] ) {
						m += 2;
					}
				}
			} else if ( SELECT[ offsetSELECT + j * strideSELECT ] ) {
				m += 1;
			}
		}
	} else {
		m = N;
	}

	// ============================================================
	// Compute right eigenvectors
	// ============================================================
	if ( rightv ) {
		ip = 0;
		is = m - 1; // 0-based column index in VR (counting from right)

		for ( ki = N - 1; ki >= 0; ki-- ) {
			if ( ip === -1 ) {
				// Previous was second of pair, so this is first; skip
				ip = 1;
				continue;
			} else if ( ki === 0 ) {
				ip = 0;
			} else if ( T[ oT + ki * sT1 + ( ki - 1 ) * sT2 ] === ZERO ) {
				ip = 0;
			} else {
				ip = -1;
			}

			if ( somev ) {
				if ( ip === 0 ) {
					if ( !SELECT[ offsetSELECT + ki * strideSELECT ] ) {
						continue;
					}
				} else if ( !SELECT[ offsetSELECT + ( ki - 1 ) * strideSELECT ] ) {
					continue;
				}
			}

			// Compute the eigenvalue (wr, wi)
			wr = T[ oT + ki * sT1 + ki * sT2 ];
			wi = ZERO;
			if ( ip !== 0 ) {
				wi = Math.sqrt( Math.abs( T[ oT + ki * sT1 + ( ki - 1 ) * sT2 ] ) ) *
					Math.sqrt( Math.abs( T[ oT + ( ki - 1 ) * sT1 + ki * sT2 ] ) );
			}
			smin = Math.max( ULP * ( Math.abs( wr ) + Math.abs( wi ) ), SMLNUM );

			if ( ip === 0 ) {
				// Real right eigenvector
				// IV=2 in Fortran (1-based), maps to column index 2 in WORK layout
				// WORK(k + 2*N) in Fortran 1-based = WORK[offsetWORK + 2*N + (k-1)] in 0-based

				WORK[ offsetWORK + 2 * N + ki ] = ONE;

				// Form right-hand side
				for ( k = 0; k < ki; k++ ) {
					WORK[ offsetWORK + 2 * N + k ] = -T[ oT + k * sT1 + ki * sT2 ];
				}

				// Solve upper quasi-triangular system
				jnxt = ki - 1;
				for ( j = ki - 1; j >= 0; j-- ) {
					if ( j > jnxt ) {
						continue;
					}
					j1 = j;
					j2 = j;
					jnxt = j - 1;
					if ( j > 0 ) {
						if ( T[ oT + j * sT1 + ( j - 1 ) * sT2 ] !== ZERO ) {
							j1 = j - 1;
							jnxt = j - 2;
						}
					}

					if ( j1 === j2 ) {
						// 1x1 diagonal block
						res = dlaln2( false, 1, 1, smin, ONE, T, sT1, sT2, oT + j * sT1 + j * sT2, ONE, ONE, WORK, 1, N, offsetWORK + 2 * N + j, wr, ZERO, X, 1, 2, 0 );
						scale = res.scale;
						xnorm = res.xnorm;

						if ( xnorm > ONE ) {
							if ( WORK[ offsetWORK + j ] > BIGNUM / xnorm ) {
								X[ 0 ] /= xnorm;
								scale /= xnorm;
							}
						}

						if ( scale !== ONE ) {
							dscal( ki + 1, scale, WORK, 1, offsetWORK + 2 * N );
						}
						WORK[ offsetWORK + 2 * N + j ] = X[ 0 ];

						// Update right-hand side
						daxpy( j, -X[ 0 ], T, sT1, oT + j * sT2, WORK, 1, offsetWORK + 2 * N );
					} else {
						// 2x2 diagonal block
						res = dlaln2( false, 2, 1, smin, ONE, T, sT1, sT2, oT + ( j - 1 ) * sT1 + ( j - 1 ) * sT2, ONE, ONE, WORK, 1, N, offsetWORK + 2 * N + ( j - 1 ), wr, ZERO, X, 1, 2, 0 );
						scale = res.scale;
						xnorm = res.xnorm;

						if ( xnorm > ONE ) {
							beta = Math.max( WORK[ offsetWORK + j - 1 ], WORK[ offsetWORK + j ] );
							if ( beta > BIGNUM / xnorm ) {
								X[ 0 ] /= xnorm;
								X[ 1 ] /= xnorm;
								scale /= xnorm;
							}
						}

						if ( scale !== ONE ) {
							dscal( ki + 1, scale, WORK, 1, offsetWORK + 2 * N );
						}
						WORK[ offsetWORK + 2 * N + j - 1 ] = X[ 0 ];
						WORK[ offsetWORK + 2 * N + j ] = X[ 1 ];

						// Update right-hand side
						daxpy( j - 1, -X[ 0 ], T, sT1, oT + ( j - 1 ) * sT2, WORK, 1, offsetWORK + 2 * N );
						daxpy( j - 1, -X[ 1 ], T, sT1, oT + j * sT2, WORK, 1, offsetWORK + 2 * N );
					}
				}

				// Copy the vector x or Q*x to VR and normalize
				if ( !over ) {
					// No back-transform: copy to VR(:, is)
					dcopy( ki + 1, WORK, 1, offsetWORK + 2 * N, VR, strideVR1, offsetVR + is * strideVR2 );

					ii = idamax( ki + 1, VR, strideVR1, offsetVR + is * strideVR2 );
					remax = ONE / Math.abs( VR[ offsetVR + ii * strideVR1 + is * strideVR2 ] );
					dscal( ki + 1, remax, VR, strideVR1, offsetVR + is * strideVR2 );

					for ( k = ki + 1; k < N; k++ ) {
						VR[ offsetVR + k * strideVR1 + is * strideVR2 ] = ZERO;
					}
				} else {
					// Back-transform with GEMV: Q*x
					if ( ki > 0 ) {
						dgemv( 'no-transpose', N, ki, ONE, VR, strideVR1, strideVR2, offsetVR, WORK, 1, offsetWORK + 2 * N, WORK[ offsetWORK + 2 * N + ki ], VR, strideVR1, offsetVR + ki * strideVR2 );
					} else {
						dscal( N, WORK[ offsetWORK + 2 * N + ki ], VR, strideVR1, offsetVR + ki * strideVR2 );
					}

					ii = idamax( N, VR, strideVR1, offsetVR + ki * strideVR2 );
					remax = ONE / Math.abs( VR[ offsetVR + ii * strideVR1 + ki * strideVR2 ] );
					dscal( N, remax, VR, strideVR1, offsetVR + ki * strideVR2 );
				}
			} else {
				// Complex right eigenvector (ip === -1)
				// Uses two columns: IV-1 (real) and IV (imag) in Fortran
				// In our layout: columns at offsets N and 2N in WORK

				if ( Math.abs( T[ oT + ( ki - 1 ) * sT1 + ki * sT2 ] ) >= Math.abs( T[ oT + ki * sT1 + ( ki - 1 ) * sT2 ] ) ) {
					WORK[ offsetWORK + N + ki - 1 ] = ONE;
					WORK[ offsetWORK + 2 * N + ki ] = wi / T[ oT + ( ki - 1 ) * sT1 + ki * sT2 ];
				} else {
					WORK[ offsetWORK + N + ki - 1 ] = -wi / T[ oT + ki * sT1 + ( ki - 1 ) * sT2 ];
					WORK[ offsetWORK + 2 * N + ki ] = ONE;
				}
				WORK[ offsetWORK + N + ki ] = ZERO;
				WORK[ offsetWORK + 2 * N + ki - 1 ] = ZERO;

				// Form right-hand side
				for ( k = 0; k < ki - 1; k++ ) {
					WORK[ offsetWORK + N + k ] = -WORK[ offsetWORK + N + ki - 1 ] * T[ oT + k * sT1 + ( ki - 1 ) * sT2 ];
					WORK[ offsetWORK + 2 * N + k ] = -WORK[ offsetWORK + 2 * N + ki ] * T[ oT + k * sT1 + ki * sT2 ];
				}

				// Solve upper quasi-triangular system
				jnxt = ki - 2;
				for ( j = ki - 2; j >= 0; j-- ) {
					if ( j > jnxt ) {
						continue;
					}
					j1 = j;
					j2 = j;
					jnxt = j - 1;
					if ( j > 0 ) {
						if ( T[ oT + j * sT1 + ( j - 1 ) * sT2 ] !== ZERO ) {
							j1 = j - 1;
							jnxt = j - 2;
						}
					}

					if ( j1 === j2 ) {
						// 1x1 diagonal block
						res = dlaln2( false, 1, 2, smin, ONE, T, sT1, sT2, oT + j * sT1 + j * sT2, ONE, ONE, WORK, 1, N, offsetWORK + N + j, wr, wi, X, 1, 2, 0 );
						scale = res.scale;
						xnorm = res.xnorm;

						if ( xnorm > ONE ) {
							if ( WORK[ offsetWORK + j ] > BIGNUM / xnorm ) {
								X[ 0 ] /= xnorm;
								X[ 2 ] /= xnorm;
								scale /= xnorm;
							}
						}

						if ( scale !== ONE ) {
							dscal( ki + 1, scale, WORK, 1, offsetWORK + N );
							dscal( ki + 1, scale, WORK, 1, offsetWORK + 2 * N );
						}
						WORK[ offsetWORK + N + j ] = X[ 0 ];
						WORK[ offsetWORK + 2 * N + j ] = X[ 2 ];

						// Update right-hand side
						daxpy( j, -X[ 0 ], T, sT1, oT + j * sT2, WORK, 1, offsetWORK + N );
						daxpy( j, -X[ 2 ], T, sT1, oT + j * sT2, WORK, 1, offsetWORK + 2 * N );
					} else {
						// 2x2 diagonal block
						res = dlaln2( false, 2, 2, smin, ONE, T, sT1, sT2, oT + ( j - 1 ) * sT1 + ( j - 1 ) * sT2, ONE, ONE, WORK, 1, N, offsetWORK + N + j - 1, wr, wi, X, 1, 2, 0 );
						scale = res.scale;
						xnorm = res.xnorm;

						if ( xnorm > ONE ) {
							beta = Math.max( WORK[ offsetWORK + j - 1 ], WORK[ offsetWORK + j ] );
							if ( beta > BIGNUM / xnorm ) {
								rec = ONE / xnorm;
								X[ 0 ] *= rec;
								X[ 2 ] *= rec;
								X[ 1 ] *= rec;
								X[ 3 ] *= rec;
								scale *= rec;
							}
						}

						if ( scale !== ONE ) {
							dscal( ki + 1, scale, WORK, 1, offsetWORK + N );
							dscal( ki + 1, scale, WORK, 1, offsetWORK + 2 * N );
						}
						WORK[ offsetWORK + N + j - 1 ] = X[ 0 ];
						WORK[ offsetWORK + N + j ] = X[ 1 ];
						WORK[ offsetWORK + 2 * N + j - 1 ] = X[ 2 ];
						WORK[ offsetWORK + 2 * N + j ] = X[ 3 ];

						// Update right-hand side
						daxpy( j - 1, -X[ 0 ], T, sT1, oT + ( j - 1 ) * sT2, WORK, 1, offsetWORK + N );
						daxpy( j - 1, -X[ 1 ], T, sT1, oT + j * sT2, WORK, 1, offsetWORK + N );
						daxpy( j - 1, -X[ 2 ], T, sT1, oT + ( j - 1 ) * sT2, WORK, 1, offsetWORK + 2 * N );
						daxpy( j - 1, -X[ 3 ], T, sT1, oT + j * sT2, WORK, 1, offsetWORK + 2 * N );
					}
				}

				// Copy vector x or Q*x to VR and normalize
				if ( !over ) {
					dcopy( ki + 1, WORK, 1, offsetWORK + N, VR, strideVR1, offsetVR + ( is - 1 ) * strideVR2 );
					dcopy( ki + 1, WORK, 1, offsetWORK + 2 * N, VR, strideVR1, offsetVR + is * strideVR2 );

					emax = ZERO;
					for ( k = 0; k <= ki; k++ ) {
						emax = Math.max( emax, Math.abs( VR[ offsetVR + k * strideVR1 + ( is - 1 ) * strideVR2 ] ) +
							Math.abs( VR[ offsetVR + k * strideVR1 + is * strideVR2 ] ) );
					}
					remax = ONE / emax;
					dscal( ki + 1, remax, VR, strideVR1, offsetVR + ( is - 1 ) * strideVR2 );
					dscal( ki + 1, remax, VR, strideVR1, offsetVR + is * strideVR2 );

					for ( k = ki + 1; k < N; k++ ) {
						VR[ offsetVR + k * strideVR1 + ( is - 1 ) * strideVR2 ] = ZERO;
						VR[ offsetVR + k * strideVR1 + is * strideVR2 ] = ZERO;
					}
				} else {
					// Back-transform with GEMV
					if ( ki > 1 ) {
						dgemv( 'no-transpose', N, ki - 1, ONE, VR, strideVR1, strideVR2, offsetVR, WORK, 1, offsetWORK + N, WORK[ offsetWORK + N + ki - 1 ], VR, strideVR1, offsetVR + ( ki - 1 ) * strideVR2 );
						dgemv( 'no-transpose', N, ki - 1, ONE, VR, strideVR1, strideVR2, offsetVR, WORK, 1, offsetWORK + 2 * N, WORK[ offsetWORK + 2 * N + ki ], VR, strideVR1, offsetVR + ki * strideVR2 );
					} else {
						dscal( N, WORK[ offsetWORK + N + ki - 1 ], VR, strideVR1, offsetVR + ( ki - 1 ) * strideVR2 );
						dscal( N, WORK[ offsetWORK + 2 * N + ki ], VR, strideVR1, offsetVR + ki * strideVR2 );
					}

					emax = ZERO;
					for ( k = 0; k < N; k++ ) {
						emax = Math.max( emax, Math.abs( VR[ offsetVR + k * strideVR1 + ( ki - 1 ) * strideVR2 ] ) +
							Math.abs( VR[ offsetVR + k * strideVR1 + ki * strideVR2 ] ) );
					}
					remax = ONE / emax;
					dscal( N, remax, VR, strideVR1, offsetVR + ( ki - 1 ) * strideVR2 );
					dscal( N, remax, VR, strideVR1, offsetVR + ki * strideVR2 );
				}
			}

			is -= 1;
			if ( ip !== 0 ) {
				is -= 1;
			}
		}
	}

	// ============================================================
	// Compute left eigenvectors
	// ============================================================
	if ( leftv ) {
		ip = 0;
		is = 0; // 0-based column index in VL

		for ( ki = 0; ki < N; ki++ ) {
			if ( ip === 1 ) {
				// Previous was first of pair, this is second; skip
				ip = -1;
				continue;
			} else if ( ki === N - 1 ) {
				ip = 0;
			} else if ( T[ oT + ( ki + 1 ) * sT1 + ki * sT2 ] === ZERO ) {
				ip = 0;
			} else {
				ip = 1;
			}

			if ( somev ) {
				if ( !SELECT[ offsetSELECT + ki * strideSELECT ] ) {
					continue;
				}
			}

			// Compute eigenvalue (wr, wi)
			wr = T[ oT + ki * sT1 + ki * sT2 ];
			wi = ZERO;
			if ( ip !== 0 ) {
				wi = Math.sqrt( Math.abs( T[ oT + ki * sT1 + ( ki + 1 ) * sT2 ] ) ) *
					Math.sqrt( Math.abs( T[ oT + ( ki + 1 ) * sT1 + ki * sT2 ] ) );
			}
			smin = Math.max( ULP * ( Math.abs( wr ) + Math.abs( wi ) ), SMLNUM );

			if ( ip === 0 ) {
				// Real left eigenvector
				WORK[ offsetWORK + N + ki ] = ONE;

				// Form right-hand side
				for ( k = ki + 1; k < N; k++ ) {
					WORK[ offsetWORK + N + k ] = -T[ oT + ki * sT1 + k * sT2 ];
				}

				// Solve transposed quasi-triangular system
				vmax = ONE;
				vcrit = BIGNUM;

				jnxt = ki + 1;
				for ( j = ki + 1; j < N; j++ ) {
					if ( j < jnxt ) {
						continue;
					}
					j1 = j;
					j2 = j;
					jnxt = j + 1;
					if ( j < N - 1 ) {
						if ( T[ oT + ( j + 1 ) * sT1 + j * sT2 ] !== ZERO ) {
							j2 = j + 1;
							jnxt = j + 2;
						}
					}

					if ( j1 === j2 ) {
						// 1x1 diagonal block
						if ( WORK[ offsetWORK + j ] > vcrit ) {
							rec = ONE / vmax;
							dscal( N - ki, rec, WORK, 1, offsetWORK + N + ki );
							vmax = ONE;
							vcrit = BIGNUM;
						}

						WORK[ offsetWORK + N + j ] -= ddot( j - ki - 1, T, sT1, oT + ( ki + 1 ) * sT1 + j * sT2, WORK, 1, offsetWORK + N + ki + 1 );

						res = dlaln2( false, 1, 1, smin, ONE, T, sT1, sT2, oT + j * sT1 + j * sT2, ONE, ONE, WORK, 1, N, offsetWORK + N + j, wr, ZERO, X, 1, 2, 0 );
						scale = res.scale;

						if ( scale !== ONE ) {
							dscal( N - ki, scale, WORK, 1, offsetWORK + N + ki );
						}
						WORK[ offsetWORK + N + j ] = X[ 0 ];
						vmax = Math.max( Math.abs( WORK[ offsetWORK + N + j ] ), vmax );
						vcrit = BIGNUM / vmax;
					} else {
						// 2x2 diagonal block
						beta = Math.max( WORK[ offsetWORK + j ], WORK[ offsetWORK + j + 1 ] );
						if ( beta > vcrit ) {
							rec = ONE / vmax;
							dscal( N - ki, rec, WORK, 1, offsetWORK + N + ki );
							vmax = ONE;
							vcrit = BIGNUM;
						}

						WORK[ offsetWORK + N + j ] -= ddot( j - ki - 1, T, sT1, oT + ( ki + 1 ) * sT1 + j * sT2, WORK, 1, offsetWORK + N + ki + 1 );

						WORK[ offsetWORK + N + j + 1 ] -= ddot( j - ki - 1, T, sT1, oT + ( ki + 1 ) * sT1 + ( j + 1 ) * sT2, WORK, 1, offsetWORK + N + ki + 1 );

						res = dlaln2( true, 2, 1, smin, ONE, T, sT1, sT2, oT + j * sT1 + j * sT2, ONE, ONE, WORK, 1, N, offsetWORK + N + j, wr, ZERO, X, 1, 2, 0 );
						scale = res.scale;

						if ( scale !== ONE ) {
							dscal( N - ki, scale, WORK, 1, offsetWORK + N + ki );
						}
						WORK[ offsetWORK + N + j ] = X[ 0 ];
						WORK[ offsetWORK + N + j + 1 ] = X[ 1 ];

						vmax = Math.max( Math.abs( WORK[ offsetWORK + N + j ] ), Math.abs( WORK[ offsetWORK + N + j + 1 ] ), vmax );
						vcrit = BIGNUM / vmax;
					}
				}

				// Copy the vector x or Q*x to VL and normalize
				if ( !over ) {
					dcopy( N - ki, WORK, 1, offsetWORK + N + ki, VL, strideVL1, offsetVL + ki * strideVL1 + is * strideVL2 );

					ii = idamax( N - ki, VL, strideVL1, offsetVL + ki * strideVL1 + is * strideVL2 ) + ki;
					remax = ONE / Math.abs( VL[ offsetVL + ii * strideVL1 + is * strideVL2 ] );
					dscal( N - ki, remax, VL, strideVL1, offsetVL + ki * strideVL1 + is * strideVL2 );

					for ( k = 0; k < ki; k++ ) {
						VL[ offsetVL + k * strideVL1 + is * strideVL2 ] = ZERO;
					}
				} else {
					// Back-transform: Q*x
					if ( ki < N - 1 ) {
						dgemv( 'no-transpose', N, N - ki - 1, ONE, VL, strideVL1, strideVL2, offsetVL + ( ki + 1 ) * strideVL2, WORK, 1, offsetWORK + N + ki + 1, WORK[ offsetWORK + N + ki ], VL, strideVL1, offsetVL + ki * strideVL2 );
					} else {
						dscal( N, WORK[ offsetWORK + N + ki ], VL, strideVL1, offsetVL + ki * strideVL2 );
					}

					ii = idamax( N, VL, strideVL1, offsetVL + ki * strideVL2 );
					remax = ONE / Math.abs( VL[ offsetVL + ii * strideVL1 + ki * strideVL2 ] );
					dscal( N, remax, VL, strideVL1, offsetVL + ki * strideVL2 );
				}
			} else {
				// Complex left eigenvector (ip === 1)
				// Uses two columns: IV=1 (real) and IV+1=2 (imag) in Fortran
				// In our layout: columns at offsets N and 2N in WORK

				if ( Math.abs( T[ oT + ki * sT1 + ( ki + 1 ) * sT2 ] ) >= Math.abs( T[ oT + ( ki + 1 ) * sT1 + ki * sT2 ] ) ) {
					WORK[ offsetWORK + N + ki ] = wi / T[ oT + ki * sT1 + ( ki + 1 ) * sT2 ];
					WORK[ offsetWORK + 2 * N + ki + 1 ] = ONE;
				} else {
					WORK[ offsetWORK + N + ki ] = ONE;
					WORK[ offsetWORK + 2 * N + ki + 1 ] = -wi / T[ oT + ( ki + 1 ) * sT1 + ki * sT2 ];
				}
				WORK[ offsetWORK + N + ki + 1 ] = ZERO;
				WORK[ offsetWORK + 2 * N + ki ] = ZERO;

				// Form right-hand side
				for ( k = ki + 2; k < N; k++ ) {
					WORK[ offsetWORK + N + k ] = -WORK[ offsetWORK + N + ki ] * T[ oT + ki * sT1 + k * sT2 ];
					WORK[ offsetWORK + 2 * N + k ] = -WORK[ offsetWORK + 2 * N + ki + 1 ] * T[ oT + ( ki + 1 ) * sT1 + k * sT2 ];
				}

				// Solve transposed quasi-triangular system
				vmax = ONE;
				vcrit = BIGNUM;

				jnxt = ki + 2;
				for ( j = ki + 2; j < N; j++ ) {
					if ( j < jnxt ) {
						continue;
					}
					j1 = j;
					j2 = j;
					jnxt = j + 1;
					if ( j < N - 1 ) {
						if ( T[ oT + ( j + 1 ) * sT1 + j * sT2 ] !== ZERO ) {
							j2 = j + 1;
							jnxt = j + 2;
						}
					}

					if ( j1 === j2 ) {
						// 1x1 diagonal block
						if ( WORK[ offsetWORK + j ] > vcrit ) {
							rec = ONE / vmax;
							dscal( N - ki, rec, WORK, 1, offsetWORK + N + ki );
							dscal( N - ki, rec, WORK, 1, offsetWORK + 2 * N + ki );
							vmax = ONE;
							vcrit = BIGNUM;
						}

						WORK[ offsetWORK + N + j ] -= ddot( j - ki - 2, T, sT1, oT + ( ki + 2 ) * sT1 + j * sT2, WORK, 1, offsetWORK + N + ki + 2 );
						WORK[ offsetWORK + 2 * N + j ] -= ddot( j - ki - 2, T, sT1, oT + ( ki + 2 ) * sT1 + j * sT2, WORK, 1, offsetWORK + 2 * N + ki + 2 );

						// Note: -wi for left eigenvectors (conjugate)
						res = dlaln2( false, 1, 2, smin, ONE, T, sT1, sT2, oT + j * sT1 + j * sT2, ONE, ONE, WORK, 1, N, offsetWORK + N + j, wr, -wi, X, 1, 2, 0 );
						scale = res.scale;

						if ( scale !== ONE ) {
							dscal( N - ki, scale, WORK, 1, offsetWORK + N + ki );
							dscal( N - ki, scale, WORK, 1, offsetWORK + 2 * N + ki );
						}
						WORK[ offsetWORK + N + j ] = X[ 0 ];
						WORK[ offsetWORK + 2 * N + j ] = X[ 2 ];
						vmax = Math.max( Math.abs( WORK[ offsetWORK + N + j ] ), Math.abs( WORK[ offsetWORK + 2 * N + j ] ), vmax );
						vcrit = BIGNUM / vmax;
					} else {
						// 2x2 diagonal block
						beta = Math.max( WORK[ offsetWORK + j ], WORK[ offsetWORK + j + 1 ] );
						if ( beta > vcrit ) {
							rec = ONE / vmax;
							dscal( N - ki, rec, WORK, 1, offsetWORK + N + ki );
							dscal( N - ki, rec, WORK, 1, offsetWORK + 2 * N + ki );
							vmax = ONE;
							vcrit = BIGNUM;
						}

						WORK[ offsetWORK + N + j ] -= ddot( j - ki - 2, T, sT1, oT + ( ki + 2 ) * sT1 + j * sT2, WORK, 1, offsetWORK + N + ki + 2 );
						WORK[ offsetWORK + 2 * N + j ] -= ddot( j - ki - 2, T, sT1, oT + ( ki + 2 ) * sT1 + j * sT2, WORK, 1, offsetWORK + 2 * N + ki + 2 );
						WORK[ offsetWORK + N + j + 1 ] -= ddot( j - ki - 2, T, sT1, oT + ( ki + 2 ) * sT1 + ( j + 1 ) * sT2, WORK, 1, offsetWORK + N + ki + 2 );
						WORK[ offsetWORK + 2 * N + j + 1 ] -= ddot( j - ki - 2, T, sT1, oT + ( ki + 2 ) * sT1 + ( j + 1 ) * sT2, WORK, 1, offsetWORK + 2 * N + ki + 2 );

						res = dlaln2( true, 2, 2, smin, ONE, T, sT1, sT2, oT + j * sT1 + j * sT2, ONE, ONE, WORK, 1, N, offsetWORK + N + j, wr, -wi, X, 1, 2, 0 );
						scale = res.scale;

						if ( scale !== ONE ) {
							dscal( N - ki, scale, WORK, 1, offsetWORK + N + ki );
							dscal( N - ki, scale, WORK, 1, offsetWORK + 2 * N + ki );
						}
						WORK[ offsetWORK + N + j ] = X[ 0 ];
						WORK[ offsetWORK + N + j + 1 ] = X[ 1 ];
						WORK[ offsetWORK + 2 * N + j ] = X[ 2 ];
						WORK[ offsetWORK + 2 * N + j + 1 ] = X[ 3 ];
						vmax = Math.max( Math.abs( X[ 0 ] ), Math.abs( X[ 2 ] ), Math.abs( X[ 1 ] ), Math.abs( X[ 3 ] ), vmax );
						vcrit = BIGNUM / vmax;
					}
				}

				// Copy vector or Q*x to VL and normalize
				if ( !over ) {
					dcopy( N - ki, WORK, 1, offsetWORK + N + ki, VL, strideVL1, offsetVL + ki * strideVL1 + is * strideVL2 );
					dcopy( N - ki, WORK, 1, offsetWORK + 2 * N + ki, VL, strideVL1, offsetVL + ki * strideVL1 + ( is + 1 ) * strideVL2 );

					emax = ZERO;
					for ( k = ki; k < N; k++ ) {
						emax = Math.max( emax, Math.abs( VL[ offsetVL + k * strideVL1 + is * strideVL2 ] ) +
							Math.abs( VL[ offsetVL + k * strideVL1 + ( is + 1 ) * strideVL2 ] ) );
					}
					remax = ONE / emax;
					dscal( N - ki, remax, VL, strideVL1, offsetVL + ki * strideVL1 + is * strideVL2 );
					dscal( N - ki, remax, VL, strideVL1, offsetVL + ki * strideVL1 + ( is + 1 ) * strideVL2 );

					for ( k = 0; k < ki; k++ ) {
						VL[ offsetVL + k * strideVL1 + is * strideVL2 ] = ZERO;
						VL[ offsetVL + k * strideVL1 + ( is + 1 ) * strideVL2 ] = ZERO;
					}
				} else {
					// Back-transform
					if ( ki < N - 2 ) {
						dgemv( 'no-transpose', N, N - ki - 2, ONE, VL, strideVL1, strideVL2, offsetVL + ( ki + 2 ) * strideVL2, WORK, 1, offsetWORK + N + ki + 2, WORK[ offsetWORK + N + ki ], VL, strideVL1, offsetVL + ki * strideVL2 );
						dgemv( 'no-transpose', N, N - ki - 2, ONE, VL, strideVL1, strideVL2, offsetVL + ( ki + 2 ) * strideVL2, WORK, 1, offsetWORK + 2 * N + ki + 2, WORK[ offsetWORK + 2 * N + ki + 1 ], VL, strideVL1, offsetVL + ( ki + 1 ) * strideVL2 );
					} else {
						dscal( N, WORK[ offsetWORK + N + ki ], VL, strideVL1, offsetVL + ki * strideVL2 );
						dscal( N, WORK[ offsetWORK + 2 * N + ki + 1 ], VL, strideVL1, offsetVL + ( ki + 1 ) * strideVL2 );
					}

					emax = ZERO;
					for ( k = 0; k < N; k++ ) {
						emax = Math.max( emax, Math.abs( VL[ offsetVL + k * strideVL1 + ki * strideVL2 ] ) +
							Math.abs( VL[ offsetVL + k * strideVL1 + ( ki + 1 ) * strideVL2 ] ) );
					}
					remax = ONE / emax;
					dscal( N, remax, VL, strideVL1, offsetVL + ki * strideVL2 );
					dscal( N, remax, VL, strideVL1, offsetVL + ( ki + 1 ) * strideVL2 );
				}
			}

			is += 1;
			if ( ip !== 0 ) {
				is += 1;
			}
		}
	}

	return 0;
}


// EXPORTS //

export default dtrevc3;
