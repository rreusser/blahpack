

// MODULES //

import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* CABS1: |re(z)| + |im(z)|.
*
* @param {Float64Array} v - Float64 view
* @param {integer} idx - index of real part
* @throws {TypeError} First argument must be a valid matrix triangle
* @throws {TypeError} Second argument must be a valid transpose operation
* @throws {TypeError} Third argument must be a valid diagonal type
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {number} CABS1 value
*/
function zlatbs( uplo, trans, diag, normin, N, kd, AB, strideAB1, strideAB2, offsetAB, x, strideX, offsetX, scale, CNORM, strideCNORM, offsetCNORM ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, trans, diag, normin, N, kd, AB, strideAB1, strideAB2, offsetAB, x, strideX, offsetX, scale, CNORM, strideCNORM, offsetCNORM ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlatbs;
