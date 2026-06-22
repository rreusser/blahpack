/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the eigenvalues of a symmetric tridiagonal matrix to suitable accuracy.
*
* @param {string} range - `'all'`, `'value'`, or `'index'`
* @param {string} order - `'block'` or `'entire'`
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
* @param {Float64Array} w - output eigenvalues, length N
* @param {integer} strideW - stride for w
* @param {Float64Array} WERR - output eigenvalue errors, length N
* @param {integer} strideWERR - stride for WERR
* @param {Int32Array} IBLOCK - output block indices, length N
* @param {integer} strideIBLOCK - stride for IBLOCK
* @param {Int32Array} INDEXW - output within-block indices, length N
* @param {integer} strideINDEXW - stride for INDEXW
* @throws {TypeError} order argument must be a valid order
* @returns {Object} { info, m, nsplit, wl, wu }
*/
function dlarrd( range, order, N, vl, vu, il, iu, GERS, strideGERS, reltol, d, strideD, e, strideE, E2, strideE2, pivmin, nsplit, ISPLIT, strideISPLIT, w, strideW, WERR, strideWERR, IBLOCK, strideIBLOCK, INDEXW, strideINDEXW ) {
	if ( order !== 'block' && order !== 'entire' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of `block` or `entire`. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( range, order, N, vl, vu, il, iu, GERS, strideGERS, 0, reltol, d, strideD, 0, e, strideE, 0, E2, strideE2, 0, pivmin, nsplit, ISPLIT, strideISPLIT, 0, w, strideW, 0, WERR, strideWERR, 0, IBLOCK, strideIBLOCK, 0, INDEXW, strideINDEXW, 0 );
}


// EXPORTS //

export default dlarrd;
