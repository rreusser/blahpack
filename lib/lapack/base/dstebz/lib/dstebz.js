
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} range - range
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {NonNegativeInteger} N - N
* @param {number} vl - vl
* @param {number} vu - vu
* @param {integer} il - il
* @param {integer} iu - iu
* @param {number} abstol - abstol
* @param {Float64Array} d - d
* @param {integer} strideD - strideD
* @param {Float64Array} e - e
* @param {integer} strideE - strideE
* @param {Int32Array} M - M
* @param {Int32Array} nsplit - nsplit
* @param {Float64Array} w - w
* @param {integer} strideW - strideW
* @param {Int32Array} IBLOCK - IBLOCK
* @param {integer} strideIBLOCK - strideIBLOCK
* @param {Int32Array} ISPLIT - ISPLIT
* @param {integer} strideISPLIT - strideISPLIT
* @param {Float64Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @param {Int32Array} IWORK - IWORK
* @param {integer} strideIWORK - strideIWORK
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dstebz( range, order, N, vl, vu, il, iu, abstol, d, strideD, e, strideE, M, nsplit, w, strideW, IBLOCK, strideIBLOCK, ISPLIT, strideISPLIT, WORK, strideWORK, IWORK, strideIWORK ) { // eslint-disable-line max-len, max-params
	var oiblock;
	var oisplit;
	var oiwork;
	var owork;
	var od;
	var oe;
	var ow;

	od = stride2offset( N, strideD );
	oe = stride2offset( N, strideE );
	ow = stride2offset( N, strideW );
	oiblock = stride2offset( N, strideIBLOCK );
	oisplit = stride2offset( N, strideISPLIT );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 4 * N );
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	if ( IWORK === null || IWORK === void 0 ) {
		var minIwork = Math.max( 1, 3 * N );
		IWORK = new Int32Array( minIwork );
		strideIWORK = 1;
	}
	owork = stride2offset( N, strideWORK );
	oiwork = stride2offset( N, strideIWORK );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( range !== 'all' && range !== 'value' && range !== 'index' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `range` value. Value: `%s`.', range ) );
	}
	return base( range, order, N, vl, vu, il, iu, abstol, d, strideD, od, e, strideE, oe, M, nsplit, w, strideW, ow, IBLOCK, strideIBLOCK, oiblock, ISPLIT, strideISPLIT, oisplit, WORK, strideWORK, owork, IWORK, strideIWORK, oiwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dstebz;
