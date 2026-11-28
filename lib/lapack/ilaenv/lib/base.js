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
import ieeeck from '../../ieeeck/lib/base.js';
import iparmq from '../../iparmq/lib/base.js';


// VARIABLES //

// Blanks for padding `NAME` to the reference's `CHARACTER*16` `SUBNAM`:
const BLANKS = '                ';

// The reference's `1.6E0`, a `REAL` constant:
const ONE_POINT_SIX = float64ToFloat32( 1.6 );


// FUNCTIONS //

/**
* Tests whether a two-character `xxQR`-family suffix (the reference's `C4`) is one the orthogonal/unitary generators and multipliers block.
*
* @private
* @param {string} c4 - characters 5 and 6 of the routine name
* @returns {boolean} boolean indicating whether the suffix is blocked
*/
function isBlockedSuffix( c4 ) {
	return ( c4 === 'QR' || c4 === 'RQ' || c4 === 'LQ' || c4 === 'QL' || c4 === 'HR' || c4 === 'TR' || c4 === 'BR' );
}

/**
* Returns the block size for the `QR`/`LQ` (tall-skinny) family (`xGEQR`, `xGELQ`).
*
* @private
* @param {integer} n1 - first problem dimension
* @param {integer} n2 - second problem dimension
* @returns {integer} block size
*/
function tallSkinnyBlock( n1, n2 ) {
	if ( ( n1 * n2 <= 131072 ) || ( n1 <= 8192 ) ) {
		return n1;
	}
	return ( 32768 / n2 ) | 0;
}

/**
* Returns the optimal block size (`ISPEC = 1`).
*
* Where the reference's single (`SNAME`) and complex arms set the same value, they are written once.
*
* @private
* @param {string} subnam - upper-cased, blank-padded routine name
* @param {boolean} sname - whether the name starts with `S` or `D`
* @param {boolean} cname - whether the name starts with `C` or `Z`
* @param {boolean} twostage - whether character 11 of the name is `2`
* @param {integer} n1 - first problem dimension
* @param {integer} n2 - second problem dimension
* @param {integer} n3 - third problem dimension
* @param {integer} n4 - fourth problem dimension
* @returns {integer} block size
*/
function blockSize( subnam, sname, cname, twostage, n1, n2, n3, n4 ) {
	const c2 = subnam.slice( 1, 3 );
	const c3 = subnam.slice( 3, 6 );
	const c4 = c3.slice( 1, 3 );

	if ( subnam.slice( 1, 6 ) === 'LAORH' ) {
		return 32;
	}
	if ( c2 === 'GE' ) {
		if ( c3 === 'TRF' ) {
			return 64;
		}
		if ( c3 === 'QRF' || c3 === 'RQF' || c3 === 'LQF' || c3 === 'QLF' ) {
			return 32;
		}
		if ( c3 === 'QR ' ) {
			if ( n3 === 1 ) {
				return tallSkinnyBlock( n1, n2 );
			}
			return 1;
		}
		if ( c3 === 'LQ ' ) {
			if ( n3 === 2 ) {
				return tallSkinnyBlock( n1, n2 );
			}
			return 1;
		}
		if ( c3 === 'HRD' || c3 === 'BRD' ) {
			return 32;
		}
		if ( c3 === 'TRI' ) {
			return 64;
		}
		// The reference compares the four characters SUBNAM( 4: 7 ) with the five-character 'QP3RK', which, blank-padded, never matches; so does this comparison:
		if ( subnam.slice( 3, 7 ) === 'QP3RK' ) {
			return 32;
		}
		return 1;
	}
	if ( c2 === 'PO' ) {
		if ( c3 === 'TRF' ) {
			return 64;
		}
		return 1;
	}
	if ( c2 === 'SY' ) {
		if ( c3 === 'TRF' ) {
			return ( twostage ) ? 192 : 64;
		}
		if ( sname && c3 === 'TRD' ) {
			return 32;
		}
		if ( sname && c3 === 'GST' ) {
			return 64;
		}
		return 1;
	}
	if ( cname && c2 === 'HE' ) {
		if ( c3 === 'TRF' ) {
			return ( twostage ) ? 192 : 64;
		}
		if ( c3 === 'TRD' ) {
			return 32;
		}
		if ( c3 === 'GST' ) {
			return 64;
		}
		return 1;
	}
	if ( ( sname && c2 === 'OR' ) || ( cname && c2 === 'UN' ) ) {
		if ( /^[GM]/.test( c3 ) && isBlockedSuffix( c4 ) ) {
			return 32;
		}
		return 1;
	}
	if ( c2 === 'GB' ) {
		if ( c3 === 'TRF' ) {
			return ( n4 <= 64 ) ? 1 : 32;
		}
		return 1;
	}
	if ( c2 === 'PB' ) {
		if ( c3 === 'TRF' ) {
			return ( n2 <= 64 ) ? 1 : 32;
		}
		return 1;
	}
	if ( c2 === 'TR' ) {
		if ( c3 === 'TRI' || c3 === 'EVC' ) {
			return 64;
		}
		if ( c3 === 'SYL' ) {
			if ( sname ) {
				return Math.min( Math.max( 48, ( ( Math.min( n1, n2 ) * 16 ) / 100 ) | 0 ), 240 );
			}
			return Math.min( Math.max( 24, ( ( Math.min( n1, n2 ) * 8 ) / 100 ) | 0 ), 80 );
		}
		return 1;
	}
	if ( c2 === 'LA' ) {
		if ( c3 === 'UUM' ) {
			return 64;
		}
		if ( c3 === 'TRS' ) {
			return 32;
		}
		return 1;
	}
	if ( sname && c2 === 'ST' ) {
		// The reference sets NB = 1 for 'EBZ', the default:
		return 1;
	}
	if ( c2 === 'GG' ) {
		// 32 for every xGG routine ('HD3' included):
		return 32;
	}
	return 1;
}

