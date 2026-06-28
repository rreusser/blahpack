
// MODULES //

import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a triangular banded system with scaling to prevent overflow.
*
* `AB*x = s*b  (trans = 'no-transpose')`
* `AB^T*x = s*b  (trans = 'transpose')`
*
* where AB is an N-by-N upper or lower triangular band matrix with KD+1
* diagonals, x and b are N-vectors, and s is a scaling factor chosen to
* prevent overflow.
*
* @param {string} uplo - 'upper' or 'lower'
* @param {string} trans - 'no-transpose' or 'transpose'
* @param {string} diag - 'non-unit' or 'unit'
* @param {string} normin - `'yes'` if CNORM contains column norms on input, `'no'` to compute them
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} kd - number of superdiagonals (upper) or subdiagonals (lower)
* @param {Float64Array} AB - band matrix in banded storage, (KD+1) by N
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} x - in/out right-hand side vector of length N
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} scale - out: scale[0] is the scale factor s
* @param {Float64Array} CNORM - in/out column norm array of length N
* @param {integer} strideCNORM - stride length for `CNORM`
* @param {NonNegativeInteger} offsetCNORM - starting index for `CNORM`
* @throws {TypeError} First argument must be a valid matrix triangle
* @throws {TypeError} Second argument must be a valid transpose operation
* @throws {TypeError} Third argument must be a valid diagonal type
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful
*/
function dlatbs( uplo, trans, diag, normin, N, kd, AB, strideAB1, strideAB2, offsetAB, x, strideX, offsetX, scale, CNORM, strideCNORM, offsetCNORM ) { // eslint-disable-line max-len, max-params
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

export default dlatbs;
