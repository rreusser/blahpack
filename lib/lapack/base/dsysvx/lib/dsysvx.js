
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
* @param {string} fact - fact
* @param {string} uplo - uplo
* @param {NonNegativeInteger} N - N
* @param {NonNegativeInteger} nrhs - nrhs
* @param {Float64Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} AF - AF
* @param {PositiveInteger} LDAF - leading dimension of `AF`
* @param {Int32Array} IPIV - IPIV
* @param {integer} strideIPIV - strideIPIV
* @param {Float64Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} X - X
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} rcond - rcond
* @param {Float64Array} FERR - FERR
* @param {integer} strideFERR - strideFERR
* @param {Float64Array} BERR - BERR
* @param {integer} strideBERR - strideBERR
* @param {Float64Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @param {integer} lwork - lwork
* @param {Int32Array} IWORK - IWORK
* @param {integer} strideIWORK - strideIWORK
* @returns {integer} info status code
*/
function dsysvx( fact, uplo, N, nrhs, A, LDA, AF, LDAF, IPIV, strideIPIV, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, lwork, IWORK, strideIWORK ) { // eslint-disable-line max-len, max-params
	var oiwork;
	var oberr;
	var oferr;
	var oipiv;
	var owork;
	var saf1;
	var saf2;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sx1;
	var sx2;

	sa1 = 1;
	sa2 = LDA;
	saf1 = 1;
	saf2 = LDAF;
	sb1 = 1;
	sb2 = LDB;
	sx1 = 1;
	sx2 = LDX;
	oipiv = stride2offset( N, strideIPIV );
	oferr = stride2offset( N, strideFERR );
	oberr = stride2offset( N, strideBERR );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1,3 * N);
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	if ( IWORK === null || IWORK === void 0 ) {
		var minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
		strideIWORK = 1;
	}
	owork = stride2offset( N, strideWORK );
	oiwork = stride2offset( N, strideIWORK );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDAF < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAF ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	if ( fact !== 'not-factored' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `fact` value. Value: `%s`.', fact ) );
	}
	return base( fact, uplo, N, nrhs, A, sa1, sa2, 0, AF, saf1, saf2, 0, IPIV, strideIPIV, oipiv, B, sb1, sb2, 0, X, sx1, sx2, 0, rcond, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, strideWORK, owork, lwork, IWORK, strideIWORK, oiwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dsysvx;
