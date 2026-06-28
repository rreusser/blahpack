/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

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
* @param {Float64Array} GERS - Gershgorin intervals
* @param {integer} strideGERS - stride for GERS
* @param {NonNegativeInteger} offsetGERS - offset for GERS
* @param {number} reltol - relative tolerance
* @param {Float64Array} d - diagonal elements
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - offset for d
* @param {Float64Array} e - off-diagonal elements
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - offset for e
* @param {Float64Array} E2 - squared off-diagonal elements
* @param {integer} strideE2 - stride for E2
* @param {NonNegativeInteger} offsetE2 - offset for E2
* @param {number} pivmin - minimum pivot
* @param {integer} nsplit - number of blocks
* @param {Int32Array} ISPLIT - splitting points
* @param {integer} strideISPLIT - stride for ISPLIT
* @param {NonNegativeInteger} offsetISPLIT - offset for ISPLIT
* @param {Float64Array} w - output eigenvalues
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - offset for w
* @param {Float64Array} WERR - output errors
* @param {integer} strideWERR - stride for WERR
* @param {NonNegativeInteger} offsetWERR - offset for WERR
* @param {Int32Array} IBLOCK - output block indices
* @param {integer} strideIBLOCK - stride for IBLOCK
* @param {NonNegativeInteger} offsetIBLOCK - offset for IBLOCK
* @param {Int32Array} INDEXW - output within-block indices
* @param {integer} strideINDEXW - stride for INDEXW
* @param {NonNegativeInteger} offsetINDEXW - offset for INDEXW
* @throws {TypeError} first argument must be a valid `range` value
* @throws {TypeError} second argument must be a valid `order` value
* @returns {Object} { info, m, nsplit, wl, wu }
*/
function dlarrd( range, order, N, vl, vu, il, iu, GERS, strideGERS, offsetGERS, reltol, d, strideD, offsetD, e, strideE, offsetE, E2, strideE2, offsetE2, pivmin, nsplit, ISPLIT, strideISPLIT, offsetISPLIT, w, strideW, offsetW, WERR, strideWERR, offsetWERR, IBLOCK, strideIBLOCK, offsetIBLOCK, INDEXW, strideINDEXW, offsetINDEXW ) { // eslint-disable-line max-len, max-params
	if ( range !== 'all' && range !== 'value' && range !== 'index' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `range` value. Value: `%s`.', range ) );
	}
	if ( order !== 'block' && order !== 'entire' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `order` value. Value: `%s`.', order ) );
	}
	return base( range, order, N, vl, vu, il, iu, GERS, strideGERS, offsetGERS, reltol, d, strideD, offsetD, e, strideE, offsetE, E2, strideE2, offsetE2, pivmin, nsplit, ISPLIT, strideISPLIT, offsetISPLIT, w, strideW, offsetW, WERR, strideWERR, offsetWERR, IBLOCK, strideIBLOCK, offsetIBLOCK, INDEXW, strideINDEXW, offsetINDEXW ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlarrd;
