

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} uplo - uplo
* @param {NonNegativeInteger} N - N
* @param {NonNegativeInteger} nrhs - nrhs
* @param {Float64Array} d - d
* @param {integer} strideD - strideD
* @param {Complex128Array} e - e
* @param {integer} strideE - strideE
* @param {Float64Array} DF - DF
* @param {integer} strideDF - strideDF
* @param {Complex128Array} EF - EF
* @param {integer} strideEF - strideEF
* @param {Complex128Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} X - X
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} FERR - FERR
* @param {integer} strideFERR - strideFERR
* @param {Float64Array} BERR - BERR
* @param {integer} strideBERR - strideBERR
* @param {Complex128Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @param {Float64Array} RWORK - RWORK
* @param {integer} strideRWORK - strideRWORK
* @returns {integer} info status code
*/
function zptrfs( uplo, N, nrhs, d, strideD, e, strideE, DF, strideDF, EF, strideEF, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, RWORK, strideRWORK ) { // eslint-disable-line max-len, max-params
	var orwork;
	var oberr;
	var oferr;
	var owork;
	var odf;
	var oef;
	var sb1;
	var sb2;
	var sx1;
	var sx2;
	var od;
	var oe;

	sb1 = 1;
	sb2 = LDB;
	sx1 = 1;
	sx2 = LDX;
	od = stride2offset( N, strideD );
	oe = stride2offset( N, strideE );
	odf = stride2offset( N, strideDF );
	oef = stride2offset( N, strideEF );
	oferr = stride2offset( N, strideFERR );
	oberr = stride2offset( N, strideBERR );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, N );
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
		strideRWORK = 1;
	}
	owork = stride2offset( N, strideWORK );
	orwork = stride2offset( N, strideRWORK );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	return base( uplo, N, nrhs, d, strideD, od, e, strideE, oe, DF, strideDF, odf, EF, strideEF, oef, B, sb1, sb2, 0, X, sx1, sx2, 0, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, strideWORK, owork, RWORK, strideRWORK, orwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zptrfs;
