
// MODULES //

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs one of the matrix-matrix operations.
*
*   B := alpha _ A _ X + beta _ B    (trans = 'no-transpose')
_   B := alpha _ A^T _ X + beta _ B  (trans = 'transpose')
*
* where A is an N-by-N general tridiagonal matrix with sub-diagonal DL,
* diagonal D, and super-diagonal DU; X is an N-by-NRHS matrix; and B is
* an N-by-NRHS matrix.
*
* Only alpha = 1 or -1 is handled; other alpha values leave B unchanged
* after the beta scaling.
*
* @param {string} trans - 'no-transpose' or 'transpose'
* @param {NonNegativeInteger} N - order of the tridiagonal matrix A
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of X and B)
* @param {number} alpha - scalar multiplier (must be 1.0 or -1.0)
* @param {Float64Array} DL - sub-diagonal of A (length N-1)
* @param {integer} strideDL - stride for DL
* @param {NonNegativeInteger} offsetDL - starting index for DL
* @param {Float64Array} d - diagonal of A (length N)
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} DU - super-diagonal of A (length N-1)
* @param {integer} strideDU - stride for DU
* @param {NonNegativeInteger} offsetDU - starting index for DU
* @param {Float64Array} X - input matrix (N x NRHS)
* @param {integer} strideX1 - stride of the first dimension of X
* @param {integer} strideX2 - stride of the second dimension of X
* @param {NonNegativeInteger} offsetX - starting index for X
* @param {number} beta - scalar multiplier for B (0, 1, or -1)
* @param {Float64Array} B - input/output matrix (N x NRHS)
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @throws {TypeError} First argument must be a valid transpose operation
* @throws {RangeError} if a numerical argument does not satisfy constraints
*/
function dlagtm( trans, N, nrhs, alpha, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, X, strideX1, strideX2, offsetX, beta, B, strideB1, strideB2, offsetB ) { // eslint-disable-line max-len, max-params
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( trans, N, nrhs, alpha, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, X, strideX1, strideX2, offsetX, beta, B, strideB1, strideB2, offsetB ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlagtm;
