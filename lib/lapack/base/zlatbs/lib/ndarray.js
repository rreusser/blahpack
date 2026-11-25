/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a complex triangular banded system with scaling to prevent overflow.
*
* Solves one of:
*   A_x = s_b   (trans = 'no-transpose')
*   A^T_x = s_b (trans = 'transpose')
*   A^H_x = s_b (trans = 'conjugate-transpose')
*
* where A is an N-by-N complex triangular band matrix with KD sub/super-diagonals,
* x and b are N-vectors, and s is a real scaling factor chosen to prevent overflow.
*
* @param {MatrixTriangle} uplo - 'upper' or 'lower'
* @param {TransposeOperation} trans - 'no-transpose', 'transpose', or 'conjugate-transpose'
* @param {DiagonalType} diag - 'non-unit' or 'unit'
* @param {('no'|'yes')} normin - 'yes' if CNORM contains column norms on input, 'no' to compute them
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} kd - number of sub/super-diagonals
* @param {Complex128Array} AB - triangular band matrix in band storage
* @param {integer} strideAB1 - first dimension stride of AB (complex elements)
* @param {integer} strideAB2 - second dimension stride of AB (complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for AB (complex elements)
* @param {Complex128Array} x - in/out right-hand side vector of length N
* @param {integer} strideX - stride for x (complex elements)
* @param {NonNegativeInteger} offsetX - starting index for x (complex elements)
* @param {Float64Array} scale - output: scale[0] is the scale factor s
* @param {Float64Array} CNORM - in/out column norm array of length N
* @param {integer} strideCNORM - stride for CNORM
* @param {NonNegativeInteger} offsetCNORM - starting index for CNORM
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {TypeError} second argument must be a valid transpose operation
* @throws {TypeError} third argument must be a valid diagonal type
* @throws {TypeError} fourth argument must be one of the following: "no", "yes"
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @returns {integer} info - 0 if successful
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
	if ( normin !== 'no' && normin !== 'yes' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be one of the following: "no", "yes". Value: `%s`.', normin ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( kd < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', kd ) );
	}
	return base( uplo, trans, diag, normin, N, kd, AB, strideAB1, strideAB2, offsetAB, x, strideX, offsetX, scale, CNORM, strideCNORM, offsetCNORM ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlatbs;
