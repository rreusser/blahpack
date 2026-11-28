/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, no-var */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import ilaenv from '../../ilaenv/lib/base.js';
import zcopy from '../../../blas/zcopy/lib/base.js';
import zgehrd from '../../zgehrd/lib/base.js';
import zgemm from '../../../blas/zgemm/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zlahqr from '../../zlahqr/lib/base.js';
import zlaqr4, { computeOptimalWorkSize as zlaqr4WorkOpt } from '../../zlaqr4/lib/base.js';
import zlarf from '../../zlarf/lib/base.js';
import zlarfg from '../../zlarfg/lib/base.js';
import zlaset from '../../zlaset/lib/base.js';
import ztrexc from '../../ztrexc/lib/base.js';
import zunmhr from '../../zunmhr/lib/base.js';


// VARIABLES //

const CZERO = new Complex128( 0.0, 0.0 );
const CONE = new Complex128( 1.0, 0.0 );
const RZERO = 0.0;
const SAFMIN = dlamch( 'safe-minimum' );
const ULP = dlamch( 'precision' );


// FUNCTIONS //

/**
* Returns |Re(z)| + |Im(z)| for the complex value at a Float64 index.
*
* @private
* @param {Float64Array} v - Float64 view of a complex array
* @param {number} idx - index of the real part in `v`
*/
function cabs1( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}


/**
* Returns the reference's optimal workspace length (LWKOPT, complex elements) for ZLAQR3.
*
* `LWKOPT = max( JW + max( LWK1, LWK2 ), LWK3 )`, `JW = min( NW, KBOT-KTOP+1 )`, where LWK1/LWK2 are the ZGEHRD/ZUNMHR optima (`JW*NB + TSIZE`, NB = 32, TSIZE = 4160) and LWK3 is ZLAQR4's optimum for the JW-by-JW window; 1 for `JW <= 2`.
*
* @private
* @param {integer} nw - deflation window size
* @param {integer} ktop - top of the active block (1-based)
* @param {integer} kbot - bottom of the active block (1-based)
* @returns {PositiveInteger} optimal workspace length
*/
function computeOptimalWorkSize( nw, ktop, kbot ) {
	const jw = Math.min( nw, kbot - ktop + 1 );
	if ( jw <= 2 ) {
		return 1;
	}
	return Math.max( jw + ( jw * 32 ) + 4160, zlaqr4WorkOpt( jw, 1, jw ) );
}


// MAIN //

