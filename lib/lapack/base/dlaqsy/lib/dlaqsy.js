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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Scales a symmetric/Hermitian matrix, using scaling factors computed by spoequ.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} uplo - specifies whether the upper or lower triangular part of the symmetric matrix A is stored. `'upper'`: Upper triangular `'lower'`: Lower triangular.
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {Float64Array} A - on entry, the symmetric matrix A. On exit, if `equed === 'yes'`, the equilibrated matrix: diag(S) * A * diag(S).
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} s - the scale factors for A.
* @param {integer} strideS - stride length for `s`
* @param {number} scond - ratio of the smallest S(i) to the largest S(i).
* @param {number} amax - absolute value of largest matrix entry.
* @param {Array<string>} equed - specifies whether or not equilibration was done. `'none'`: No equilibration. `'yes'`: Equilibration was done, i.e., A has been replaced by diag(S) * A * diag(S).
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @returns {Float64Array} `A`
*/
function dlaqsy( order, uplo, N, A, LDA, s, strideS, scond, amax, equed ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const os = stride2offset( N, strideS );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	return base( uplo, N, A, sa1, sa2, 0, s, strideS, os, scond, amax, equed );
}


// EXPORTS //

export default dlaqsy;
