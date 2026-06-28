/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, no-var */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zgehrd from '../../zgehrd/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zlahqr from '../../zlahqr/lib/base.js';
import zlarf from '../../zlarf/lib/base.js';
import zlarfg from '../../zlarfg/lib/base.js';
import zlaset from '../../zlaset/lib/base.js';
import ztrexc from '../../ztrexc/lib/base.js';
import zunmhr from '../../zunmhr/lib/base.js';


// VARIABLES //

var CZERO = new Complex128( 0.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );
var RZERO = 0.0;
var SAFMIN = dlamch( 'safe-minimum' );
var ULP = dlamch( 'precision' );


// FUNCTIONS //

function cabs1( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Aggressive early deflation for the complex QR algorithm (non-recursive version).
*
* All indices are 1-based (Fortran convention).
*
* Returns { ns, nd } — number of unconverged (shift) eigenvalues and number deflated.
*
* @private
*/
function zlaqr2( wantt, wantz, N, ktop, kbot, nw, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, ns, nd, SH, strideSH, offsetSH, V, strideV1, strideV2, offsetV, nhp, T, strideT1, strideT2, offsetT, nvp, WV, strideWV1, strideWV2, offsetWV, WORK, strideWork, offsetWork, lwork ) {
	var smlnum;
	var infqr;
	var kwtop;
	var ltop;
	var kcol;
	var krow;
	var kln;
	var jw;
	var Hv;
	var Tv;
	var Vv;
	var SHv;
	var sh1;
	var sh2;
	var oH;
	var st1;
	var st2;
	var oT;
	var sv2;
	var oV;
	var sSH;
	var oSH;
	var sR;
	var sI;
	var foo;
	var ifst;
	var ilst;
	var knt;
	var betaCA;
	var betaV;
	var tauCA;
	var tauV;
	var i;
	var j;

	jw = Math.min( nw, kbot - ktop + 1 );

	// Quick return if workspace query
	if ( lwork === -1 ) {
		return { 'ns': 0, 'nd': 0 };
	}

	ns = 0;
	nd = 0;

	if ( ktop > kbot ) {
		return { 'ns': 0, 'nd': 0 };
	}
	if ( nw < 1 ) {
		return { 'ns': 0, 'nd': 0 };
	}

	Hv = reinterpret( H, 0 );
	sh1 = strideH1 * 2;
	sh2 = strideH2 * 2;
	oH = offsetH * 2;

	Tv = reinterpret( T, 0 );
	st1 = strideT1 * 2;
	st2 = strideT2 * 2;
	oT = offsetT * 2;

	Vv = reinterpret( V, 0 );
	sv2 = strideV2 * 2;
	oV = offsetV * 2;

	SHv = reinterpret( SH, 0 );
	sSH = strideSH * 2;
	oSH = offsetSH * 2;

	smlnum = SAFMIN * ( N / ULP );

	kwtop = kbot - jw + 1;
	if ( kwtop === ktop ) {
		sR = 0.0;
		sI = 0.0;
	} else {
		sR = Hv[ oH + ( kwtop - 1 ) * sh1 + ( kwtop - 2 ) * sh2 ];
		sI = Hv[ oH + ( kwtop - 1 ) * sh1 + ( kwtop - 2 ) * sh2 + 1 ];
	}

	if ( kbot === kwtop ) {
		// 1x1 window
		SHv[ oSH + ( kwtop - 1 ) * sSH ] = Hv[ oH + ( kwtop - 1 ) * sh1 + ( kwtop - 1 ) * sh2 ];
		SHv[ oSH + ( kwtop - 1 ) * sSH + 1 ] = Hv[ oH + ( kwtop - 1 ) * sh1 + ( kwtop - 1 ) * sh2 + 1 ];
		ns = 1;
		nd = 0;
		if ( cabs1( Hv, oH + ( kwtop - 1 ) * sh1 + ( kwtop - 2 ) * sh2 ) <= Math.max( smlnum, ULP * cabs1( Hv, oH + ( kwtop - 1 ) * sh1 + ( kwtop - 1 ) * sh2 ) ) ) {
			ns = 0;
			nd = 1;
			if ( kwtop > ktop ) {
				Hv[ oH + ( kwtop - 1 ) * sh1 + ( kwtop - 2 ) * sh2 ] = 0.0;
				Hv[ oH + ( kwtop - 1 ) * sh1 + ( kwtop - 2 ) * sh2 + 1 ] = 0.0;
			}
		}
		return { 'ns': ns, 'nd': nd };
	}

	// Copy the trailing submatrix to T
	zlacpy( 'upper', jw, jw, H, strideH1, strideH2, offsetH + ( kwtop - 1 ) * strideH1 + ( kwtop - 1 ) * strideH2, T, strideT1, strideT2, offsetT );

	// Copy subdiagonal
	zcopy( jw - 1, H, strideH1 + strideH2, offsetH + kwtop * strideH1 + ( kwtop - 1 ) * strideH2, T, strideT1 + strideT2, offsetT + strideT1 );

	// Initialize V to identity
	zlaset( 'full', jw, jw, CZERO, CONE, V, strideV1, strideV2, offsetV );

	// Compute Schur form of T
	infqr = zlahqr( true, true, jw, 1, jw, T, strideT1, strideT2, offsetT, SH, strideSH, offsetSH + ( kwtop - 1 ) * strideSH, 1, jw, V, strideV1, strideV2, offsetV );

	// Deflation detection
	ns = jw;
	ilst = infqr + 1;
	for ( knt = infqr + 1; knt <= jw; knt++ ) {
		foo = cabs1( Tv, oT + ( ns - 1 ) * st1 + ( ns - 1 ) * st2 );
		if ( foo === RZERO ) {
			foo = Math.abs( sR ) + Math.abs( sI );
		}
		var vTest = ( Math.abs( sR ) + Math.abs( sI ) ) * cabs1( Vv, oV + ( ns - 1 ) * sv2 );
		if ( vTest <= Math.max( smlnum, ULP * foo ) ) {
			ns -= 1;
		} else {
			ifst = ns;
			ztrexc( 'update', jw, T, strideT1, strideT2, offsetT, V, strideV1, strideV2, offsetV, ifst, ilst );
			ilst += 1;
		}
	}

	// Clear S if all deflated
	if ( ns === 0 ) {
		sR = 0.0;
		sI = 0.0;
	}

	if ( ns < jw ) {
		// Sort converged eigenvalues by magnitude (selection sort)
		for ( i = infqr + 1; i <= ns; i++ ) {
			ifst = i;
			for ( j = i + 1; j <= ns; j++ ) {
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

	// Copy eigenvalues from T diagonal to SH
	for ( i = infqr + 1; i <= jw; i++ ) {
		SHv[ oSH + ( kwtop + i - 2 ) * sSH ] = Tv[ oT + ( i - 1 ) * st1 + ( i - 1 ) * st2 ];
		SHv[ oSH + ( kwtop + i - 2 ) * sSH + 1 ] = Tv[ oT + ( i - 1 ) * st1 + ( i - 1 ) * st2 + 1 ];
	}

	// Transform and deflate
	if ( ns < jw || ( sR === 0.0 && sI === 0.0 ) ) {
		if ( ns > 1 && ( sR !== 0.0 || sI !== 0.0 ) ) {
			// Deflate by applying reflector
			zcopy( ns, V, strideV1, offsetV, WORK, strideWork, offsetWork );

			// Conjugate
			var WORKv = reinterpret( WORK, 0 );
			var oWk = offsetWork * 2;
			var sWk = strideWork * 2;
			for ( i = 0; i < ns; i++ ) {
				WORKv[ oWk + i * sWk + 1 ] = -WORKv[ oWk + i * sWk + 1 ];
			}
			betaCA = new Complex128Array( 1 );
			betaV = reinterpret( betaCA, 0 );
			tauCA = new Complex128Array( 1 );
			tauV = reinterpret( tauCA, 0 );
			betaV[ 0 ] = WORKv[ oWk ];
			betaV[ 1 ] = WORKv[ oWk + 1 ];
			zlarfg( ns, betaCA, 0, WORK, strideWork, offsetWork + strideWork, tauCA, 0 );
			WORKv[ oWk ] = 1.0;
			WORKv[ oWk + 1 ] = 0.0;

			zlaset( 'lower', jw - 2, jw - 2, CZERO, CZERO, T, strideT1, strideT2, offsetT + 2 * strideT1 );

			zlarf( 'left', ns, jw, WORK, strideWork, offsetWork, new Complex128( tauV[ 0 ], -tauV[ 1 ] ), T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork + jw * strideWork );
			zlarf( 'right', ns, ns, WORK, strideWork, offsetWork, new Complex128( tauV[ 0 ], tauV[ 1 ] ), T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork + jw * strideWork );
			zlarf( 'right', jw, ns, WORK, strideWork, offsetWork, new Complex128( tauV[ 0 ], tauV[ 1 ] ), V, strideV1, strideV2, offsetV, WORK, strideWork, offsetWork + jw * strideWork );

			zgehrd( jw, 1, ns, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork, WORK, strideWork, offsetWork + jw * strideWork );
		}

		// Copy T back to H
		if ( kwtop > 1 ) {
			// H(KWTOP, KWTOP-1) = S * CONJ(V(1,1))
			var v11R = Vv[ oV ];
			var v11I = Vv[ oV + 1 ];
			Hv[ oH + ( kwtop - 1 ) * sh1 + ( kwtop - 2 ) * sh2 ] = sR * v11R + sI * v11I;
			Hv[ oH + ( kwtop - 1 ) * sh1 + ( kwtop - 2 ) * sh2 + 1 ] = -sR * v11I + sI * v11R;
		}
		zlacpy( 'upper', jw, jw, T, strideT1, strideT2, offsetT, H, strideH1, strideH2, offsetH + ( kwtop - 1 ) * strideH1 + ( kwtop - 1 ) * strideH2 );
		zcopy( jw - 1, T, strideT1 + strideT2, offsetT + strideT1, H, strideH1 + strideH2, offsetH + kwtop * strideH1 + ( kwtop - 1 ) * strideH2 );

		// Apply back-transformation
		if ( ns > 1 && ( sR !== 0.0 || sI !== 0.0 ) ) {
			zunmhr( 'right', 'no-transpose', jw, ns, 1, ns, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork, V, strideV1, strideV2, offsetV, WORK, strideWork, offsetWork + jw * strideWork, lwork - jw );
		}

		// Update H with V
		if ( wantt ) {
			ltop = 1;
		} else {
			ltop = ktop;
		}
		for ( krow = ltop; krow <= kwtop - 1; krow += nvp ) {
			kln = Math.min( nvp, kwtop - krow );
			zgemm( 'no-transpose', 'no-transpose', kln, jw, jw, CONE, H, strideH1, strideH2, offsetH + ( krow - 1 ) * strideH1 + ( kwtop - 1 ) * strideH2, V, strideV1, strideV2, offsetV, CZERO, WV, strideWV1, strideWV2, offsetWV );
			zlacpy( 'full', kln, jw, WV, strideWV1, strideWV2, offsetWV, H, strideH1, strideH2, offsetH + ( krow - 1 ) * strideH1 + ( kwtop - 1 ) * strideH2 );
		}

		if ( wantt ) {
			for ( kcol = kbot + 1; kcol <= N; kcol += nhp ) {
				kln = Math.min( nhp, N - kcol + 1 );
				zgemm( 'conjugate-transpose', 'no-transpose', jw, kln, jw, CONE, V, strideV1, strideV2, offsetV, H, strideH1, strideH2, offsetH + ( kwtop - 1 ) * strideH1 + ( kcol - 1 ) * strideH2, CZERO, T, strideT1, strideT2, offsetT );
				zlacpy( 'full', jw, kln, T, strideT1, strideT2, offsetT, H, strideH1, strideH2, offsetH + ( kwtop - 1 ) * strideH1 + ( kcol - 1 ) * strideH2 );
			}
		}

		if ( wantz ) {
			for ( krow = iloz; krow <= ihiz; krow += nvp ) {
				kln = Math.min( nvp, ihiz - krow + 1 );
				zgemm( 'no-transpose', 'no-transpose', kln, jw, jw, CONE, Z, strideZ1, strideZ2, offsetZ + ( krow - 1 ) * strideZ1 + ( kwtop - 1 ) * strideZ2, V, strideV1, strideV2, offsetV, CZERO, WV, strideWV1, strideWV2, offsetWV );
				zlacpy( 'full', kln, jw, WV, strideWV1, strideWV2, offsetWV, Z, strideZ1, strideZ2, offsetZ + ( krow - 1 ) * strideZ1 + ( kwtop - 1 ) * strideZ2 );
			}
		}
	}

	nd = jw - ns;
	ns -= infqr;

	return { 'ns': ns, 'nd': nd };
}


// EXPORTS //

export default zlaqr2;
