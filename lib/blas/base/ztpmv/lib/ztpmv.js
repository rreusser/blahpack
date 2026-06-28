
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} uplo - uplo
* @param {string} trans - trans
* @param {string} diag - diag
* @param {NonNegativeInteger} N - N
* @param {Complex128Array} AP - AP
* @param {integer} strideAP - strideAP
* @param {Complex128Array} x - x
* @param {integer} strideX - strideX
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Complex128Array} output array
*/
function ztpmv( uplo, trans, diag, N, AP, strideAP, x, strideX ) { // eslint-disable-line max-len, max-params
	var oap;
	var ox;

	oap = stride2offset( N, strideAP );
	ox = stride2offset( N, strideX );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, trans, diag, N, AP, strideAP, oap, x, strideX, ox );
}


// EXPORTS //

export default ztpmv;
