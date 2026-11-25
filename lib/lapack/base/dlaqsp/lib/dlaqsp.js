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

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Equilibrates a symmetric matrix A in packed storage using the scaling factors in the vector S.
*
* @param {string} order - storage layout
* @param {string} uplo - specifies whether the upper or lower triangular part of `A` is packed ('upper' or 'lower')
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} AP - packed symmetric matrix, length N*(N+1)/2
* @param {Float64Array} S - scaling factors, length N
* @param {integer} strideS - stride for S
* @param {number} scond - ratio of smallest to largest scaling factor
* @param {number} amax - absolute value of largest matrix element
* @param {Array<string>} equed - specifies whether or not equilibration was done. `'none'`: No equilibration. `'yes'`: Equilibration was done, i.e., A has been replaced by diag(S) * A * diag(S).
* @throws {TypeError} first argument must be a valid order
* @returns {Float64Array} `AP`
*/
function dlaqsp( order, uplo, N, AP, S, strideS, scond, amax, equed ) {

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	const os = stride2offset( N, strideS );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' ) {
		throw new TypeError( format( 'invalid argument. First argument must be \'column-major\'; packed storage is LAPACK column-major packed. Value: `%s`.', order ) );
	}
	return base( uplo, N, AP, 1, 0, S, strideS, os, scond, amax, equed );
}


// EXPORTS //

export default dlaqsp;
