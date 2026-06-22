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

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlamch from './../../../../lapack/base/dlamch/lib/base.js';
import dlaebz from './../../../../lapack/base/dlaebz/lib/base.js';


// VARIABLES //

var abs = Math.abs;
var min = Math.min;
var max = Math.max;
var log = Math.log;
var floor = Math.floor;

var ZERO = 0.0;
var TWO = 2.0;
var HALF = 0.5;
var FUDGE = 2.0;


// MAIN //

/**
* Computes the eigenvalues of a symmetric tridiagonal matrix to suitable accuracy.
*
* @private
* @param {string} range - `'all'`, `'value'`, or `'index'`
* @param {string} order - `'block'` or `'entire'`
* @param {NonNegativeInteger} N - order of the tridiagonal matrix
* @param {number} vl - lower bound of interval (range=`'value'`)
* @param {number} vu - upper bound of interval (range=`'value'`)
* @param {integer} il - index of smallest eigenvalue (range=`'index'`, 1-based)
* @param {integer} iu - index of largest eigenvalue (range=`'index'`, 1-based)
* @param {Float64Array} GERS - Gershgorin intervals, length 2*N
* @param {integer} strideGERS - stride for GERS
* @param {NonNegativeInteger} offsetGERS - starting index for GERS
* @param {number} reltol - relative tolerance
* @param {Float64Array} d - diagonal elements, length N
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} e - off-diagonal elements, length N-1
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @param {Float64Array} E2 - squares of off-diagonal elements, length N-1
* @param {integer} strideE2 - stride for E2
* @param {NonNegativeInteger} offsetE2 - starting index for E2
* @param {number} pivmin - minimum pivot value
* @param {integer} nsplit - number of diagonal blocks
* @param {Int32Array} ISPLIT - splitting points, length nsplit
* @param {integer} strideISPLIT - stride for ISPLIT
* @param {NonNegativeInteger} offsetISPLIT - starting index for ISPLIT
* @param {Float64Array} w - output: eigenvalues, length N
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Float64Array} WERR - output: eigenvalue uncertainty, length N
* @param {integer} strideWERR - stride for WERR
* @param {NonNegativeInteger} offsetWERR - starting index for WERR
* @param {Int32Array} IBLOCK - output: block indices, length N
* @param {integer} strideIBLOCK - stride for IBLOCK
* @param {NonNegativeInteger} offsetIBLOCK - starting index for IBLOCK
* @param {Int32Array} INDEXW - output: within-block indices, length N
* @param {integer} strideINDEXW - stride for INDEXW
* @param {NonNegativeInteger} offsetINDEXW - starting index for INDEXW
* @returns {Object} { info, m, nsplit, wl, wu }
*/
function dlarrd( range, order, N, vl, vu, il, iu, GERS, strideGERS, offsetGERS, reltol, d, strideD, offsetD, e, strideE, offsetE, E2, strideE2, offsetE2, pivmin, nsplit, ISPLIT, strideISPLIT, offsetISPLIT, w, strideW, offsetW, WERR, strideWERR, offsetWERR, IBLOCK, strideIBLOCK, offsetIBLOCK, INDEXW, strideINDEXW, offsetINDEXW ) { // eslint-disable-line max-len, max-params
	var iwScratch;
	var wScratch;
	var nvalWork;
	var nabWork;
	var ncnvrg;
	var toofew;
	var irange;
	var ibegin;
	var idiscl;
	var idiscu;
	var idumma;
	var abWork;
	var cWork;
	var iinfo;
	var iwoff;
	var wkill;
	var atoli;
	var rtoli;
	var itmax;
	var itmp1;
	var itmp2;
	var jdisc;
	var uflow;
	var tnorm;
	var iout;
	var info;
	var ioff;
	var iend;
	var jblk;
	var tmp1;
	var tmp2;
	var mout;
	var nwl;
	var nwu;
	var wlu;
	var wul;
	var inn;
	var eps;
	var jee;
	var nb;
	var gl;
	var gu;
	var im;
	var wl;
	var wu;
	var ib;
	var ie;
	var iw;
	var je;
	var m;
	var i;
	var j;

	info = 0;
	m = 0;
	wl = 0.0;
	wu = 0.0;

	// Quick return
	if ( N <= 0 ) {
		return {
			'info': 0,
			'm': 0,
			'nsplit': nsplit,
			'wl': wl,
			'wu': wu
		};
	}

	// Decode RANGE
	if ( range === 'all' ) {
		irange = 1;
	} else if ( range === 'value' ) {
		irange = 2;
	} else if ( range === 'index' ) {
		irange = 3;
	} else {
		irange = 0;
	}

	// Check for errors
	if ( irange <= 0 ) {
		info = -1;
	} else if ( !( order === 'block' || order === 'entire' ) ) {
		info = -2;
	} else if ( N < 0 ) {
		info = -3;
	} else if ( irange === 2 ) {
		if ( vl >= vu ) {
			info = -5;
		}
	} else if ( irange === 3 && ( il < 1 || il > max( 1, N ) ) ) {
		info = -6;
	} else if ( irange === 3 && ( iu < min( N, il ) || iu > N ) ) {
		info = -7;
	}

	if ( info !== 0 ) {
		return {
			'info': info,
			'm': 0,
			'nsplit': nsplit,
			'wl': wl,
			'wu': wu
		};
	}

	ncnvrg = false;
	toofew = false;

	// Simplification
	if ( irange === 3 && il === 1 && iu === N ) {
		irange = 1;
	}

	// Get machine constants
	eps = dlamch( 'precision' );
	uflow = dlamch( 'safe-minimum' );

	// Special case N=1
	if ( N === 1 ) {
		if (
			irange === 1 ||
			( irange === 2 && d[ offsetD ] > vl && d[ offsetD ] <= vu ) ||
			( irange === 3 && il === 1 && iu === 1 )
		) {
			m = 1;
			w[ offsetW ] = d[ offsetD ];
			WERR[ offsetWERR ] = ZERO;
			IBLOCK[ offsetIBLOCK ] = 1;
			INDEXW[ offsetINDEXW ] = 1;
		}
		return {
			'info': 0,
			'm': m,
			'nsplit': nsplit,
			'wl': wl,
			'wu': wu
		};
	}

	nb = 0;

	// Global Gershgorin interval
	gl = d[ offsetD ];
	gu = d[ offsetD ];
	for ( i = 0; i < N; i++ ) {
		gl = min( gl, GERS[ offsetGERS + (((2 * i)) * strideGERS) ] );
		gu = max( gu, GERS[ offsetGERS + (((2 * i) + 1) * strideGERS) ] );
	}
	tnorm = max( abs( gl ), abs( gu ) );
	gl = gl - ( FUDGE * tnorm * eps * N ) - ( FUDGE * TWO * pivmin );
	gu = gu + ( FUDGE * tnorm * eps * N ) + ( FUDGE * TWO * pivmin );
	rtoli = reltol;
	atoli = ( FUDGE * TWO * uflow ) + ( FUDGE * TWO * pivmin );

	if ( irange === 3 ) {
		itmax = floor( ( log( tnorm + pivmin ) - log( pivmin ) ) / log( TWO ) ) + 2;

		// Set up 2 search intervals for dlaebz IJOB=3
		abWork = new Float64Array( 4 );
		nabWork = new Int32Array( 4 );
		cWork = new Float64Array( 2 );
		nvalWork = new Int32Array( 2 );
		wScratch = new Float64Array( 2 );
		iwScratch = new Int32Array( 2 );
		mout = new Int32Array( 1 );

		abWork[ 0 ] = gl; // AB(1,1)
		abWork[ 1 ] = gl; // AB(2,1)
		abWork[ 2 ] = gu; // AB(1,2)
		abWork[ 3 ] = gu; // AB(2,2)
		cWork[ 0 ] = gl;
		cWork[ 1 ] = gu;
		nabWork[ 0 ] = -1;
		nabWork[ 1 ] = -1;
		nabWork[ 2 ] = N + 1;
		nabWork[ 3 ] = N + 1;
		nvalWork[ 0 ] = il - 1;
		nvalWork[ 1 ] = iu;

		iinfo = dlaebz( 3, itmax, N, 2, 2, nb, atoli, rtoli, pivmin, d, strideD, offsetD, e, strideE, offsetE, E2, strideE2, offsetE2, nvalWork, 1, 0, abWork, 1, 2, 0, cWork, 1, 0, mout, nabWork, 1, 2, 0, wScratch, 1, 0, iwScratch, 1, 0 );
		if ( iinfo !== 0 ) {
			return {
				'info': iinfo,
				'm': 0,
				'nsplit': nsplit,
				'wl': wl,
				'wu': wu
			};
		}

		if ( nvalWork[ 1 ] === iu ) {
			wl = abWork[ 0 ];
			wlu = abWork[ 2 ];
			nwl = nabWork[ 0 ];
			wu = abWork[ 3 ];
			wul = abWork[ 1 ];
			nwu = nabWork[ 3 ];
		} else {
			wl = abWork[ 1 ];
			wlu = abWork[ 3 ];
			nwl = nabWork[ 1 ];
			wu = abWork[ 2 ];
			wul = abWork[ 0 ];
			nwu = nabWork[ 2 ];
		}

		if ( nwl < 0 || nwl >= N || nwu < 1 || nwu > N ) {
			return {
				'info': 4,
				'm': 0,
				'nsplit': nsplit,
				'wl': wl,
				'wu': wu
			};
		}
	} else if ( irange === 2 ) {
		wl = vl;
		wu = vu;
	} else {
		wl = gl;
		wu = gu;
	}

	// Find Eigenvalues -- Loop Over Blocks
	m = 0;
	iend = 0;
	info = 0;
	nwl = 0;
	nwu = 0;

	mout = new Int32Array( 1 );
	idumma = new Int32Array( 1 );

	for ( jblk = 0; jblk < nsplit; jblk++ ) {
		ioff = iend;
		ibegin = ioff;
		iend = ISPLIT[ offsetISPLIT + (jblk * strideISPLIT) ];
		inn = iend - ioff;

		if ( inn === 1 ) {
			// Special Case -- IN=1
			if ( wl >= d[ offsetD + (ibegin * strideD) ] - pivmin ) {
				nwl += 1;
			}
			if ( wu >= d[ offsetD + (ibegin * strideD) ] - pivmin ) {
				nwu += 1;
			}
			if (
				irange === 1 ||
				(
					wl < d[ offsetD + (ibegin * strideD) ] - pivmin &&
					wu >= d[ offsetD + (ibegin * strideD) ] - pivmin
				)
			) {
				w[ offsetW + (m * strideW) ] = d[ offsetD + (ibegin * strideD) ];
				WERR[ offsetWERR + (m * strideWERR) ] = ZERO;
				IBLOCK[ offsetIBLOCK + (m * strideIBLOCK) ] = jblk + 1;
				INDEXW[ offsetINDEXW + (m * strideINDEXW) ] = 1;
				m += 1;
			}
		} else {
			// General Case IN > 1
			gu = d[ offsetD + (ibegin * strideD) ];
			gl = d[ offsetD + (ibegin * strideD) ];
			tmp1 = ZERO;

			for ( j = ibegin; j < iend; j++ ) {
				gl = min( gl, GERS[ offsetGERS + (((2 * j)) * strideGERS) ] );
				gu = max( gu, GERS[ offsetGERS + (((2 * j) + 1) * strideGERS) ] );
			}
			gl = gl - ( FUDGE * tnorm * eps * inn ) - ( FUDGE * pivmin );
			gu = gu + ( FUDGE * tnorm * eps * inn ) + ( FUDGE * pivmin );

			if ( irange > 1 ) {
				if ( gu < wl ) {
					nwl += inn;
					nwu += inn;
					continue;
				}
				gl = max( gl, wl );
				gu = min( gu, wu );
				if ( gl >= gu ) {
					continue;
				}
			}

			// Allocate local arrays for dlaebz calls
			abWork = new Float64Array( inn * 2 );
			nabWork = new Int32Array( inn * 2 );
			cWork = new Float64Array( inn );
			wScratch = new Float64Array( inn );
			iwScratch = new Int32Array( inn );

			abWork[ 0 ] = gl;
			abWork[ inn ] = gu;

			// IJOB=1: count eigenvalues
			iinfo = dlaebz( 1, 0, inn, inn, 1, nb, atoli, rtoli, pivmin, d, strideD, offsetD + (ibegin * strideD), e, strideE, offsetE + (ibegin * strideE), E2, strideE2, offsetE2 + (ibegin * strideE2), idumma, 1, 0, abWork, 1, inn, 0, cWork, 1, 0, mout, nabWork, 1, inn, 0, wScratch, 1, 0, iwScratch, 1, 0 );
			if ( iinfo !== 0 ) {
				return {
					'info': iinfo,
					'm': m,
					'nsplit': nsplit,
					'wl': wl,
					'wu': wu
				};
			}

			nwl += nabWork[ 0 ];
			nwu += nabWork[ inn ];
			iwoff = m - nabWork[ 0 ];
			im = mout[ 0 ];

			// IJOB=2: bisect to compute eigenvalues
			itmax = floor( ( log( gu - gl + pivmin ) - log( pivmin ) ) / log( TWO ) ) + 2;
			iinfo = dlaebz( 2, itmax, inn, inn, 1, nb, atoli, rtoli, pivmin, d, strideD, offsetD + (ibegin * strideD), e, strideE, offsetE + (ibegin * strideE), E2, strideE2, offsetE2 + (ibegin * strideE2), idumma, 1, 0, abWork, 1, inn, 0, cWork, 1, 0, mout, nabWork, 1, inn, 0, wScratch, 1, 0, iwScratch, 1, 0 );
			if ( iinfo < 0 ) {
				return {
					'info': iinfo,
					'm': m,
					'nsplit': nsplit,
					'wl': wl,
					'wu': wu
				};
			}
			iout = mout[ 0 ];

			// Copy eigenvalues and errors into W, WERR, INDEXW, IBLOCK
			for ( j = 0; j < iout; j++ ) {
				tmp1 = HALF * ( abWork[ j ] + abWork[ j + inn ] );
				tmp2 = HALF * abs( abWork[ j + inn ] - abWork[ j ] );

				if ( j > iout - 1 - iinfo ) {
					ncnvrg = true;
					ib = -(jblk + 1);
				} else {
					ib = jblk + 1;
				}
				for ( je = nabWork[ j ] + iwoff; je < nabWork[ j + inn ] + iwoff; je++ ) {
					w[ offsetW + (je * strideW) ] = tmp1;
					WERR[ offsetWERR + (je * strideWERR) ] = tmp2;
					INDEXW[ offsetINDEXW + (je * strideINDEXW) ] = je - iwoff + 1;
					IBLOCK[ offsetIBLOCK + (je * strideIBLOCK) ] = ib;
				}
			}

			m += im;
		}
	}

	// If range=`'index'`, trim eigenvalues outside [il, iu]
	if ( irange === 3 ) {
		idiscl = il - 1 - nwl;
		idiscu = nwu - iu;

		if ( idiscl > 0 ) {
			im = 0;
			for ( je = 0; je < m; je++ ) {
				if ( w[ offsetW + (je * strideW) ] <= wlu && idiscl > 0 ) {
					idiscl -= 1;
				} else {
					w[ offsetW + (im * strideW) ] = w[ offsetW + (je * strideW) ];
					WERR[ offsetWERR + (im * strideWERR) ] = WERR[ offsetWERR + (je * strideWERR) ];
					INDEXW[ offsetINDEXW + (im * strideINDEXW) ] = INDEXW[ offsetINDEXW + (je * strideINDEXW) ];
					IBLOCK[ offsetIBLOCK + (im * strideIBLOCK) ] = IBLOCK[ offsetIBLOCK + (je * strideIBLOCK) ];
					im += 1;
				}
			}
			m = im;
		}
		if ( idiscu > 0 ) {
			im = m;
			for ( je = m - 1; je >= 0; je-- ) {
				if ( w[ offsetW + (je * strideW) ] >= wul && idiscu > 0 ) {
					idiscu -= 1;
				} else {
					im -= 1;
					w[ offsetW + (im * strideW) ] = w[ offsetW + (je * strideW) ];
					WERR[ offsetWERR + (im * strideWERR) ] = WERR[ offsetWERR + (je * strideWERR) ];
					INDEXW[ offsetINDEXW + (im * strideINDEXW) ] = INDEXW[ offsetINDEXW + (je * strideINDEXW) ];
					IBLOCK[ offsetIBLOCK + (im * strideIBLOCK) ] = IBLOCK[ offsetIBLOCK + (je * strideIBLOCK) ];
				}
			}
			jee = 0;
			for ( je = im; je < m; je++ ) {
				w[ offsetW + (jee * strideW) ] = w[ offsetW + (je * strideW) ];
				WERR[ offsetWERR + (jee * strideWERR) ] = WERR[ offsetWERR + (je * strideWERR) ];
				INDEXW[ offsetINDEXW + (jee * strideINDEXW) ] = INDEXW[ offsetINDEXW + (je * strideINDEXW) ];
				IBLOCK[ offsetIBLOCK + (jee * strideIBLOCK) ] = IBLOCK[ offsetIBLOCK + (je * strideIBLOCK) ];
				jee += 1;
			}
			m -= im;
		}

		if ( idiscl > 0 || idiscu > 0 ) {
			if ( idiscl > 0 ) {
				wkill = wu;
				for ( jdisc = 0; jdisc < idiscl; jdisc++ ) {
					iw = -1;
					for ( je = 0; je < m; je++ ) {
						if (
							IBLOCK[ offsetIBLOCK + (je * strideIBLOCK) ] !== 0 &&
							( w[ offsetW + (je * strideW) ] < wkill || iw === -1 )
						) {
							iw = je;
							wkill = w[ offsetW + (je * strideW) ];
						}
					}
					IBLOCK[ offsetIBLOCK + (iw * strideIBLOCK) ] = 0;
				}
			}
			if ( idiscu > 0 ) {
				wkill = wl;
				for ( jdisc = 0; jdisc < idiscu; jdisc++ ) {
					iw = -1;
					for ( je = 0; je < m; je++ ) {
						if (
							IBLOCK[ offsetIBLOCK + (je * strideIBLOCK) ] !== 0 &&
							( w[ offsetW + (je * strideW) ] >= wkill || iw === -1 )
						) {
							iw = je;
							wkill = w[ offsetW + (je * strideW) ];
						}
					}
					IBLOCK[ offsetIBLOCK + (iw * strideIBLOCK) ] = 0;
				}
			}
			im = 0;
			for ( je = 0; je < m; je++ ) {
				if ( IBLOCK[ offsetIBLOCK + (je * strideIBLOCK) ] !== 0 ) {
					w[ offsetW + (im * strideW) ] = w[ offsetW + (je * strideW) ];
					WERR[ offsetWERR + (im * strideWERR) ] = WERR[ offsetWERR + (je * strideWERR) ];
					INDEXW[ offsetINDEXW + (im * strideINDEXW) ] = INDEXW[ offsetINDEXW + (je * strideINDEXW) ];
					IBLOCK[ offsetIBLOCK + (im * strideIBLOCK) ] = IBLOCK[ offsetIBLOCK + (je * strideIBLOCK) ];
					im += 1;
				}
			}
			m = im;
		}
		if ( idiscl < 0 || idiscu < 0 ) {
			toofew = true;
		}
	}

	if (
		( irange === 1 && m !== N ) ||
		( irange === 3 && m !== iu - il + 1 )
	) {
		toofew = true;
	}

	// If order='entire', sort eigenvalues from smallest to largest
	if ( order === 'entire' && nsplit > 1 ) {
		for ( je = 0; je < m - 1; je++ ) {
			ie = -1;
			tmp1 = w[ offsetW + (je * strideW) ];
			for ( j = je + 1; j < m; j++ ) {
				if ( w[ offsetW + (j * strideW) ] < tmp1 ) {
					ie = j;
					tmp1 = w[ offsetW + (j * strideW) ];
				}
			}
			if ( ie !== -1 ) {
				tmp2 = WERR[ offsetWERR + (ie * strideWERR) ];
				itmp1 = IBLOCK[ offsetIBLOCK + (ie * strideIBLOCK) ];
				itmp2 = INDEXW[ offsetINDEXW + (ie * strideINDEXW) ];
				w[ offsetW + (ie * strideW) ] = w[ offsetW + (je * strideW) ];
				WERR[ offsetWERR + (ie * strideWERR) ] = WERR[ offsetWERR + (je * strideWERR) ];
				IBLOCK[ offsetIBLOCK + (ie * strideIBLOCK) ] = IBLOCK[ offsetIBLOCK + (je * strideIBLOCK) ];
				INDEXW[ offsetINDEXW + (ie * strideINDEXW) ] = INDEXW[ offsetINDEXW + (je * strideINDEXW) ];
				w[ offsetW + (je * strideW) ] = tmp1;
				WERR[ offsetWERR + (je * strideWERR) ] = tmp2;
				IBLOCK[ offsetIBLOCK + (je * strideIBLOCK) ] = itmp1;
				INDEXW[ offsetINDEXW + (je * strideINDEXW) ] = itmp2;
			}
		}
	}

	info = 0;
	if ( ncnvrg ) {
		info += 1;
	}
	if ( toofew ) {
		info += 2;
	}

	return {
		'info': info,
		'm': m,
		'nsplit': nsplit,
		'wl': wl,
		'wu': wu
	};
}


// EXPORTS //

export default dlarrd;
