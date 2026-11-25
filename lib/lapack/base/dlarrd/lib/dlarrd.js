/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the eigenvalues of a symmetric tridiagonal matrix to suitable accuracy.
*
* @param {('all'|'value'|'index')} range - `'all'`, `'value'`, or `'index'`
* @param {('block'|'entire')} order - `'block'` or `'entire'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {number} vl - lower bound (range=`'value'`)
* @param {number} vu - upper bound (range=`'value'`)
* @param {integer} il - lower index (range=`'index'`)
* @param {integer} iu - upper index (range=`'index'`)
* @param {Float64Array} GERS - Gershgorin intervals, length 2*N
* @param {integer} strideGERS - stride for GERS
* @param {number} reltol - relative tolerance
* @param {Float64Array} d - diagonal elements, length N
* @param {integer} strideD - stride for d
* @param {Float64Array} e - off-diagonal elements, length N-1
* @param {integer} strideE - stride for e
* @param {Float64Array} E2 - squared off-diagonal elements, length N-1
* @param {integer} strideE2 - stride for E2
* @param {number} pivmin - minimum pivot
* @param {integer} nsplit - number of diagonal blocks
* @param {Int32Array} ISPLIT - splitting points, length nsplit
* @param {integer} strideISPLIT - stride for ISPLIT
* @param {Int32Array} m - output (length-1 array): the actual number of eigenvalues found
* @param {Float64Array} w - output eigenvalues, length N
* @param {integer} strideW - stride for w
* @param {Float64Array} WERR - output eigenvalue errors, length N
* @param {integer} strideWERR - stride for WERR
* @param {Float64Array} wl - output (length-1 array): `wl`
* @param {Float64Array} wu - output (length-1 array): the interval (WL, WU] contains all the wanted eigenvalues
* @param {Int32Array} IBLOCK - output block indices, length N
* @param {integer} strideIBLOCK - stride for IBLOCK
* @param {Int32Array} INDEXW - output within-block indices, length N
* @param {integer} strideINDEXW - stride for INDEXW
* @param {(Float64Array|null)} WORK - workspace, length >= 4*N; if `null`, allocated internally
* @param {(Int32Array|null)} IWORK - integer workspace, length >= 3*N; if `null`, allocated internally
* @throws {TypeError} first argument must be one of the following: "all", "value", "index"
* @throws {TypeError} second argument must be one of the following: "block", "entire"
* @throws {TypeError} order argument must be a valid order
* @returns {integer} status code (0 = success)
*/
function dlarrd( range, order, N, vl, vu, il, iu, GERS, strideGERS, reltol, d, strideD, e, strideE, E2, strideE2, pivmin, nsplit, ISPLIT, strideISPLIT, m, w, strideW, WERR, strideWERR, wl, wu, IBLOCK, strideIBLOCK, INDEXW, strideINDEXW, WORK, IWORK ) {
	if ( range !== 'all' && range !== 'value' && range !== 'index' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "all", "value", "index". Value: `%s`.', range ) );
	}
	if ( order !== 'block' && order !== 'entire' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "block", "entire". Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( WORK === null ) {
		WORK = new Float64Array( max( 1, 4 * N ) );
	}
	if ( IWORK === null ) {
		IWORK = new Int32Array( max( 1, 3 * N ) );
	}
	return base( range, order, N, vl, vu, il, iu, GERS, strideGERS, 0, reltol, d, strideD, 0, e, strideE, 0, E2, strideE2, 0, pivmin, nsplit, ISPLIT, strideISPLIT, 0, m, w, strideW, 0, WERR, strideWERR, 0, wl, wu, IBLOCK, strideIBLOCK, 0, INDEXW, strideINDEXW, 0, WORK, 1, 0, IWORK, 1, 0 );
}


// EXPORTS //

export default dlarrd;
