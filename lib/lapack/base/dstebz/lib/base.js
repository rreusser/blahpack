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
import dlaebz from './../../dlaebz/lib/base.js';
import dlamch from './../../dlamch/lib/base.js';


// VARIABLES //

var abs = Math.abs;
var min = Math.min;
var max = Math.max;
var log = Math.log;
var sqrt = Math.sqrt;
var floor = Math.floor;

var ZERO = 0.0;
var ONE = 1.0;
var TWO = 2.0;
var HALF = 0.5;
var FUDGE = 2.1;
var RELFAC = 2.0;


// MAIN //

/**
* Computes selected eigenvalues of a real symmetric tridiagonal matrix T.
* by bisection.
*
* @private
* @param {string} range - `'all'`, `'value'`, or `'index'`
* @param {string} order - `'block'` or `'entire'`
* @param {NonNegativeInteger} N - order of the tridiagonal matrix
* @param {number} vl - lower bound of interval (range=`'value'`)
* @param {number} vu - upper bound of interval (range=`'value'`)
* @param {integer} il - index of smallest eigenvalue (range=`'index'`, 1-based)
* @param {integer} iu - index of largest eigenvalue (range=`'index'`, 1-based)
* @param {number} abstol - absolute tolerance for eigenvalues
* @param {Float64Array} d - diagonal elements, length N
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} e - off-diagonal elements, length N-1
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @param {Int32Array} M - output: number of eigenvalues found (M[0])
* @param {Int32Array} nsplit - output: number of diagonal blocks (nsplit[0])
* @param {Float64Array} w - output: eigenvalues, length N
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Int32Array} IBLOCK - output: block indices for eigenvalues
* @param {integer} strideIBLOCK - stride for IBLOCK
* @param {NonNegativeInteger} offsetIBLOCK - starting index for IBLOCK
* @param {Int32Array} ISPLIT - output: splitting points
* @param {integer} strideISPLIT - stride for ISPLIT
* @param {NonNegativeInteger} offsetISPLIT - starting index for ISPLIT
* @param {Float64Array} WORK - workspace, length 4*N
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {Int32Array} IWORK - workspace, length 3*N
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @returns {integer} info
*/
function dstebz( range, order, N, vl, vu, il, iu, abstol, d, strideD, offsetD, e, strideE, offsetE, M, nsplit, w, strideW, offsetW, IBLOCK, strideIBLOCK, offsetIBLOCK, ISPLIT, strideISPLIT, offsetISPLIT, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	var iwScratch;
	var wScratch;
	var nabWork;
	var ncnvrg;
	var toofew;
	var irange;
	var iorder;
	var ibegin;
	var idiscl;
	var idiscu;
	var pivmin;
	var safemn;
	var idumma;
	var abWork;
	var bnorm;
	var tnorm;
	var iinfo;
	var iwoff;
	var wkill;
	var atoli;
	var rtoli;
	var itmax;
	var itmp1;
	var jdisc;
	var cWork;
	var iout;
	var info;
	var ioff;
	var iend;
	var tmp1;
	var tmp2;
	var mout;
	var nwl;
	var nwu;
	var wlu;
	var wul;
	var in_;
	var ulp;
	var nsp;
	var nb;
	var gl;
	var gu;
	var im;
	var wl;
	var wu;
	var ib;
	var ie;
	var iw;
	var jb;
	var je;
	var m;
	var j;

	info = 0;

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

	// Decode ORDER
	if ( order === 'block' ) {
		iorder = 2;
	} else if ( order === 'entire' ) {
		iorder = 1;
	} else {
		iorder = 0;
	}

	// Check for errors
	if ( irange <= 0 ) {
		info = -1;
	} else if ( iorder <= 0 ) {
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
		return info;
	}

	// Initialize error flags
	info = 0;
	ncnvrg = false;
	toofew = false;

	// Quick return if possible
	m = 0;
	M[ 0 ] = 0;
	if ( N === 0 ) {
		return info;
	}

	// Simplifications
	if ( irange === 3 && il === 1 && iu === N ) {
		irange = 1;
	}

	// Get machine constants
	safemn = dlamch( 'safe-minimum' );
	ulp = dlamch( 'precision' );
	rtoli = ulp * RELFAC;
	nb = 0;

	// Special case when N=1
	if ( N === 1 ) {
		nsplit[ 0 ] = 1;
		ISPLIT[ offsetISPLIT ] = 1;
		if ( irange === 2 && ( vl >= d[ offsetD ] || vu < d[ offsetD ] ) ) {
			M[ 0 ] = 0;
		} else {
			w[ offsetW ] = d[ offsetD ];
			IBLOCK[ offsetIBLOCK ] = 1;
			M[ 0 ] = 1;
		}
		return info;
	}

	// Compute Splitting Points
	// WORK[0..N-1] stores E2 (squared off-diags), with WORK[N-1]=0
	nsp = 1;
	WORK[ offsetWork + ((N - 1) * strideWork) ] = ZERO;
	pivmin = ONE;

	for ( j = 1; j < N; j++ ) {
		tmp1 = e[ offsetE + ((j - 1) * strideE) ] * e[ offsetE + ((j - 1) * strideE) ];
		if ( abs( d[ offsetD + (j * strideD) ] * d[ offsetD + ((j - 1) * strideD) ] ) * ulp * ulp + safemn > tmp1 ) {
			ISPLIT[ offsetISPLIT + ((nsp - 1) * strideISPLIT) ] = j;
			nsp += 1;
			WORK[ offsetWork + ((j - 1) * strideWork) ] = ZERO;
		} else {
			WORK[ offsetWork + ((j - 1) * strideWork) ] = tmp1;
			pivmin = max( pivmin, tmp1 );
		}
	}
	ISPLIT[ offsetISPLIT + ((nsp - 1) * strideISPLIT) ] = N;
	nsplit[ 0 ] = nsp;
	pivmin *= safemn;

	// Compute Interval and ATOLI
	if ( irange === 3 ) {
		// range=`'index'`: Compute the interval containing eigenvalues IL through IU
		gu = d[ offsetD ];
		gl = d[ offsetD ];
		tmp1 = ZERO;

		for ( j = 0; j < N - 1; j++ ) {
			tmp2 = sqrt( WORK[ offsetWork + (j * strideWork) ] );
			gu = max( gu, d[ offsetD + (j * strideD) ] + tmp1 + tmp2 );
			gl = min( gl, d[ offsetD + (j * strideD) ] - tmp1 - tmp2 );
			tmp1 = tmp2;
		}

		gu = max( gu, d[ offsetD + ((N - 1) * strideD) ] + tmp1 );
		gl = min( gl, d[ offsetD + ((N - 1) * strideD) ] - tmp1 );
		tnorm = max( abs( gl ), abs( gu ) );
		gl = gl - FUDGE * tnorm * ulp * N - FUDGE * TWO * pivmin;
		gu = gu + FUDGE * tnorm * ulp * N + FUDGE * pivmin;

		// Compute iteration parameters
		itmax = floor( ( log( tnorm + pivmin ) - log( pivmin ) ) / log( TWO ) ) + 2;
		if ( abstol <= ZERO ) {
			atoli = ulp * tnorm;
		} else {
			atoli = abstol;
		}

		// Set up 2 search intervals for dlaebz IJOB=3
		// AB is 2x2 column-major: AB(i,j) at index i + j*2
		abWork = new Float64Array( 4 );
		nabWork = new Int32Array( 4 );
		cWork = new Float64Array( 2 );
		var nvalWork = new Int32Array( 2 );
		wScratch = new Float64Array( 2 );
		iwScratch = new Int32Array( 2 );
		mout = new Int32Array( 1 );

		abWork[ 0 ] = gl; // AB(1,1)
		abWork[ 1 ] = gl; // AB(2,1)
		abWork[ 2 ] = gu; // AB(1,2)
		abWork[ 3 ] = gu; // AB(2,2)
		cWork[ 0 ] = gl;
		cWork[ 1 ] = gu;
		nabWork[ 0 ] = -1; // NAB(1,1)
		nabWork[ 1 ] = -1; // NAB(2,1)
		nabWork[ 2 ] = N + 1; // NAB(1,2)
		nabWork[ 3 ] = N + 1; // NAB(2,2)
		nvalWork[ 0 ] = il - 1;
		nvalWork[ 1 ] = iu;

		iinfo = dlaebz( 3, itmax, N, 2, 2, nb, atoli, rtoli, pivmin, d, strideD, offsetD, e, strideE, offsetE, WORK, strideWork, offsetWork, nvalWork, 1, 0, abWork, 1, 2, 0, cWork, 1, 0, mout, nabWork, 1, 2, 0, wScratch, 1, 0, iwScratch, 1, 0 );

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
			info = 4;
			M[ 0 ] = m;
			return info;
		}
	} else {
		// RANGE='A' or 'V' -- Set ATOLI
		tnorm = max(abs( d[ offsetD ] ) + abs( e[ offsetE ] ), abs( d[ offsetD + ((N - 1) * strideD) ] ) + abs( e[ offsetE + ((N - 2) * strideE) ] ));

		for ( j = 1; j < N - 1; j++ ) {
			tnorm = max( tnorm, abs( d[ offsetD + (j * strideD) ] ) + abs( e[ offsetE + ((j - 1) * strideE) ] ) + abs( e[ offsetE + (j * strideE) ] ) );
		}

		if ( abstol <= ZERO ) {
			atoli = ulp * tnorm;
		} else {
			atoli = abstol;
		}

		if ( irange === 2 ) {
			wl = vl;
			wu = vu;
		} else {
			wl = ZERO;
			wu = ZERO;
		}
	}

	// Find Eigenvalues -- Loop Over Blocks and recompute NWL and NWU
	m = 0;
	iend = 0;
	info = 0;
	nwl = 0;
	nwu = 0;

	mout = new Int32Array( 1 );
	idumma = new Int32Array( 1 );

	for ( jb = 0; jb < nsp; jb++ ) {
		ioff = iend;
		ibegin = ioff;
		iend = ISPLIT[ offsetISPLIT + (jb * strideISPLIT) ];
		in_ = iend - ioff;

		if ( in_ === 1 ) {
			// Special Case -- IN=1
			if ( irange === 1 || wl >= d[ offsetD + (ibegin * strideD) ] - pivmin ) {
				nwl += 1;
			}
			if ( irange === 1 || wu >= d[ offsetD + (ibegin * strideD) ] - pivmin ) {
				nwu += 1;
			}
			if ( irange === 1 || ( wl < d[ offsetD + (ibegin * strideD) ] - pivmin && wu >= d[ offsetD + (ibegin * strideD) ] - pivmin ) ) {
				w[ offsetW + (m * strideW) ] = d[ offsetD + (ibegin * strideD) ];
				IBLOCK[ offsetIBLOCK + (m * strideIBLOCK) ] = jb + 1;
				m += 1;
			}
		} else {
			// General Case -- IN > 1
			gu = d[ offsetD + (ibegin * strideD) ];
			gl = d[ offsetD + (ibegin * strideD) ];
			tmp1 = ZERO;

			for ( j = ibegin; j < iend - 1; j++ ) {
				tmp2 = abs( e[ offsetE + (j * strideE) ] );
				gu = max( gu, d[ offsetD + (j * strideD) ] + tmp1 + tmp2 );
				gl = min( gl, d[ offsetD + (j * strideD) ] - tmp1 - tmp2 );
				tmp1 = tmp2;
			}

			gu = max( gu, d[ offsetD + ((iend - 1) * strideD) ] + tmp1 );
			gl = min( gl, d[ offsetD + ((iend - 1) * strideD) ] - tmp1 );
			bnorm = max( abs( gl ), abs( gu ) );
			gl = gl - FUDGE * bnorm * ulp * in_ - FUDGE * pivmin;
			gu = gu + FUDGE * bnorm * ulp * in_ + FUDGE * pivmin;

			if ( abstol <= ZERO ) {
				atoli = ulp * max( abs( gl ), abs( gu ) );
			} else {
				atoli = abstol;
			}

			if ( irange > 1 ) {
				if ( gu < wl ) {
					nwl += in_;
					nwu += in_;
					continue;
				}
				gl = max( gl, wl );
				gu = min( gu, wu );
				if ( gl >= gu ) {
					continue;
				}
			}

			// Allocate local arrays for dlaebz calls
			// AB: in_ x 2 column-major
			abWork = new Float64Array( in_ * 2 );
			nabWork = new Int32Array( in_ * 2 );
			cWork = new Float64Array( in_ );
			wScratch = new Float64Array( in_ );
			iwScratch = new Int32Array( in_ );

			// Set Up Initial Interval
			abWork[ 0 ] = gl;
			abWork[ in_ ] = gu;

			// IJOB=1: count eigenvalues
			iinfo = dlaebz( 1, 0, in_, in_, 1, nb, atoli, rtoli, pivmin, d, strideD, offsetD + (ibegin * strideD), e, strideE, offsetE + (ibegin * strideE), WORK, strideWork, offsetWork + (ibegin * strideWork), idumma, 1, 0, abWork, 1, in_, 0, cWork, 1, 0, mout, nabWork, 1, in_, 0, wScratch, 1, 0, iwScratch, 1, 0 );

			nwl += nabWork[ 0 ];
			nwu += nabWork[ in_ ];
			iwoff = m - nabWork[ 0 ];
			im = mout[ 0 ];

			// Compute Eigenvalues
			itmax = floor( ( log( gu - gl + pivmin ) - log( pivmin ) ) / log( TWO ) ) + 2;
			iinfo = dlaebz( 2, itmax, in_, in_, 1, nb, atoli, rtoli, pivmin, d, strideD, offsetD + (ibegin * strideD), e, strideE, offsetE + (ibegin * strideE), WORK, strideWork, offsetWork + (ibegin * strideWork), idumma, 1, 0, abWork, 1, in_, 0, cWork, 1, 0, mout, nabWork, 1, in_, 0, wScratch, 1, 0, iwScratch, 1, 0 );

			iout = mout[ 0 ];

			// Copy Eigenvalues Into W and IBLOCK
			for ( j = 0; j < iout; j++ ) {
				tmp1 = HALF * ( abWork[ j ] + abWork[ j + in_ ] );

				// Flag non-convergence
				if ( j > iout - 1 - iinfo ) {
					ncnvrg = true;
					ib = -(jb + 1);
				} else {
					ib = jb + 1;
				}
				for ( je = nabWork[ j ] + iwoff;
					je < nabWork[ j + in_ ] + iwoff; je++ ) {
					w[ offsetW + (je * strideW) ] = tmp1;
					IBLOCK[ offsetIBLOCK + (je * strideIBLOCK) ] = ib;
				}
			}

			m += im;
		}
	}

	// If range=`'index'`, then (WL,WU) contains eigenvalues NWL+1,...,NWU
	if ( irange === 3 ) {
		im = 0;
		idiscl = il - 1 - nwl;
		idiscu = nwu - iu;

		if ( idiscl > 0 || idiscu > 0 ) {
			for ( je = 0; je < m; je++ ) {
				if ( w[ offsetW + (je * strideW) ] <= wlu && idiscl > 0 ) {
					idiscl -= 1;
				} else if ( w[ offsetW + (je * strideW) ] >= wul && idiscu > 0 ) {
					idiscu -= 1;
				} else {
					w[ offsetW + (im * strideW) ] = w[ offsetW + (je * strideW) ];
					IBLOCK[ offsetIBLOCK + (im * strideIBLOCK) ] = IBLOCK[ offsetIBLOCK + (je * strideIBLOCK) ];
					im += 1;
				}
			}
			m = im;
		}
		if ( idiscl > 0 || idiscu > 0 ) {
			if ( idiscl > 0 ) {
				wkill = wu;
				for ( jdisc = 0; jdisc < idiscl; jdisc++ ) {
					iw = -1;
					for ( je = 0; je < m; je++ ) {
						if ( IBLOCK[ offsetIBLOCK + (je * strideIBLOCK) ] !== 0 &&
							( w[ offsetW + (je * strideW) ] < wkill || iw === -1 ) ) {
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
						if ( IBLOCK[ offsetIBLOCK + (je * strideIBLOCK) ] !== 0 &&
							( w[ offsetW + (je * strideW) ] > wkill || iw === -1 ) ) {
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

	// If ORDER='E', sort eigenvalues from smallest to largest
	if ( iorder === 1 && nsp > 1 ) {
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
				itmp1 = IBLOCK[ offsetIBLOCK + (ie * strideIBLOCK) ];
				w[ offsetW + (ie * strideW) ] = w[ offsetW + (je * strideW) ];
				IBLOCK[ offsetIBLOCK + (ie * strideIBLOCK) ] = IBLOCK[ offsetIBLOCK + (je * strideIBLOCK) ];
				w[ offsetW + (je * strideW) ] = tmp1;
				IBLOCK[ offsetIBLOCK + (je * strideIBLOCK) ] = itmp1;
			}
		}
	}

	M[ 0 ] = m;
	info = 0;
	if ( ncnvrg ) {
		info += 1;
	}
	if ( toofew ) {
		info += 2;
	}
	return info;
}


// EXPORTS //

export default dstebz;
