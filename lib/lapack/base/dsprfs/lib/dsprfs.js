
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution to a system of linear equations with a symmetric indefinite matrix in packed storage.
*
* @param {string} uplo - specifies whether the upper or lower triangle is stored
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Float64Array} AP - original symmetric packed matrix
* @param {integer} strideAP - stride length for `AP`
* @param {Float64Array} AFP - factored packed matrix from dsptrf
* @param {integer} strideAFP - stride length for `AFP`
* @param {Int32Array} IPIV - pivot indices from dsptrf
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {Float64Array} B - right-hand side matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} X - solution matrix (improved on exit)
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} FERR - output forward error bounds
* @param {integer} strideFERR - stride for FERR
* @param {Float64Array} BERR - output backward error bounds
* @param {integer} strideBERR - stride for BERR
* @param {Float64Array} WORK - workspace
* @param {integer} strideWork - stride for WORK
* @param {Int32Array} IWORK - workspace
* @param {integer} strideIWork - stride for IWORK
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function dsprfs( uplo, N, nrhs, AP, strideAP, AFP, strideAFP, IPIV, strideIPIV, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, strideWork, IWORK, strideIWork ) { // eslint-disable-line max-len, max-params
	var oiwork;
	var oberr;
	var oferr;
	var oipiv;
	var owork;
	var oafp;
	var oap;

	oap = stride2offset( N * ( N + 1 ) / 2, strideAP );
	oafp = stride2offset( N * ( N + 1 ) / 2, strideAFP );
	oipiv = stride2offset( N, strideIPIV );
	oferr = stride2offset( nrhs, strideFERR );
	oberr = stride2offset( nrhs, strideBERR );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 3 * N );
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	if ( IWORK === null || IWORK === void 0 ) {
		var minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
		strideIWork = 1;
	}
	owork = stride2offset( 3 * N, strideWork );
	oiwork = stride2offset( N, strideIWork );
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
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	return base( uplo, N, nrhs, AP, strideAP, oap, AFP, strideAFP, oafp, IPIV, strideIPIV, oipiv, B, 1, LDB, 0, X, 1, LDX, 0, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, strideWork, owork, IWORK, strideIWork, oiwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dsprfs;
