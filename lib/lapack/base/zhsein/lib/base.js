/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, no-unused-vars */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import dlamch from './../../dlamch/lib/base.js';
import zlanhs from './../../zlanhs/lib/base.js';
import zlaein from './../../zlaein/lib/base.js';


// VARIABLES //

var ZERO = 0.0;


// MAIN //

/**
* Uses inverse iteration to find right and/or left eigenvectors of a complex upper Hessenberg matrix `H` corresponding to specified eigenvalues.
*
* ## Notes
*
* -   `side` is `'right'`, `'left'`, or `'both'`.
* -   `eigsrc` is `'qr'` (eigenvalues came from zhseqr) or `'no'`.
* -   `initv` is `'no'` (generate initial vector internally) or `'user'` (use supplied VL/VR columns).
* -   `SELECT` is a Uint8Array or similar of length `N`; a non-zero entry selects eigenvalue `w[k]`.
* -   `w` is a `Complex128Array` of length `N` (may be modified — perturbed to separate near-duplicate eigenvalues).
* -   `WORK` is a `Complex128Array` of length `N*N` used as complex workspace.
* -   `RWORK` is a `Float64Array` of length `N` used as real workspace.
* -   `IFAILL`, `IFAILR` are `Int32Array` of length `mm`.
* -   Returns an object `{ info, m, ifaill, ifailr }` where `info` is the number of eigenvectors that failed to converge (or a negative error code), and `m` is the number of selected eigenvalues.
*
* @private
* @param {string} side - `'right'`, `'left'`, or `'both'`
* @param {string} eigsrc - `'qr'` or `'no'`
* @param {string} initv - `'no'` or `'user'`
* @param {Uint8Array} SELECT - selection array
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} offsetSELECT - starting index for `SELECT`
* @param {NonNegativeInteger} N - order of matrix `H`
* @param {Complex128Array} H - upper Hessenberg matrix
* @param {integer} strideH1 - stride of the first dimension of `H` (complex elements)
* @param {integer} strideH2 - stride of the second dimension of `H` (complex elements)
* @param {NonNegativeInteger} offsetH - starting index for `H` (complex elements)
* @param {Complex128Array} w - eigenvalue array (length `N`)
* @param {integer} strideW - stride length for `w` (complex elements)
* @param {NonNegativeInteger} offsetW - starting index for `w` (complex elements)
* @param {Complex128Array} VL - left eigenvector matrix
* @param {integer} strideVL1 - stride of the first dimension of `VL` (complex elements)
* @param {integer} strideVL2 - stride of the second dimension of `VL` (complex elements)
* @param {NonNegativeInteger} offsetVL - starting index for `VL` (complex elements)
* @param {Complex128Array} VR - right eigenvector matrix
* @param {integer} strideVR1 - stride of the first dimension of `VR` (complex elements)
* @param {integer} strideVR2 - stride of the second dimension of `VR` (complex elements)
* @param {NonNegativeInteger} offsetVR - starting index for `VR` (complex elements)
* @param {NonNegativeInteger} mm - number of columns in `VL`/`VR`
* @param {NonNegativeInteger} M - ignored on entry (kept for API parity)
* @param {Complex128Array} WORK - complex workspace of length at least `N*N`
* @param {integer} strideWork - unused (kept for API parity)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (complex elements)
* @param {Float64Array} RWORK - real workspace of length at least `N`
* @param {integer} strideRWork - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @param {Int32Array} IFAILL - left failure indicator (length `mm`)
* @param {integer} strideIFAILL - stride length for `IFAILL`
* @param {NonNegativeInteger} offsetIFAILL - starting index for `IFAILL`
* @param {Int32Array} IFAILR - right failure indicator (length `mm`)
* @param {integer} strideIFAILR - stride length for `IFAILR`
* @param {NonNegativeInteger} offsetIFAILR - starting index for `IFAILR`
* @returns {Object} result object `{ info, m, ifaill, ifailr }`
*/
function zhsein( side, eigsrc, initv, SELECT, strideSELECT, offsetSELECT, N, H, strideH1, strideH2, offsetH, w, strideW, offsetW, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, IFAILL, strideIFAILL, offsetIFAILL, IFAILR, strideIFAILR, offsetIFAILR ) {
	var wkComplex;
	var restart;
	var rightv;
	var fromqr;
	var noinit;
	var smlnum;
	var bothv;
	var leftv;
	var iinfo;
	var hnorm;
	var info;
	var unfl;
	var eps3;
	var sVL1;
	var sVL2;
	var sVR1;
	var sVR2;
	var ulp;
	var kln;
	var sH1;
	var sH2;
	var oVL;
	var oVR;
	var hvw;
	var vl2;
	var vr2;
	var wkR;
	var wkI;
	var wiR;
	var wiI;
	var kl;
	var kr;
	var ks;
	var ii;
	var oH;
	var sW;
	var oW;
	var wv;
	var m;
	var k;
	var i;

	bothv = ( side === 'both' );
	rightv = bothv || ( side === 'right' );
	leftv = bothv || ( side === 'left' );
	fromqr = ( eigsrc === 'qr' );
	noinit = ( initv === 'no' );

	// Count selected eigenvalues.
	m = 0;
	for ( k = 0; k < N; k++ ) {
		if ( SELECT[ offsetSELECT + ( k * strideSELECT ) ] ) {
			m += 1;
		}
	}

	info = 0;
	if ( !rightv && !leftv ) {
		info = -1;
	} else if ( !fromqr && eigsrc !== 'no' ) {
		info = -2;
	} else if ( !noinit && initv !== 'user' ) {
		info = -3;
	} else if ( N < 0 ) {
		info = -5;
	} else if ( mm < m ) {
		info = -13;
	}
	if ( info !== 0 ) {
		return {
			'info': info,
			'm': m,
			'ifaill': IFAILL,
			'ifailr': IFAILR
		};
	}

	if ( N === 0 ) {
		return {
			'info': 0,
			'm': m,
			'ifaill': IFAILL,
			'ifailr': IFAILR
		};
	}

	unfl = dlamch( 'safe-minimum' );
	ulp = dlamch( 'precision' );
	smlnum = unfl * ( N / ulp );

	sH1 = strideH1 * 2;
	sH2 = strideH2 * 2;
	oH = offsetH * 2;
	sVL1 = strideVL1 * 2;
	sVL2 = strideVL2 * 2;
	oVL = offsetVL * 2;
	sVR1 = strideVR1 * 2;
	sVR2 = strideVR2 * 2;
	oVR = offsetVR * 2;
	sW = strideW * 2;
	oW = offsetW * 2;

	hvw = reinterpret( H, 0 );
	wv = reinterpret( w, 0 );
	vl2 = reinterpret( VL, 0 );
	vr2 = reinterpret( VR, 0 );

	// 0-indexed bookkeeping: `kl`/`kr` are inclusive block endpoints; `ks` is the 0-indexed destination column in VL/VR.
	kl = 0;
	kln = -1;
	if ( fromqr ) {
		kr = -1;
	} else {
		kr = N - 1;
	}
	ks = 0;
	eps3 = smlnum;

	for ( k = 0; k < N; k++ ) {
		if ( !SELECT[ offsetSELECT + ( k * strideSELECT ) ] ) {
			continue;
		}
		if ( fromqr ) {
			// Scan down from k to kl+1 for a zero sub-diagonal H(i,i-1). Matches Fortran DO 20: if all nonzero, i exits at kl (loop variable past end), and kl stays unchanged.
			ii = k;
			while ( ii >= kl + 1 ) {
				if ( hvw[ oH + ( ii * sH1 ) + ( ( ii - 1 ) * sH2 ) ] === ZERO && hvw[ oH + ( ii * sH1 ) + ( ( ii - 1 ) * sH2 ) + 1 ] === ZERO ) {
					break;
				}
				ii -= 1;
			}
			kl = ii;
			if ( k > kr ) {
				// Scan up from k to N-2 looking for a zero sub-diagonal
				// H(i+1,i). If none found, kr becomes N-1.
				ii = k;
				while ( ii <= N - 2 ) {
					if ( hvw[ oH + ( ( ii + 1 ) * sH1 ) + ( ii * sH2 ) ] === ZERO && hvw[ oH + ( ( ii + 1 ) * sH1 ) + ( ii * sH2 ) + 1 ] === ZERO ) {
						break;
					}
					ii += 1;
				}
				kr = ii;
			}
		}

		if ( kl !== kln ) {
			kln = kl;

			// HNORM = ZLANHS( 'I', KR-KL+1, H(KL,KL), LDH, RWORK )
			hnorm = zlanhs( 'inf-norm', ( kr - kl ) + 1, H, strideH1, strideH2, offsetH + ( kl * strideH1 ) + ( kl * strideH2 ), RWORK, strideRWork, offsetRWork );
			if ( isNaN( hnorm ) ) {
				return {
					'info': -6,
					'm': m,
					'ifaill': IFAILL,
					'ifailr': IFAILR
				};
			}
			if ( hnorm > ZERO ) {
				eps3 = hnorm * ulp;
			} else {
				eps3 = smlnum;
			}
		}

		// Perturb WK so it is at least eps3 away from any previously-selected eigenvalue in the current block [kl, k-1].
		wkR = wv[ oW + ( k * sW ) ];
		wkI = wv[ oW + ( k * sW ) + 1 ];
		restart = true;
		while ( restart ) {
			restart = false;
			for ( i = k - 1; i >= kl; i-- ) {
				if ( SELECT[ offsetSELECT + ( i * strideSELECT ) ] ) {
					wiR = wv[ oW + ( i * sW ) ];
					wiI = wv[ oW + ( i * sW ) + 1 ];
					if ( Math.abs( wiR - wkR ) + Math.abs( wiI - wkI ) < eps3 ) {
						wkR += eps3;
						restart = true;
						break;
					}
				}
			}
		}
		wv[ oW + ( k * sW ) ] = wkR;
		wv[ oW + ( k * sW ) + 1 ] = wkI;
		wkComplex = new Complex128( wkR, wkI );

		if ( leftv ) {
			// CALL ZLAEIN(.FALSE., NOINIT, N-KL+1, H(KL,KL), LDH, WK, VL(KL,KS), WORK, LDWORK, RWORK, EPS3, SMLNUM, IINFO)
			iinfo = zlaein( false, noinit, N - kl, H, strideH1, strideH2, offsetH + ( kl * strideH1 ) + ( kl * strideH2 ), wkComplex, VL, strideVL1, offsetVL + ( kl * strideVL1 ) + ( ks * strideVL2 ), WORK, 1, N, offsetWork, RWORK, strideRWork, offsetRWork, eps3, smlnum );
			if ( iinfo > 0 ) {
				info += 1;
				IFAILL[ offsetIFAILL + ( ks * strideIFAILL ) ] = k + 1;
			} else {
				IFAILL[ offsetIFAILL + ( ks * strideIFAILL ) ] = 0;
			}
			// Zero VL rows above kl in column ks.
			for ( i = 0; i < kl; i++ ) {
				vl2[ oVL + ( i * sVL1 ) + ( ks * sVL2 ) ] = ZERO;
				vl2[ oVL + ( i * sVL1 ) + ( ks * sVL2 ) + 1 ] = ZERO;
			}
		}
		if ( rightv ) {
			// CALL ZLAEIN(.TRUE., NOINIT, KR, H, LDH, WK, VR(1,KS), WORK, LDWORK, RWORK, EPS3, SMLNUM, IINFO)
			iinfo = zlaein( true, noinit, kr + 1, H, strideH1, strideH2, offsetH, wkComplex, VR, strideVR1, offsetVR + ( ks * strideVR2 ), WORK, 1, N, offsetWork, RWORK, strideRWork, offsetRWork, eps3, smlnum );
			if ( iinfo > 0 ) {
				info += 1;
				IFAILR[ offsetIFAILR + ( ks * strideIFAILR ) ] = k + 1;
			} else {
				IFAILR[ offsetIFAILR + ( ks * strideIFAILR ) ] = 0;
			}
			// Zero VR rows below kr in column ks.
			for ( i = kr + 1; i < N; i++ ) {
				vr2[ oVR + ( i * sVR1 ) + ( ks * sVR2 ) ] = ZERO;
				vr2[ oVR + ( i * sVR1 ) + ( ks * sVR2 ) + 1 ] = ZERO;
			}
		}
		ks += 1;
	}

	return {
		'info': info,
		'm': m,
		'ifaill': IFAILL,
		'ifailr': IFAILR
	};
}


// EXPORTS //

export default zhsein;
