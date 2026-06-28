
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes selected eigenvalues of a real symmetric tridiagonal matrix T.
* by bisection.
*
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
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @param {Int32Array} IWORK - workspace, length 3*N
* @param {integer} strideIWORK - stride for IWORK
* @param {NonNegativeInteger} offsetIWORK - starting index for IWORK
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info
*/
function dstebz( range, order, N, vl, vu, il, iu, abstol, d, strideD, offsetD, e, strideE, offsetE, M, nsplit, w, strideW, offsetW, IBLOCK, strideIBLOCK, offsetIBLOCK, ISPLIT, strideISPLIT, offsetISPLIT, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK ) { // eslint-disable-line max-len, max-params
	if ( range !== 'all' && range !== 'value' && range !== 'index' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid range value. Value: `%s`.', range ) );
	}
	if ( order !== 'block' && order !== 'entire' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid order value. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	return base( range, order, N, vl, vu, il, iu, abstol, d, strideD, offsetD, e, strideE, offsetE, M, nsplit, w, strideW, offsetW, IBLOCK, strideIBLOCK, offsetIBLOCK, ISPLIT, strideISPLIT, offsetISPLIT, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default dstebz;