/**
* Aggressive early deflation for the complex QR algorithm (recursive version).
*
* Identical to zlaqr2 except uses zlaqr4 for larger deflation windows.
*
* All indices are 1-based (Fortran convention).
* Returns { ns, nd }.
*
* @private
* @param {boolean} wantt - if `true`, then the Hessenberg matrix H is fully updated so that the triangular Schur factor may be computed (in cooperation with the calling subroutine).
* @param {boolean} wantz - if `true`, then the unitary matrix Z is updated so so that the unitary Schur factor may be computed (in cooperation with the calling subroutine).
* @param {NonNegativeInteger} N - number of columns
* @param {integer} ktop - it is assumed that either KTOP = 1 or H(KTOP,KTOP-1)=0.
* @param {NonNegativeInteger} kbot - it is assumed without a check that either KBOT = N or H(KBOT+1,KBOT)=0.
* @param {NonNegativeInteger} nw - deflation window size. 1 <= NW <= (KBOT-KTOP+1).
* @param {Complex128Array} H - input matrix
* @param {integer} strideH1 - stride of the first dimension of `H`
* @param {integer} strideH2 - stride of the second dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {integer} iloz - specify the rows of Z to which transformations must be applied if WANTZ is `true`. 1 <= ILOZ <= IHIZ <= N.
* @param {integer} ihiz - specify the rows of Z to which transformations must be applied if WANTZ is `true`. 1 <= ILOZ <= IHIZ <= N.
* @param {Complex128Array} Z - input matrix
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Int32Array} ns - input/output (length-1 array): ns
* @param {Int32Array} nd - input/output (length-1 array): nd
* @param {Complex128Array} SH - input array
* @param {integer} strideSH - stride length for `SH`
* @param {NonNegativeInteger} offsetSH - starting index for `SH`
* @param {Complex128Array} V - input matrix
* @param {integer} strideV1 - stride of the first dimension of `V`
* @param {integer} strideV2 - stride of the second dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index for `V`
* @param {integer} nh - nhp
* @param {Complex128Array} T - input matrix
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {integer} nv - nvp
* @param {Complex128Array} WV - input matrix
* @param {integer} strideWV1 - stride of the first dimension of `WV`
* @param {integer} strideWV2 - stride of the second dimension of `WV`
* @param {NonNegativeInteger} offsetWV - starting index for `WV`
* @param {Complex128Array} WORK - workspace array of length at least `2*JW` (`JW = min(nw, kbot-ktop+1)`, the reference's `2*NW`); the reference's optimum (`JW + JW*32 + 4160` for `JW > 2`) keeps ZGEHRD/ZUNMHR blocked
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {Complex128Array} `WV`
*/
function zlaqr3( wantt, wantz, N, ktop, kbot, nw, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, ns, nd, SH, strideSH, offsetSH, V, strideV1, strideV2, offsetV, nh, T, strideT1, strideT2, offsetT, nv, WV, strideWV1, strideWV2, offsetWV, WORK, strideWork, offsetWork ) {
	let infqr, nmin, ltop, kcol, krow, kln, sR, sI, foo, ifst, ilst, knt, betaCA;
	let tauConjCA, tauConjV, betaV, tauCA, tauV, i, j;

	const jw = Math.min( nw, kbot - ktop + 1 );

	ns[ 0 ] = 0;
	nd[ 0 ] = 0;

	if ( ktop > kbot ) {
		ns[ 0 ] = 0;
		nd[ 0 ] = 0;
		return WV;
	}
	if ( nw < 1 ) {
		ns[ 0 ] = 0;
		nd[ 0 ] = 0;
		return WV;
	}

	const Hv = reinterpret( H, 0 );
	const sh1 = strideH1 * 2;
	const sh2 = strideH2 * 2;
	const oH = offsetH * 2;

	const Tv = reinterpret( T, 0 );
	const st1 = strideT1 * 2;
	const st2 = strideT2 * 2;
	const oT = offsetT * 2;

	const Vv = reinterpret( V, 0 );
	const sv2 = strideV2 * 2;
	const oV = offsetV * 2;

	const SHv = reinterpret( SH, 0 );
	const sSH = strideSH * 2;
	const oSH = offsetSH * 2;

	const smlnum = SAFMIN * ( N / ULP );

	const kwtop = kbot - jw + 1;
	if ( kwtop === ktop ) {
		sR = 0.0;
		sI = 0.0;
	} else {
		sR = Hv[ oH + ( kwtop - 1 ) * sh1 + ( kwtop - 2 ) * sh2 ];
		sI = Hv[ oH + ( kwtop - 1 ) * sh1 + ( kwtop - 2 ) * sh2 + 1 ];
	}

	if ( kbot === kwtop ) {
		SHv[ oSH + ( kwtop - 1 ) * sSH ] = Hv[ oH + ( kwtop - 1 ) * sh1 + ( kwtop - 1 ) * sh2 ];
		SHv[ oSH + ( kwtop - 1 ) * sSH + 1 ] = Hv[ oH + ( kwtop - 1 ) * sh1 + ( kwtop - 1 ) * sh2 + 1 ];
		ns[ 0 ] = 1;
		nd[ 0 ] = 0;

		// Deflation test uses the spike magnitude `S` (zero when the window
		// starts at KTOP), NOT a direct read of H(kwtop,kwtop-1): when
		// kwtop === ktop === 1 that subdiagonal is out of bounds, which would
		// yield NaN and wrongly refuse to deflate the top eigenvalue.
		if ( ( Math.abs( sR ) + Math.abs( sI ) ) <= Math.max( smlnum, ULP * cabs1( Hv, oH + ( kwtop - 1 ) * sh1 + ( kwtop - 1 ) * sh2 ) ) ) {
			ns[ 0 ] = 0;
			nd[ 0 ] = 1;
			if ( kwtop > ktop ) {
				Hv[ oH + ( kwtop - 1 ) * sh1 + ( kwtop - 2 ) * sh2 ] = 0.0;
				Hv[ oH + ( kwtop - 1 ) * sh1 + ( kwtop - 2 ) * sh2 + 1 ] = 0.0;
			}
		}
		return WV;
	}

	// Copy trailing submatrix to T
	zlacpy( 'upper', jw, jw, H, strideH1, strideH2, offsetH + ( kwtop - 1 ) * strideH1 + ( kwtop - 1 ) * strideH2, T, strideT1, strideT2, offsetT );
	zcopy( jw - 1, H, strideH1 + strideH2, offsetH + kwtop * strideH1 + ( kwtop - 1 ) * strideH2, T, strideT1 + strideT2, offsetT + strideT1 );

	zlaset( 'all', jw, jw, CZERO, CONE, V, strideV1, strideV2, offsetV );

	// Compute Schur form: use zlaqr4 for windows larger than the DLAHQR/ZLAQR4 crossover, zlahqr for smaller ones
	nmin = ilaenv( 12, 'ZLAQR3', 'SV', jw, 1, jw, Math.floor( ( WORK.length - offsetWork ) / Math.abs( strideWork ) ) );
	if ( jw > nmin ) {
		infqr = zlaqr4( true, true, jw, 1, jw, T, strideT1, strideT2, offsetT, SH, strideSH, offsetSH + ( kwtop - 1 ) * strideSH, 1, jw, V, strideV1, strideV2, offsetV, WORK, strideWork, offsetWork );
	} else {
		infqr = zlahqr( true, true, jw, 1, jw, T, strideT1, strideT2, offsetT, SH, strideSH, offsetSH + ( kwtop - 1 ) * strideSH, 1, jw, V, strideV1, strideV2, offsetV );
	}

	// Deflation detection
	ns[ 0 ] = jw;
	ilst = infqr + 1;
	for ( knt = infqr + 1; knt <= jw; knt++ ) {
		foo = cabs1( Tv, oT + ( ns[ 0 ] - 1 ) * st1 + ( ns[ 0 ] - 1 ) * st2 );
		if ( foo === RZERO ) {
			foo = Math.abs( sR ) + Math.abs( sI );
		}
		const vTest = ( Math.abs( sR ) + Math.abs( sI ) ) * cabs1( Vv, oV + ( ns[ 0 ] - 1 ) * sv2 );
		if ( vTest <= Math.max( smlnum, ULP * foo ) ) {
			ns[ 0 ] -= 1;
		} else {
			ifst = ns[ 0 ];
			ztrexc( 'update', jw, T, strideT1, strideT2, offsetT, V, strideV1, strideV2, offsetV, ifst, ilst );
			ilst += 1;
		}
	}

	if ( ns[ 0 ] === 0 ) {
		sR = 0.0;
		sI = 0.0;
	}

	if ( ns[ 0 ] < jw ) {
		for ( i = infqr + 1; i <= ns[ 0 ]; i++ ) {
			ifst = i;
			for ( j = i + 1; j <= ns[ 0 ]; j++ ) {
				if ( cabs1( Tv, oT + ( j - 1 ) * st1 + ( j - 1 ) * st2 ) > cabs1( Tv, oT + ( ifst - 1 ) * st1 + ( ifst - 1 ) * st2 ) ) {
					ifst = j;
				}
			}
			ilst = i;
			if ( ifst !== ilst ) {
				ztrexc( 'update', jw, T, strideT1, strideT2, offsetT, V, strideV1, strideV2, offsetV, ifst, ilst );
			}
		}
	}

	for ( i = infqr + 1; i <= jw; i++ ) {
		SHv[ oSH + ( kwtop + i - 2 ) * sSH ] = Tv[ oT + ( i - 1 ) * st1 + ( i - 1 ) * st2 ];
		SHv[ oSH + ( kwtop + i - 2 ) * sSH + 1 ] = Tv[ oT + ( i - 1 ) * st1 + ( i - 1 ) * st2 + 1 ];
	}

	if ( ns[ 0 ] < jw || ( sR === 0.0 && sI === 0.0 ) ) {
		if ( ns[ 0 ] > 1 && ( sR !== 0.0 || sI !== 0.0 ) ) {
			zcopy( ns[ 0 ], V, strideV2, offsetV, WORK, strideWork, offsetWork );
			const WORKv = reinterpret( WORK, 0 );
			const oWk = offsetWork * 2;
			const sWk = strideWork * 2;
			for ( i = 0; i < ns[ 0 ]; i++ ) {
				WORKv[ oWk + i * sWk + 1 ] = -WORKv[ oWk + i * sWk + 1 ];
			}
			betaCA = new Complex128Array( 1 );
			betaV = reinterpret( betaCA, 0 );
			tauCA = new Complex128Array( 1 );
			tauV = reinterpret( tauCA, 0 );
			betaV[ 0 ] = WORKv[ oWk ];
			betaV[ 1 ] = WORKv[ oWk + 1 ];
			zlarfg( ns[ 0 ], betaCA, 0, WORK, strideWork, offsetWork + strideWork, tauCA, 0 );
			tauConjCA = new Complex128Array( 1 );
			tauConjV = reinterpret( tauConjCA, 0 );
			tauConjV[ 0 ] = tauV[ 0 ];
			tauConjV[ 1 ] = -tauV[ 1 ];
			WORKv[ oWk ] = 1.0;
			WORKv[ oWk + 1 ] = 0.0;

			zlaset( 'lower', jw - 2, jw - 2, CZERO, CZERO, T, strideT1, strideT2, offsetT + 2 * strideT1 );

			zlarf( 'left', ns[ 0 ], jw, WORK, strideWork, offsetWork, tauConjCA, 0, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork + jw * strideWork );
			zlarf( 'right', ns[ 0 ], ns[ 0 ], WORK, strideWork, offsetWork, tauCA, 0, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork + jw * strideWork );
			zlarf( 'right', jw, ns[ 0 ], WORK, strideWork, offsetWork, tauCA, 0, V, strideV1, strideV2, offsetV, WORK, strideWork, offsetWork + jw * strideWork );

			zgehrd( jw, 1, ns[ 0 ], T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork, WORK, strideWork, offsetWork + jw * strideWork );
		}

		if ( kwtop > 1 ) {
			const v11R = Vv[ oV ];
			const v11I = Vv[ oV + 1 ];
			Hv[ oH + ( kwtop - 1 ) * sh1 + ( kwtop - 2 ) * sh2 ] = sR * v11R + sI * v11I;
			Hv[ oH + ( kwtop - 1 ) * sh1 + ( kwtop - 2 ) * sh2 + 1 ] = -sR * v11I + sI * v11R;
		}
		zlacpy( 'upper', jw, jw, T, strideT1, strideT2, offsetT, H, strideH1, strideH2, offsetH + ( kwtop - 1 ) * strideH1 + ( kwtop - 1 ) * strideH2 );
		zcopy( jw - 1, T, strideT1 + strideT2, offsetT + strideT1, H, strideH1 + strideH2, offsetH + kwtop * strideH1 + ( kwtop - 1 ) * strideH2 );

		if ( ns[ 0 ] > 1 && ( sR !== 0.0 || sI !== 0.0 ) ) {
			zunmhr( 'right', 'no-transpose', jw, ns[ 0 ], 1, ns[ 0 ], T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork, V, strideV1, strideV2, offsetV, WORK, strideWork, offsetWork + jw * strideWork );
		}

		if ( wantt ) {
			ltop = 1;
		} else {
			ltop = ktop;
		}
		for ( krow = ltop; krow <= kwtop - 1; krow += nv ) {
			kln = Math.min( nv, kwtop - krow );
			zgemm( 'no-transpose', 'no-transpose', kln, jw, jw, CONE, H, strideH1, strideH2, offsetH + ( krow - 1 ) * strideH1 + ( kwtop - 1 ) * strideH2, V, strideV1, strideV2, offsetV, CZERO, WV, strideWV1, strideWV2, offsetWV );
			zlacpy( 'all', kln, jw, WV, strideWV1, strideWV2, offsetWV, H, strideH1, strideH2, offsetH + ( krow - 1 ) * strideH1 + ( kwtop - 1 ) * strideH2 );
		}

		if ( wantt ) {
			for ( kcol = kbot + 1; kcol <= N; kcol += nh ) {
				kln = Math.min( nh, N - kcol + 1 );
				zgemm( 'conjugate-transpose', 'no-transpose', jw, kln, jw, CONE, V, strideV1, strideV2, offsetV, H, strideH1, strideH2, offsetH + ( kwtop - 1 ) * strideH1 + ( kcol - 1 ) * strideH2, CZERO, T, strideT1, strideT2, offsetT );
				zlacpy( 'all', jw, kln, T, strideT1, strideT2, offsetT, H, strideH1, strideH2, offsetH + ( kwtop - 1 ) * strideH1 + ( kcol - 1 ) * strideH2 );
			}
		}

		if ( wantz ) {
			for ( krow = iloz; krow <= ihiz; krow += nv ) {
				kln = Math.min( nv, ihiz - krow + 1 );
				zgemm( 'no-transpose', 'no-transpose', kln, jw, jw, CONE, Z, strideZ1, strideZ2, offsetZ + ( krow - 1 ) * strideZ1 + ( kwtop - 1 ) * strideZ2, V, strideV1, strideV2, offsetV, CZERO, WV, strideWV1, strideWV2, offsetWV );
				zlacpy( 'all', kln, jw, WV, strideWV1, strideWV2, offsetWV, Z, strideZ1, strideZ2, offsetZ + ( krow - 1 ) * strideZ1 + ( kwtop - 1 ) * strideZ2 );
			}
		}
	}

	nd[ 0 ] = jw - ns[ 0 ];
	ns[ 0 ] -= infqr;

	return WV;
}


// EXPORTS //

export default zlaqr3;
export { computeOptimalWorkSize };
