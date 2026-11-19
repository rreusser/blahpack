/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlamch from './../../../../lapack/base/dlamch/lib/base.js';
import dlaebz from './../../../../lapack/base/dlaebz/lib/base.js';


// VARIABLES //

const abs = Math.abs;
const min = Math.min;
const max = Math.max;
const log = Math.log;
const floor = Math.floor;

const ZERO = 0.0;
const TWO = 2.0;
const HALF = 0.5;
const FUDGE = 2.0;


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
* @param {Int32Array} m - output (length-1 array): the actual number of eigenvalues found
* @param {Float64Array} w - output: eigenvalues, length N
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Float64Array} WERR - output: eigenvalue uncertainty, length N
* @param {integer} strideWERR - stride for WERR
* @param {NonNegativeInteger} offsetWERR - starting index for WERR
* @param {Float64Array} wl - output (length-1 array): `wl`
* @param {Float64Array} wu - output (length-1 array): the interval (WL, WU] contains all the wanted eigenvalues
* @param {Int32Array} IBLOCK - output: block indices, length N
* @param {integer} strideIBLOCK - stride for IBLOCK
* @param {NonNegativeInteger} offsetIBLOCK - starting index for IBLOCK
* @param {Int32Array} INDEXW - output: within-block indices, length N
* @param {integer} strideINDEXW - stride for INDEXW
* @param {NonNegativeInteger} offsetINDEXW - starting index for INDEXW
* @param {Float64Array} WORK - workspace, length >= 4*N
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {Int32Array} IWORK - integer workspace, length >= 3*N
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @returns {Object} result with `info`, `nsplit`
*/
function dlarrd( range, order, N, vl, vu, il, iu, GERS, strideGERS, offsetGERS, reltol, d, strideD, offsetD, e, strideE, offsetE, E2, strideE2, offsetE2, pivmin, nsplit, ISPLIT, strideISPLIT, offsetISPLIT, m, w, strideW, offsetW, WERR, strideWERR, offsetWERR, wl, wu, IBLOCK, strideIBLOCK, offsetIBLOCK, INDEXW, strideINDEXW, offsetINDEXW, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	let ncnvrg, toofew, irange, ibegin;
	let idiscl, idiscu, iinfo, iwoff, wkill, itmax, itmp1, itmp2;
	let jdisc, iout, info, ioff, iend, jblk, tmp1, tmp2, mout, nwl, nwu, wlu;
	let oab, oc, wul, inn, jee, gl, gu, im, ib, ie, iw, je, i, j;

	info = 0;
	m[ 0 ] = 0;
	oab = offsetWork + ( N * strideWork ); // AB = WORK(N+1)
	wl[ 0 ] = 0.0;
	wu[ 0 ] = 0.0;

	// Quick return
	if ( N <= 0 ) {
		m[ 0 ] = 0;
		return {
			'info': 0,
			'nsplit': nsplit
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
		m[ 0 ] = 0;
		return {
			'info': info,
			'nsplit': nsplit
		};
	}

	ncnvrg = false;
	toofew = false;

	// Simplification
	if ( irange === 3 && il === 1 && iu === N ) {
		irange = 1;
	}

	// Get machine constants
	const eps = dlamch( 'precision' );
	const uflow = dlamch( 'safe-minimum' );

	// Special case N=1
	if ( N === 1 ) {
		if (
			irange === 1 ||
			( irange === 2 && d[ offsetD ] > vl && d[ offsetD ] <= vu ) ||
			( irange === 3 && il === 1 && iu === 1 )
		) {
			m[ 0 ] = 1;
			w[ offsetW ] = d[ offsetD ];
			WERR[ offsetWERR ] = ZERO;
			IBLOCK[ offsetIBLOCK ] = 1;
			INDEXW[ offsetINDEXW ] = 1;
		}
		return {
			'info': 0,
			'nsplit': nsplit
		};
	}

	const nb = 0;

	// Global Gershgorin interval
	gl = d[ offsetD ];
	gu = d[ offsetD ];
	for ( i = 0; i < N; i++ ) {
		gl = min( gl, GERS[ offsetGERS + (((2 * i)) * strideGERS) ] );
		gu = max( gu, GERS[ offsetGERS + (((2 * i) + 1) * strideGERS) ] );
	}
	const tnorm = max( abs( gl ), abs( gu ) );
	gl = gl - ( FUDGE * tnorm * eps * N ) - ( FUDGE * TWO * pivmin );
	gu = gu + ( FUDGE * tnorm * eps * N ) + ( FUDGE * TWO * pivmin );
	const rtoli = reltol;
	const atoli = ( FUDGE * TWO * uflow ) + ( FUDGE * TWO * pivmin );

	if ( irange === 3 ) {
		itmax = floor( ( log( tnorm + pivmin ) - log( pivmin ) ) / log( TWO ) ) + 2;

		// Set up 2 search intervals for dlaebz IJOB=3. As in the reference, AB (2-by-2) = WORK(N+1:N+4), C = WORK(N+5:N+6), NAB (2-by-2) = IWORK(1:4), NVAL = IWORK(5:6); dlaebz's own scratch is W and IBLOCK.
		mout = new Int32Array( 1 );

		WORK[ oab ] = gl; // AB(1,1)
		WORK[ oab + ( 1 * strideWork ) ] = gl; // AB(2,1)
		WORK[ oab + ( 2 * strideWork ) ] = gu; // AB(1,2)
		WORK[ oab + ( 3 * strideWork ) ] = gu; // AB(2,2)
		WORK[ oab + ( 4 * strideWork ) ] = gl;
		WORK[ oab + ( 5 * strideWork ) ] = gu;
		IWORK[ offsetIWork ] = -1;
		IWORK[ offsetIWork + ( 1 * strideIWork ) ] = -1;
		IWORK[ offsetIWork + ( 2 * strideIWork ) ] = N + 1;
		IWORK[ offsetIWork + ( 3 * strideIWork ) ] = N + 1;
		IWORK[ offsetIWork + ( 4 * strideIWork ) ] = il - 1;
		IWORK[ offsetIWork + ( 5 * strideIWork ) ] = iu;

		iinfo = dlaebz( 3, itmax, N, 2, 2, nb, atoli, rtoli, pivmin, d, strideD, offsetD, e, strideE, offsetE, E2, strideE2, offsetE2, IWORK, strideIWork, offsetIWork + ( 4 * strideIWork ), WORK, strideWork, 2 * strideWork, oab, WORK, strideWork, oab + ( 4 * strideWork ), mout, IWORK, strideIWork, 2 * strideIWork, offsetIWork, w, strideW, offsetW, IBLOCK, strideIBLOCK, offsetIBLOCK );
		if ( iinfo !== 0 ) {
			m[ 0 ] = 0;
			return {
				'info': iinfo,
				'nsplit': nsplit
			};
		}

		if ( IWORK[ offsetIWork + ( 5 * strideIWork ) ] === iu ) {
			wl[ 0 ] = WORK[ oab ];
			wlu = WORK[ oab + ( 2 * strideWork ) ];
			nwl = IWORK[ offsetIWork ];
			wu[ 0 ] = WORK[ oab + ( 3 * strideWork ) ];
			wul = WORK[ oab + ( 1 * strideWork ) ];
			nwu = IWORK[ offsetIWork + ( 3 * strideIWork ) ];
		} else {
			wl[ 0 ] = WORK[ oab + ( 1 * strideWork ) ];
			wlu = WORK[ oab + ( 3 * strideWork ) ];
			nwl = IWORK[ offsetIWork + ( 1 * strideIWork ) ];
			wu[ 0 ] = WORK[ oab + ( 2 * strideWork ) ];
			wul = WORK[ oab ];
			nwu = IWORK[ offsetIWork + ( 2 * strideIWork ) ];
		}

		if ( nwl < 0 || nwl >= N || nwu < 1 || nwu > N ) {
			m[ 0 ] = 0;
			return {
				'info': 4,
				'nsplit': nsplit
			};
		}
	} else if ( irange === 2 ) {
		wl[ 0 ] = vl;
		wu[ 0 ] = vu;
	} else {
		wl[ 0 ] = gl;
		wu[ 0 ] = gu;
	}

	// Find Eigenvalues -- Loop Over Blocks
	m[ 0 ] = 0;
	iend = 0;
	info = 0;
	nwl = 0;
	nwu = 0;

	mout = new Int32Array( 1 );
	const idumma = new Int32Array( 1 );

	for ( jblk = 0; jblk < nsplit; jblk++ ) {
		ioff = iend;
		ibegin = ioff;
		iend = ISPLIT[ offsetISPLIT + (jblk * strideISPLIT) ];
		inn = iend - ioff;

		if ( inn === 1 ) {
			// Special Case -- IN=1
			if ( wl[ 0 ] >= d[ offsetD + (ibegin * strideD) ] - pivmin ) {
				nwl += 1;
			}
			if ( wu[ 0 ] >= d[ offsetD + (ibegin * strideD) ] - pivmin ) {
				nwu += 1;
			}
			if (
				irange === 1 ||
				(
					wl[ 0 ] < d[ offsetD + (ibegin * strideD) ] - pivmin &&
					wu[ 0 ] >= d[ offsetD + (ibegin * strideD) ] - pivmin
				)
			) {
				w[ offsetW + (m[ 0 ] * strideW) ] = d[ offsetD + (ibegin * strideD) ];
				WERR[ offsetWERR + (m[ 0 ] * strideWERR) ] = ZERO;
				IBLOCK[ offsetIBLOCK + (m[ 0 ] * strideIBLOCK) ] = jblk + 1;
				INDEXW[ offsetINDEXW + (m[ 0 ] * strideINDEXW) ] = 1;
				m[ 0 ] += 1;
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
				if ( gu < wl[ 0 ] ) {
					nwl += inn;
					nwu += inn;
					continue;
				}
				gl = max( gl, wl[ 0 ] );
				gu = min( gu, wu[ 0 ] );
				if ( gl >= gu ) {
					continue;
				}
			}

			// As in the reference, AB (IN-by-2) = WORK(N+1:N+2*IN), C = WORK(N+2*IN+1:N+3*IN), NAB (IN-by-2) = IWORK(1:2*IN); dlaebz's own scratch is W(M+1:) and IBLOCK(M+1:)
			oc = oab + ( 2 * inn * strideWork );

			WORK[ oab ] = gl;
			WORK[ oab + ( inn * strideWork ) ] = gu;

			// IJOB=1: count eigenvalues
			iinfo = dlaebz( 1, 0, inn, inn, 1, nb, atoli, rtoli, pivmin, d, strideD, offsetD + (ibegin * strideD), e, strideE, offsetE + (ibegin * strideE), E2, strideE2, offsetE2 + (ibegin * strideE2), idumma, 1, 0, WORK, strideWork, inn * strideWork, oab, WORK, strideWork, oc, mout, IWORK, strideIWork, inn * strideIWork, offsetIWork, w, strideW, offsetW + ( m[ 0 ] * strideW ), IBLOCK, strideIBLOCK, offsetIBLOCK + ( m[ 0 ] * strideIBLOCK ) );
			if ( iinfo !== 0 ) {
				return {
					'info': iinfo,
					'nsplit': nsplit
				};
			}

			nwl += IWORK[ offsetIWork ];
			nwu += IWORK[ offsetIWork + ( inn * strideIWork ) ];
			iwoff = m[ 0 ] - IWORK[ offsetIWork ];
			im = mout[ 0 ];

			// IJOB=2: bisect to compute eigenvalues
			itmax = floor( ( log( gu - gl + pivmin ) - log( pivmin ) ) / log( TWO ) ) + 2;
			iinfo = dlaebz( 2, itmax, inn, inn, 1, nb, atoli, rtoli, pivmin, d, strideD, offsetD + (ibegin * strideD), e, strideE, offsetE + (ibegin * strideE), E2, strideE2, offsetE2 + (ibegin * strideE2), idumma, 1, 0, WORK, strideWork, inn * strideWork, oab, WORK, strideWork, oc, mout, IWORK, strideIWork, inn * strideIWork, offsetIWork, w, strideW, offsetW + ( m[ 0 ] * strideW ), IBLOCK, strideIBLOCK, offsetIBLOCK + ( m[ 0 ] * strideIBLOCK ) );
			if ( iinfo < 0 ) {
				return {
					'info': iinfo,
					'nsplit': nsplit
				};
			}
			iout = mout[ 0 ];

			// Copy eigenvalues and errors into W, WERR, INDEXW, IBLOCK
			for ( j = 0; j < iout; j++ ) {
				tmp1 = HALF * ( WORK[ oab + ( j * strideWork ) ] + WORK[ oab + ( ( j + inn ) * strideWork ) ] );
				tmp2 = HALF * abs( WORK[ oab + ( ( j + inn ) * strideWork ) ] - WORK[ oab + ( j * strideWork ) ] );

				if ( j > iout - 1 - iinfo ) {
					ncnvrg = true;
					ib = -(jblk + 1);
				} else {
					ib = jblk + 1;
				}
				for ( je = IWORK[ offsetIWork + ( j * strideIWork ) ] + iwoff; je < IWORK[ offsetIWork + ( ( j + inn ) * strideIWork ) ] + iwoff; je++ ) {
					w[ offsetW + (je * strideW) ] = tmp1;
					WERR[ offsetWERR + (je * strideWERR) ] = tmp2;
					INDEXW[ offsetINDEXW + (je * strideINDEXW) ] = je - iwoff + 1;
					IBLOCK[ offsetIBLOCK + (je * strideIBLOCK) ] = ib;
				}
			}

			m[ 0 ] += im;
		}
	}

	// If range=`'index'`, trim eigenvalues outside [il, iu]
	if ( irange === 3 ) {
		idiscl = il - 1 - nwl;
		idiscu = nwu - iu;

		if ( idiscl > 0 ) {
			im = 0;
			for ( je = 0; je < m[ 0 ]; je++ ) {
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
			m[ 0 ] = im;
		}
		if ( idiscu > 0 ) {
			im = m[ 0 ];
			for ( je = m[ 0 ] - 1; je >= 0; je-- ) {
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
			for ( je = im; je < m[ 0 ]; je++ ) {
				w[ offsetW + (jee * strideW) ] = w[ offsetW + (je * strideW) ];
				WERR[ offsetWERR + (jee * strideWERR) ] = WERR[ offsetWERR + (je * strideWERR) ];
				INDEXW[ offsetINDEXW + (jee * strideINDEXW) ] = INDEXW[ offsetINDEXW + (je * strideINDEXW) ];
				IBLOCK[ offsetIBLOCK + (jee * strideIBLOCK) ] = IBLOCK[ offsetIBLOCK + (je * strideIBLOCK) ];
				jee += 1;
			}
			m[ 0 ] -= im;
		}

		if ( idiscl > 0 || idiscu > 0 ) {
			if ( idiscl > 0 ) {
				wkill = wu[ 0 ];
				for ( jdisc = 0; jdisc < idiscl; jdisc++ ) {
					iw = -1;
					for ( je = 0; je < m[ 0 ]; je++ ) {
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
				wkill = wl[ 0 ];
				for ( jdisc = 0; jdisc < idiscu; jdisc++ ) {
					iw = -1;
					for ( je = 0; je < m[ 0 ]; je++ ) {
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
			for ( je = 0; je < m[ 0 ]; je++ ) {
				if ( IBLOCK[ offsetIBLOCK + (je * strideIBLOCK) ] !== 0 ) {
					w[ offsetW + (im * strideW) ] = w[ offsetW + (je * strideW) ];
					WERR[ offsetWERR + (im * strideWERR) ] = WERR[ offsetWERR + (je * strideWERR) ];
					INDEXW[ offsetINDEXW + (im * strideINDEXW) ] = INDEXW[ offsetINDEXW + (je * strideINDEXW) ];
					IBLOCK[ offsetIBLOCK + (im * strideIBLOCK) ] = IBLOCK[ offsetIBLOCK + (je * strideIBLOCK) ];
					im += 1;
				}
			}
			m[ 0 ] = im;
		}
		if ( idiscl < 0 || idiscu < 0 ) {
			toofew = true;
		}
	}

	if (
		( irange === 1 && m[ 0 ] !== N ) ||
		( irange === 3 && m[ 0 ] !== iu - il + 1 )
	) {
		toofew = true;
	}

	// If order='entire', sort eigenvalues from smallest to largest
	if ( order === 'entire' && nsplit > 1 ) {
		for ( je = 0; je < m[ 0 ] - 1; je++ ) {
			ie = -1;
			tmp1 = w[ offsetW + (je * strideW) ];
			for ( j = je + 1; j < m[ 0 ]; j++ ) {
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
		'nsplit': nsplit
	};
}


// EXPORTS //

export default dlarrd;
