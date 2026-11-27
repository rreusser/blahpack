/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-params */

// MODULES //

import float64ToFloat32 from '@stdlib/number/float64/base/to-float32/lib/index.js';


// VARIABLES //

// Queries (ISPEC values):
const INMIN = 12;
const INWIN = 13;
const INIBL = 14;
const ISHFTS = 15;
const IACC22 = 16;
const ICOST = 17;

// Tuning values:
const NMIN = 75;
const K22MIN = 14;
const KACMIN = 14;
const NIBBLE = 14;
const KNWSWP = 500;
const RCOST = 10;

// `LOG( TWO )` in single precision (the reference's `TWO` is `REAL`):
const LOGTWO = float64ToFloat32( Math.log( 2.0 ) );

// Blanks for padding `NAME` to the reference's `CHARACTER*6` `SUBNAM`:
const BLANKS = '      ';


// FUNCTIONS //

/**
* Rounds a positive value to the nearest integer, ties away from zero (Fortran `NINT`).
*
* @private
* @param {number} x - positive value
* @returns {integer} rounded value
*/
function nint( x ) {
	return Math.floor( x + 0.5 );
}


// MAIN //

/**
* Returns the tuning parameters of the multishift QR algorithm (`xHSEQR`, `xLAQR0`-`xLAQR4`) and its relatives.
*
* ## Notes
*
* -   `ispec` selects the parameter:
*
*     -   `12` (`INMIN`): the matrix order below which `xLAHQR` is used (`75`).
*     -   `13` (`INWIN`): the deflation window size.
*     -   `14` (`INIBL`): the nibble crossover point (`14`).
*     -   `15` (`ISHFTS`): the number of simultaneous shifts.
*     -   `16` (`IACC22`): whether and how to accumulate reflections (`0`, `1` or `2`).
*     -   `17` (`ICOST`): the relative cost of flops in the reflector application (`10`).
*
*     Any other value returns `-1`.
*
* -   `name` is the calling routine's name (e.g. `'DLAQR0'`); only `ispec = 16` reads it. As in the reference, it is upper-cased only when its first character is a lower-case letter.
*
* -   `opts` is not read (the reference reserves it).
*
* -   The reference's trailing `LWORK` argument is not read and is omitted.
*
* @private
* @param {integer} ispec - parameter to return
* @param {string} name - name of the calling routine
* @param {string} opts - character options of the calling routine (not read)
* @param {integer} N - order of the Hessenberg matrix
* @param {integer} ilo - first row/column of the active block (1-based, as the reference's `ILO`)
* @param {integer} ihi - last row/column of the active block (1-based, as the reference's `IHI`)
* @returns {integer} parameter value
*
* @example
* import iparmq from './base.js';
*
* var ns = iparmq( 15, 'DLAQR0', 'SV', 200, 1, 200 );
* // returns 24
*/
function iparmq( ispec, name, opts, N, ilo, ihi ) {
	let subnam;
	let iparm;
	let NH;
	let NS;
	let ic;
	let s;
	let i;

	NH = 0;
	NS = 0;
	if ( ispec === ISHFTS || ispec === INWIN || ispec === IACC22 ) {
		// Set the number of simultaneous shifts:
		NH = ihi - ilo + 1;
		NS = 2;
		if ( NH >= 30 ) {
			NS = 4;
		}
		if ( NH >= 60 ) {
			NS = 10;
		}
		if ( NH >= 150 ) {
			// `NH / NINT( LOG( REAL( NH ) ) / LOG( TWO ) )`, in single precision as in the reference:
			NS = Math.max( 10, ( NH / nint( float64ToFloat32( float64ToFloat32( Math.log( float64ToFloat32( NH ) ) ) / LOGTWO ) ) ) | 0 );
		}
		if ( NH >= 590 ) {
			NS = 64;
		}
		if ( NH >= 3000 ) {
			NS = 128;
		}
		if ( NH >= 6000 ) {
			NS = 256;
		}
		NS = Math.max( 2, NS - ( NS % 2 ) );
	}

	if ( ispec === INMIN ) {
		// Matrices of order smaller than NMIN get xLAHQR:
		return NMIN;
	}
	if ( ispec === INIBL ) {
		// Skip a multi-shift sweep when the deflation window finds at least this percentage of deflations:
		return NIBBLE;
	}
	if ( ispec === ISHFTS ) {
		return NS;
	}
	if ( ispec === INWIN ) {
		// Deflation window size; larger windows for big matrices:
		if ( NH <= KNWSWP ) {
			return NS;
		}
		return ( ( 3 * NS ) / 2 ) | 0;
	}
	if ( ispec === IACC22 ) {
		// Upper-case the first six characters of NAME when the first is lower-case. JS strings are UTF-16, where 'Z' is 90, so only the reference's ASCII branch applies (its EBCDIC and Prime branches cannot be taken):
		subnam = ( name + BLANKS ).slice( 0, 6 );
		ic = subnam.charCodeAt( 0 );
		if ( ic >= 97 && ic <= 122 ) {
			s = String.fromCharCode( ic - 32 );
			for ( i = 1; i < 6; i++ ) {
				ic = subnam.charCodeAt( i );
				s += ( ic >= 97 && ic <= 122 ) ? String.fromCharCode( ic - 32 ) : subnam.charAt( i );
			}
			subnam = s;
		}
		iparm = 0;
		if ( subnam.slice( 1, 6 ) === 'GGHRD' || subnam.slice( 1, 6 ) === 'GGHD3' ) {
			iparm = 1;
			if ( NH >= K22MIN ) {
				iparm = 2;
			}
		} else if ( subnam.slice( 3, 6 ) === 'EXC' ) {
			if ( NH >= KACMIN ) {
				iparm = 1;
			}
			if ( NH >= K22MIN ) {
				iparm = 2;
			}
		} else if ( subnam.slice( 1, 6 ) === 'HSEQR' || subnam.slice( 1, 5 ) === 'LAQR' ) {
			if ( NS >= KACMIN ) {
				iparm = 1;
			}
			if ( NS >= K22MIN ) {
				iparm = 2;
			}
		}
		return iparm;
	}
	if ( ispec === ICOST ) {
		// Relative cost of flops in the reflector application, in percent:
		return RCOST;
	}
	// Invalid value of ISPEC:
	return -1;
}


// EXPORTS //

export default iparmq;