/**
* Returns the minimum block size (`ISPEC = 2`).
*
* Every branch of the reference sets `NBMIN = 2`, the default, except `xSYTRF`, which sets `8` (for `S`, `D`, `C` and `Z` alike).
*
* @private
* @param {string} subnam - upper-cased, blank-padded routine name
* @returns {integer} minimum block size
*/
function minBlockSize( subnam ) {
	if ( subnam.slice( 1, 3 ) === 'SY' && subnam.slice( 3, 6 ) === 'TRF' ) {
		return 8;
	}
	return 2;
}

/**
* Returns the crossover point below which unblocked code is used (`ISPEC = 3`).
*
* @private
* @param {string} subnam - upper-cased, blank-padded routine name
* @param {boolean} sname - whether the name starts with `S` or `D`
* @param {boolean} cname - whether the name starts with `C` or `Z`
* @returns {integer} crossover point
*/
function crossover( subnam, sname, cname ) {
	const c2 = subnam.slice( 1, 3 );
	const c3 = subnam.slice( 3, 6 );
	const c4 = c3.slice( 1, 3 );

	if ( c2 === 'GE' ) {
		if ( c3 === 'QRF' || c3 === 'RQF' || c3 === 'LQF' || c3 === 'QLF' || c3 === 'HRD' || c3 === 'BRD' ) {
			return 128;
		}
		// Never matches, as in the reference (see `blockSize`):
		if ( subnam.slice( 3, 7 ) === 'QP3RK' ) {
			return 128;
		}
		return 0;
	}
	if ( c2 === 'SY' ) {
		if ( sname && c3 === 'TRD' ) {
			return 32;
		}
		return 0;
	}
	if ( cname && c2 === 'HE' ) {
		if ( c3 === 'TRD' ) {
			return 32;
		}
		return 0;
	}
	if ( ( sname && c2 === 'OR' ) || ( cname && c2 === 'UN' ) ) {
		if ( /^G/.test( c3 ) && isBlockedSuffix( c4 ) ) {
			return 128;
		}
		return 0;
	}
	if ( c2 === 'GG' ) {
		return 128;
	}
	return 0;
}


// MAIN //

