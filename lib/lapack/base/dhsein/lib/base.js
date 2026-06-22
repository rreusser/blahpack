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

import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';
import dlamch from './../../dlamch/lib/base.js';
import dlanhs from './../../dlanhs/lib/base.js';
import dlaein from './../../dlaein/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var UNFL = dlamch( 'safe-minimum' );
var ULP = dlamch( 'precision' );


// MAIN //

/**
* Uses inverse iteration to find right and/or left eigenvectors of a real upper Hessenberg matrix.
*
* ## Notes
*
* On entry, `SELECT` is a Uint8Array (or Array) of length N, with `SELECT[i] !== 0` selecting the eigenvector(s) corresponding to eigenvalue `wr[i] + i*wi[i]`. For complex conjugate eigenvalue pairs, if either member of the pair is selected, both are computed and `SELECT` is updated so that only the first member of the pair is marked true.
*
* @private
* @param {string} side - `'right'`, `'left'`, or `'both'`
* @param {string} eigsrc - `'qr'` if eigenvalues originate from DHSEQR, `'no-source'` otherwise
* @param {string} initv - `'no-init'` for internal initial vectors, `'user'` to use supplied VL/VR
* @param {(Uint8Array|Array)} SELECT - selection array (may be modified for complex pairs)
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} offsetSELECT - starting index for `SELECT`
* @param {NonNegativeInteger} N - order of the matrix H
* @param {Float64Array} H - upper Hessenberg matrix, shape NxN
* @param {integer} strideH1 - stride of the first dimension of `H`
* @param {integer} strideH2 - stride of the second dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {Float64Array} WR - real parts of eigenvalues (modified: entries may be perturbed for nearby eigenvalues)
* @param {integer} strideWR - stride length for `WR`
* @param {NonNegativeInteger} offsetWR - starting index for `WR`
* @param {Float64Array} WI - imaginary parts of eigenvalues
* @param {integer} strideWI - stride length for `WI`
* @param {NonNegativeInteger} offsetWI - starting index for `WI`
* @param {Float64Array} VL - output left eigenvectors (used only if side includes left)
* @param {integer} strideVL1 - stride of the first dimension of `VL`
* @param {integer} strideVL2 - stride of the second dimension of `VL`
* @param {NonNegativeInteger} offsetVL - starting index for `VL`
* @param {Float64Array} VR - output right eigenvectors (used only if side includes right)
* @param {integer} strideVR1 - stride of the first dimension of `VR`
* @param {integer} strideVR2 - stride of the second dimension of `VR`
* @param {NonNegativeInteger} offsetVR - starting index for `VR`
* @param {integer} mm - number of columns in VL/VR (must be >= M)
* @param {integer} M - unused (actual count is returned in the result)
* @param {Float64Array} WORK - workspace of length at least (N+2)*N
* @param {integer} strideWORK - stride for `WORK` (must be 1)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @param {Int32Array} IFAILL - failure indicators for left eigenvectors (length mm)
* @param {integer} strideIFAILL - stride length for `IFAILL`
* @param {NonNegativeInteger} offsetIFAILL - starting index for `IFAILL`
* @param {Int32Array} IFAILR - failure indicators for right eigenvectors (length mm)
* @param {integer} strideIFAILR - stride length for `IFAILR`
* @param {NonNegativeInteger} offsetIFAILR - starting index for `IFAILR`
* @returns {Object} result `{ info, m }` where `info` is a status code and `m` is the number of computed eigenvectors
*/
function dhsein( side, eigsrc, initv, SELECT, strideSELECT, offsetSELECT, N, H, strideH1, strideH2, offsetH, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWORK, offsetWORK, IFAILL, strideIFAILL, offsetIFAILL, IFAILR, strideIFAILR, offsetIFAILR ) { // eslint-disable-line no-unused-vars
	var converged;
	var bignum;
	var smlnum;
	var fromqr;
	var noinit;
	var rightv;
	var ldwork;
	var bothv;
	var leftv;
	var hnorm;
	var iinfo;
	var eps3;
	var info;
	var pair;
	var wkr;
	var wki;
	var kln;
	var ksr;
	var ksi;
	var res;
	var kl;
	var kr;
	var i;
	var k;
	var m;

	bothv = ( side === 'both' );
	rightv = ( side === 'right' ) || bothv;
	leftv = ( side === 'left' ) || bothv;

	fromqr = ( eigsrc === 'qr' );
	noinit = ( initv === 'no-init' );

	// Count selected eigenvalues; clean up selection for complex pairs
	m = 0;
	pair = false;
	for ( k = 0; k < N; k++ ) {
		if ( pair ) {
			pair = false;
			SELECT[ offsetSELECT + ( k * strideSELECT ) ] = 0;
		} else if ( WI[ offsetWI + ( k * strideWI ) ] === ZERO ) {
			if ( SELECT[ offsetSELECT + ( k * strideSELECT ) ] ) {
				m += 1;
			}
		} else {
			pair = true;
			if (
				SELECT[ offsetSELECT + ( k * strideSELECT ) ] ||
				SELECT[ offsetSELECT + ( ( k + 1 ) * strideSELECT ) ]
			) {
				SELECT[ offsetSELECT + ( k * strideSELECT ) ] = 1;
				m += 2;
			}
		}
	}

	info = 0;
	if ( N === 0 ) {
		return {
			'info': info,
			'm': m
		};
	}

	smlnum = UNFL * ( N / ULP );
	bignum = ( ONE - ULP ) / smlnum;

	ldwork = N + 1;

	kl = 0;    // 0-based lower index
	kln = -1;  // sentinel: force recomputation on first use
	if ( fromqr ) {
		kr = -1;
	} else {
		kr = N - 1;
	}
	ksr = 0;   // 0-based column index in VL/VR

	for ( k = 0; k < N; k++ ) {
		if ( !SELECT[ offsetSELECT + ( k * strideSELECT ) ] ) {
			continue;
		}

		if ( fromqr ) {
			// Find kl such that H[kl..k, kl..k] is an unreduced block
			i = k;
			while ( i >= kl + 1 ) {
				if ( H[ offsetH + ( i * strideH1 ) + ( ( i - 1 ) * strideH2 ) ] === ZERO ) {
					break;
				}
				i -= 1;
			}
			kl = i;
			if ( k > kr ) {
				i = k;
				while ( i <= N - 2 ) {
					if ( H[ offsetH + ( ( i + 1 ) * strideH1 ) + ( i * strideH2 ) ] === ZERO ) {
						break;
					}
					i += 1;
				}
				kr = i;
			}
		}

		if ( kl !== kln ) {
			kln = kl;

			// Compute infinity-norm of the sub-block H[kl..kr, kl..kr]
			hnorm = dlanhs('infinity', kr - kl + 1, H, strideH1, strideH2, offsetH + ( kl * strideH1 ) + ( kl * strideH2 ), WORK, strideWORK, offsetWORK);
			if ( isnan( hnorm ) ) {
				info = -6;
				return {
					'info': info,
					'm': m
				};
			}
			if ( hnorm > ZERO ) {
				eps3 = hnorm * ULP;
			} else {
				eps3 = smlnum;
			}
		}

		// Perturb eigenvalue if it is too close to any previous selected one
		wkr = WR[ offsetWR + ( k * strideWR ) ];
		wki = WI[ offsetWI + ( k * strideWI ) ];
		for ( ; ; ) {
			converged = true;
			for ( i = k - 1; i >= kl; i-- ) {
				if (
					SELECT[ offsetSELECT + ( i * strideSELECT ) ] &&
					Math.abs( WR[ offsetWR + ( i * strideWR ) ] - wkr ) + Math.abs( WI[ offsetWI + ( i * strideWI ) ] - wki ) < eps3
				) {
					wkr += eps3;
					converged = false;
					break;
				}
			}
			if ( converged ) {
				break;
			}
		}
		WR[ offsetWR + ( k * strideWR ) ] = wkr;

		pair = ( wki !== ZERO );
		if ( pair ) {
			ksi = ksr + 1;
		} else {
			ksi = ksr;
		}

		if ( leftv ) {
			// Compute left eigenvector: call dlaein with rightv=false on H[kl..N-1, kl..N-1]
			// WORK layout: B-matrix [0..(N+1)*N-1], scratch WORK [N*N+N..]
			res = dlaein(false, noinit, N - kl, H, strideH1, strideH2, offsetH + ( kl * strideH1 ) + ( kl * strideH2 ), wkr, wki, VL, strideVL1, offsetVL + ( kl * strideVL1 ) + ( ksr * strideVL2 ), VL, strideVL1, offsetVL + ( kl * strideVL1 ) + ( ksi * strideVL2 ), WORK, 1, ldwork, offsetWORK, WORK, 1, offsetWORK + ( N * N ) + N, eps3, smlnum, bignum);
			iinfo = res;
			if ( iinfo > 0 ) {
				if ( pair ) {
					info += 2;
				} else {
					info += 1;
				}
				IFAILL[ offsetIFAILL + ( ksr * strideIFAILL ) ] = k + 1;
				IFAILL[ offsetIFAILL + ( ksi * strideIFAILL ) ] = k + 1;
			} else {
				IFAILL[ offsetIFAILL + ( ksr * strideIFAILL ) ] = 0;
				IFAILL[ offsetIFAILL + ( ksi * strideIFAILL ) ] = 0;
			}
			for ( i = 0; i < kl; i++ ) {
				VL[ offsetVL + ( i * strideVL1 ) + ( ksr * strideVL2 ) ] = ZERO;
			}
			if ( pair ) {
				for ( i = 0; i < kl; i++ ) {
					VL[ offsetVL + ( i * strideVL1 ) + ( ksi * strideVL2 ) ] = ZERO;
				}
			}
		}

		if ( rightv ) {
			// Compute right eigenvector using H[0..kr, 0..kr]
			res = dlaein(true, noinit, kr + 1, H, strideH1, strideH2, offsetH, wkr, wki, VR, strideVR1, offsetVR + ( ksr * strideVR2 ), VR, strideVR1, offsetVR + ( ksi * strideVR2 ), WORK, 1, ldwork, offsetWORK, WORK, 1, offsetWORK + ( N * N ) + N, eps3, smlnum, bignum);
			iinfo = res;
			if ( iinfo > 0 ) {
				if ( pair ) {
					info += 2;
				} else {
					info += 1;
				}
				IFAILR[ offsetIFAILR + ( ksr * strideIFAILR ) ] = k + 1;
				IFAILR[ offsetIFAILR + ( ksi * strideIFAILR ) ] = k + 1;
			} else {
				IFAILR[ offsetIFAILR + ( ksr * strideIFAILR ) ] = 0;
				IFAILR[ offsetIFAILR + ( ksi * strideIFAILR ) ] = 0;
			}
			for ( i = kr + 1; i < N; i++ ) {
				VR[ offsetVR + ( i * strideVR1 ) + ( ksr * strideVR2 ) ] = ZERO;
			}
			if ( pair ) {
				for ( i = kr + 1; i < N; i++ ) {
					VR[ offsetVR + ( i * strideVR1 ) + ( ksi * strideVR2 ) ] = ZERO;
				}
			}
		}

		if ( pair ) {
			ksr += 2;
		} else {
			ksr += 1;
		}
	}

	return {
		'info': info,
		'm': m
	};
}


// EXPORTS //

export default dhsein;
