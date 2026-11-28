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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import strided from './strided.js';


// MAIN //

/**
* Computes the reciprocal pivot growth factor `norm(A)/norm(U)` for a symmetric positive-definite matrix.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {MatrixTriangle} uplo - specifies whether the upper or lower triangle is stored (`upper` or `lower`)
* @param {NonNegativeInteger} ncols - number of columns of the matrix A
* @param {Float64Array} A - input matrix A (column-major)
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} AF - triangular factor from the Cholesky factorization (column-major)
* @param {PositiveInteger} LDAF - leading dimension of `AF`
* @param {(Float64Array|null)} WORK - workspace array of length at least `2*ncols`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {TypeError} if a string argument is not a valid option
* @returns {number} reciprocal pivot growth factor
*/
function dla_porpvgrw( order, uplo, ncols, A, LDA, AF, LDAF, WORK ) { // eslint-disable-line max-len, max-params
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const saf1 = ( order === 'column-major' ) ? 1 : LDAF;
	const saf2 = ( order === 'column-major' ) ? LDAF : 1;
	if ( WORK === null || WORK === void 0 ) {
		const minWork = 2 * ncols;
		WORK = new Float64Array( minWork );
	}
	return strided( uplo, ncols, A, sa1, sa2, 0, AF, saf1, saf2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default dla_porpvgrw;