/**
* Returns problem-dependent parameters for the local environment: block sizes, crossover points and the other tuning values LAPACK routines query.
*
* ## Notes
*
* -   `ispec` selects the parameter:
*
*     -   `1`: the optimal block size.
*     -   `2`: the minimum block size for which the block routine should be used.
*     -   `3`: the crossover point (below which unblocked code is used).
*     -   `4`: the number of shifts in the nonsymmetric eigenvalue routines (`6`).
*     -   `5`: the minimum column dimension for blocking (`2`).
*     -   `6`: the crossover point for the SVD (`INT( REAL( MIN( n1, n2 ) ) * 1.6 )`).
*     -   `7`: the number of processors (`1`).
*     -   `8`: the crossover point for the multishift QR method (`50`).
*     -   `9`: the maximum size of the subproblems at the bottom of the divide-and-conquer trees (`25`).
*     -   `10`: `1` if NaN arithmetic is IEEE-safe (`ieeeck`), else `0`.
*     -   `11`: `1` if infinity arithmetic is IEEE-safe (`ieeeck`), else `0`.
*     -   `12`-`17`: the multishift QR parameters, from `iparmq( ispec, name, opts, n1, n2, n3 )`.
*
*     Any other value returns `-1`.
*
* -   `name` is the calling routine's name (e.g. `'DGEQRF'`), decoded by character as in the reference: blank-padded to 16 characters, its first six upper-cased when the first is a lower-case letter, then split into the precision (character 1), the matrix type (2-3) and the operation (4-6). For `ispec` `1`-`3`, a name that does not start with `S`, `D`, `C` or `Z` returns `1`.
*
* -   `opts` is the calling routine's character options, concatenated; it is not read (the reference passes it to `iparmq`, which does not read it either).
*
* @private
* @param {integer} ispec - parameter to return
* @param {string} name - name of the calling routine
* @param {string} opts - character options of the calling routine, concatenated
* @param {integer} n1 - first problem dimension
* @param {integer} n2 - second problem dimension
* @param {integer} n3 - third problem dimension
* @param {integer} n4 - fourth problem dimension
* @returns {integer} parameter value
*
* @example
* import ilaenv from './base.js';
*
* var nb = ilaenv( 1, 'DGEQRF', ' ', 100, 100, -1, -1 );
* // returns 32
*/
function ilaenv( ispec, name, opts, n1, n2, n3, n4 ) {
	let subnam;
	let sname;
	let cname;
	let ic;
	let s;
	let i;

	if ( ispec === 1 || ispec === 2 || ispec === 3 ) {
		// Upper-case the first six characters of NAME when the first is lower-case. JS strings are UTF-16, where 'Z' is 90, so only the reference's ASCII branch applies (its EBCDIC and Prime branches cannot be taken):
		subnam = ( name + BLANKS ).slice( 0, 16 );
		ic = subnam.charCodeAt( 0 );
		if ( ic >= 97 && ic <= 122 ) {
			s = String.fromCharCode( ic - 32 );
			for ( i = 1; i < 6; i++ ) {
				ic = subnam.charCodeAt( i );
				s += ( ic >= 97 && ic <= 122 ) ? String.fromCharCode( ic - 32 ) : subnam.charAt( i );
			}
			subnam = s + subnam.slice( 6 );
		}
		// C1 = SUBNAM( 1: 1 ): single precision ('S', 'D') or complex ('C', 'Z'):
		sname = /^[SD]/.test( subnam );
		cname = /^[CZ]/.test( subnam );
		if ( !( cname || sname ) ) {
			return 1;
		}
		if ( ispec === 1 ) {
			// TWOSTAGE = LEN( SUBNAM ) >= 11 .AND. SUBNAM( 11: 11 ) == '2', where LEN( SUBNAM ) is 16:
			return blockSize( subnam, sname, cname, /^.{10}2/.test( subnam ), n1, n2, n3, n4 );
		}
		if ( ispec === 2 ) {
			return minBlockSize( subnam );
		}
		return crossover( subnam, sname, cname );
	}
	switch ( ispec ) {
	case 4:
		// Number of shifts, used in xHSEQR:
		return 6;
	case 5:
		// Minimum column dimension (not used):
		return 2;
	case 6:
		// Crossover point for the SVD, `INT( REAL( MIN( N1, N2 ) ) * 1.6E0 )` in single precision:
		return Math.trunc( float64ToFloat32( float64ToFloat32( Math.min( n1, n2 ) ) * ONE_POINT_SIX ) );
	case 7:
		// Number of processors (not used):
		return 1;
	case 8:
		// Crossover point for the multishift QR method:
		return 50;
	case 9:
		// Maximum size of the subproblems at the bottom of the divide-and-conquer trees:
		return 25;
	case 10:
		// IEEE NaN arithmetic can be trusted not to trap (the reference's `ILAENV = 1` guard is always true):
		return ieeeck( 1, 0.0, 1.0 );
	case 11:
		// Infinity arithmetic can be trusted not to trap:
		return ieeeck( 0, 0.0, 1.0 );
	case 12:
	case 13:
	case 14:
	case 15:
	case 16:
	case 17:
		// 12 <= ISPEC <= 17: xHSEQR or related subroutines:
		return iparmq( ispec, name, opts, n1, n2, n3 );
	default:
		// Invalid value for ISPEC:
		return -1;
	}
}


// EXPORTS //

export default ilaenv;
