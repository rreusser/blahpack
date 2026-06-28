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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, max-lines, no-var */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import ddot from './../../../../blas/base/ddot/lib/base.js';
import dnrm2 from './../../../../blas/base/dnrm2/lib/base.js';
import dlacn2 from './../../dlacn2/lib/base.js';
import dlacpy from './../../dlacpy/lib/base.js';
import dlamch from './../../dlamch/lib/base.js';
import dlapy2 from './../../dlapy2/lib/base.js';
import dlaqtr from './../../dlaqtr/lib/base.js';
import dtrexc from './../../dtrexc/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var TWO = 2.0;

var EPS = dlamch( 'precision' );
var SMLNUM = dlamch( 'safe-minimum' ) / EPS;
var BIGNUM = ONE / SMLNUM;


// MAIN //

/**
* Estimates reciprocal condition numbers of eigenvalues and/or the.
* right eigenvectors of a real upper quasi-triangular matrix T (in
* Schur canonical form). Mirrors LAPACK's DTRSNA.
*
* @private
* @param {string} job - `'eigenvalues'`, `'eigenvectors'`, or `'both'`
* @param {string} howmny - `'all'` or `'selected'`
* @param {Uint8Array} SELECT - selection mask (used if howmny=`'selected'`)
* @param {integer} strideSELECT - stride for `SELECT`
* @param {NonNegativeInteger} offsetSELECT - starting index for `SELECT`
* @param {NonNegativeInteger} N - order of T
* @param {Float64Array} T - upper quasi-triangular matrix in Schur form
* @param {integer} strideT1 - first-dimension stride of `T`
* @param {integer} strideT2 - second-dimension stride of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} VL - matrix of left eigenvectors (referenced if job includes eigenvalues)
* @param {integer} strideVL1 - first-dimension stride of `VL`
* @param {integer} strideVL2 - second-dimension stride of `VL`
* @param {NonNegativeInteger} offsetVL - starting index for `VL`
* @param {Float64Array} VR - matrix of right eigenvectors (referenced if job includes eigenvalues)
* @param {integer} strideVR1 - first-dimension stride of `VR`
* @param {integer} strideVR2 - second-dimension stride of `VR`
* @param {NonNegativeInteger} offsetVR - starting index for `VR`
* @param {Float64Array} s - out: reciprocal condition numbers of eigenvalues (length mm)
* @param {integer} strideS - stride for `s`
* @param {NonNegativeInteger} offsetS - starting index for `s`
* @param {Float64Array} SEP - out: estimated reciprocal condition numbers of eigenvectors (length mm)
* @param {integer} strideSEP - stride for `SEP`
* @param {NonNegativeInteger} offsetSEP - starting index for `SEP`
* @param {NonNegativeInteger} mm - leading dimension of s/SEP
* @param {Float64Array} WORK - workspace of shape (ldwork, n+6); ldwork >= n for sep
* @param {integer} strideWork1 - first-dimension stride of `WORK`
* @param {integer} strideWork2 - second-dimension stride of `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - integer workspace of length 2*(n-1)
* @param {integer} strideIWork - stride for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @returns {Object} result with properties: info, m (number of condition numbers returned)
*/
function dtrsna( job, howmny, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, s, strideS, offsetS, SEP, strideSEP, offsetSEP, mm, WORK, strideWork1, strideWork2, offsetWork, IWORK, strideIWork, offsetIWork ) {
	var wantbh;
	var wantsp;
	var somcon;
	var wants;
	var prod1;
	var prod2;
	var delta;
	var scale;
	var dummy;
	var ISAVE;
	var pair;
	var ifst;
	var ilst;
	var ierr;
	var prod;
	var rnrm;
	var lnrm;
	var cond;
	var kase;
	var KASE;
	var est;
	var EST;
	var dex;
	var ks;
	var n2;
	var nn;
	var mu;
	var cs;
	var sn;
	var m;
	var k;
	var i;
	var j;

	wantbh = ( job === 'both' );
	wants = ( job === 'eigenvalues' ) || wantbh;
	wantsp = ( job === 'eigenvectors' ) || wantbh;
	somcon = ( howmny === 'selected' );

	// Count selected eigenvalues/vectors (output m)
	if ( somcon ) {
		m = 0;
		pair = false;
		for ( k = 1; k <= N; k++ ) {
			if ( pair ) {
				pair = false;
			} else if ( k < N ) {
				if ( T[ offsetT + ( k * strideT1 ) + ( ( k - 1 ) * strideT2 ) ] === ZERO ) {
					if ( SELECT[ offsetSELECT + ( ( k - 1 ) * strideSELECT ) ] ) {
						m += 1;
					}
				} else {
					pair = true;
					if ( SELECT[ offsetSELECT + ( ( k - 1 ) * strideSELECT ) ] || SELECT[ offsetSELECT + ( k * strideSELECT ) ] ) {
						m += 2;
					}
				}
			} else if ( SELECT[ offsetSELECT + ( ( N - 1 ) * strideSELECT ) ] ) {
				m += 1;
			}
		}
	} else {
		m = N;
	}

	// Quick returns
	if ( N === 0 ) {
		return {
			'info': 0,
			'm': m
		};
	}
	if ( N === 1 ) {
		if ( somcon ) {
			if ( !SELECT[ offsetSELECT ] ) {
				return {
					'info': 0,
					'm': m
				};
			}
		}
		if ( wants ) {
			s[ offsetS ] = ONE;
		}
		if ( wantsp ) {
			SEP[ offsetSEP ] = Math.abs( T[ offsetT ] );
		}
		return {
			'info': 0,
			'm': m
		};
	}

	dummy = new Float64Array( 1 );
	ISAVE = new Int32Array( 3 );
	KASE = new Int32Array( 1 );
	EST = new Float64Array( 1 );

	ks = 0;
	pair = false;
	for ( k = 1; k <= N; k++ ) {
		if ( pair ) {
			pair = false;
			continue;
		}
		if ( k < N ) {
			pair = ( T[ offsetT + ( k * strideT1 ) + ( ( k - 1 ) * strideT2 ) ] !== ZERO );
		}

		if ( somcon ) {
			if ( pair ) {
				if ( !SELECT[ offsetSELECT + ( ( k - 1 ) * strideSELECT ) ] && !SELECT[ offsetSELECT + ( k * strideSELECT ) ] ) {
					continue;
				}
			} else if ( !SELECT[ offsetSELECT + ( ( k - 1 ) * strideSELECT ) ] ) {
				continue;
			}
		}

		ks += 1;

		if ( wants ) {
			// ks is 1-based column index into VR/VL/s
			if ( pair ) {
				prod1 = ddot( N, VR, strideVR1, offsetVR + ( ( ks - 1 ) * strideVR2 ), VL, strideVL1, offsetVL + ( ( ks - 1 ) * strideVL2 ) );
				prod1 += ddot( N, VR, strideVR1, offsetVR + ( ks * strideVR2 ), VL, strideVL1, offsetVL + ( ks * strideVL2 ) );
				prod2 = ddot( N, VL, strideVL1, offsetVL + ( ( ks - 1 ) * strideVL2 ), VR, strideVR1, offsetVR + ( ks * strideVR2 ) );
				prod2 -= ddot( N, VL, strideVL1, offsetVL + ( ks * strideVL2 ), VR, strideVR1, offsetVR + ( ( ks - 1 ) * strideVR2 ) );
				rnrm = dlapy2( dnrm2( N, VR, strideVR1, offsetVR + ( ( ks - 1 ) * strideVR2 ) ), dnrm2( N, VR, strideVR1, offsetVR + ( ks * strideVR2 ) ) );
				lnrm = dlapy2( dnrm2( N, VL, strideVL1, offsetVL + ( ( ks - 1 ) * strideVL2 ) ), dnrm2( N, VL, strideVL1, offsetVL + ( ks * strideVL2 ) ) );
				cond = dlapy2( prod1, prod2 ) / ( rnrm * lnrm );
				s[ offsetS + ( ( ks - 1 ) * strideS ) ] = cond;
				s[ offsetS + ( ks * strideS ) ] = cond;
			} else {
				prod = ddot( N, VR, strideVR1, offsetVR + ( ( ks - 1 ) * strideVR2 ), VL, strideVL1, offsetVL + ( ( ks - 1 ) * strideVL2 ) );
				rnrm = dnrm2( N, VR, strideVR1, offsetVR + ( ( ks - 1 ) * strideVR2 ) );
				lnrm = dnrm2( N, VL, strideVL1, offsetVL + ( ( ks - 1 ) * strideVL2 ) );
				s[ offsetS + ( ( ks - 1 ) * strideS ) ] = Math.abs( prod ) / ( rnrm * lnrm );
			}
		}

		if ( wantsp ) {
			// Copy T into WORK and move block k to position (1,1) via dtrexc
			dlacpy( 'full', N, N, T, strideT1, strideT2, offsetT, WORK, strideWork1, strideWork2, offsetWork );
			ifst = k;
			ilst = 1;
			dex = dtrexc( 'none', N, WORK, strideWork1, strideWork2, offsetWork, dummy, 1, 1, 0, ifst, ilst, WORK, 1, offsetWork + ( N * strideWork2 ) );
			ierr = dex.info;

			if ( ierr === 1 || ierr === 2 ) {
				scale = ONE;
				est = BIGNUM;
			} else {
				if ( WORK[ offsetWork + strideWork1 + ( 0 * strideWork2 ) ] === ZERO ) {
					// 1x1 leading block: subtract WORK(1,1) from diagonal
					for ( i = 2; i <= N; i++ ) {
						WORK[ offsetWork + ( ( i - 1 ) * strideWork1 ) + ( ( i - 1 ) * strideWork2 ) ] -= WORK[ offsetWork ];
					}
					n2 = 1;
					nn = N - 1;
				} else {
					// 2x2 leading block: reduce to 1x1 via orthogonal similarity
					mu = Math.sqrt( Math.abs( WORK[ offsetWork + strideWork2 ] ) ) * Math.sqrt( Math.abs( WORK[ offsetWork + strideWork1 ] ) );
					delta = dlapy2( mu, WORK[ offsetWork + strideWork1 ] );
					cs = mu / delta;
					sn = -WORK[ offsetWork + strideWork1 ] / delta;

					for ( j = 3; j <= N; j++ ) {
						WORK[ offsetWork + strideWork1 + ( ( j - 1 ) * strideWork2 ) ] = cs * WORK[ offsetWork + strideWork1 + ( ( j - 1 ) * strideWork2 ) ];
						WORK[ offsetWork + ( ( j - 1 ) * strideWork1 ) + ( ( j - 1 ) * strideWork2 ) ] -= WORK[ offsetWork ];
					}
					WORK[ offsetWork + strideWork1 + strideWork2 ] = ZERO;

					WORK[ offsetWork + ( N * strideWork2 ) ] = TWO * mu;
					for ( i = 2; i <= N - 1; i++ ) {
						WORK[ offsetWork + ( ( i - 1 ) * strideWork1 ) + ( N * strideWork2 ) ] = sn * WORK[ offsetWork + ( i * strideWork2 ) ];
					}
					n2 = 2;
					nn = 2 * ( N - 1 );
				}

				EST[ 0 ] = ZERO;
				KASE[ 0 ] = 0;
				scale = ONE;

				// Reverse-communication dlacn2 loop
				for ( ; ; ) {
					// WORK(1, N+2) .. stores v, WORK(1, N+4) .. stores x
					dlacn2( nn, WORK, strideWork1, offsetWork + ( ( N + 1 ) * strideWork2 ), WORK, strideWork1, offsetWork + ( ( N + 3 ) * strideWork2 ), IWORK, strideIWork, offsetIWork, EST, KASE, ISAVE, 1, 0 );
					kase = KASE[ 0 ];
					if ( kase === 0 ) {
						break;
					}
					if ( kase === 1 ) {
						if ( n2 === 1 ) {
							dex = dlaqtr( true, true, N - 1, WORK, strideWork1, strideWork2, offsetWork + strideWork1 + strideWork2, dummy, 1, 0, ZERO, WORK, strideWork1, offsetWork + ( ( N + 3 ) * strideWork2 ), WORK, strideWork1, offsetWork + ( ( N + 5 ) * strideWork2 ) );
						} else {
							dex = dlaqtr( true, false, N - 1, WORK, strideWork1, strideWork2, offsetWork + strideWork1 + strideWork2, WORK, strideWork1, offsetWork + ( N * strideWork2 ), mu, WORK, strideWork1, offsetWork + ( ( N + 3 ) * strideWork2 ), WORK, strideWork1, offsetWork + ( ( N + 5 ) * strideWork2 ) );
						}
					} else if ( n2 === 1 ) {
						dex = dlaqtr( false, true, N - 1, WORK, strideWork1, strideWork2, offsetWork + strideWork1 + strideWork2, dummy, 1, 0, ZERO, WORK, strideWork1, offsetWork + ( ( N + 3 ) * strideWork2 ), WORK, strideWork1, offsetWork + ( ( N + 5 ) * strideWork2 ) );
					} else {
						dex = dlaqtr( false, false, N - 1, WORK, strideWork1, strideWork2, offsetWork + strideWork1 + strideWork2, WORK, strideWork1, offsetWork + ( N * strideWork2 ), mu, WORK, strideWork1, offsetWork + ( ( N + 3 ) * strideWork2 ), WORK, strideWork1, offsetWork + ( ( N + 5 ) * strideWork2 ) );
					}
					scale = dex.scale;
				}
				est = EST[ 0 ];
			}

			SEP[ offsetSEP + ( ( ks - 1 ) * strideSEP ) ] = scale / Math.max( est, SMLNUM );
			if ( pair ) {
				SEP[ offsetSEP + ( ks * strideSEP ) ] = SEP[ offsetSEP + ( ( ks - 1 ) * strideSEP ) ];
			}
		}

		if ( pair ) {
			ks += 1;
		}
	}

	// mm is the caller-declared capacity for s/SEP (unused by the base
	// Routine but retained for signature parity with the Fortran API).
	if ( mm < 0 ) {
		return {
			'info': -13,
			'm': m
		};
	}
	return {
		'info': 0,
		'm': m
	};
}


// EXPORTS //

export default dtrsna;
