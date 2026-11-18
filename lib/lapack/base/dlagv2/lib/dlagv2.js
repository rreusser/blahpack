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
import base from './base.js';


// MAIN //

/**
* Computes the Generalized Schur factorization of a real 2-by-2 matrix pencil (A,B) where B is upper triangular.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {Float64Array} A - input/output 2-by-2 matrix A (column-major)
* @param {integer} LDA - leading dimension of `A`
* @param {Float64Array} B - input/output 2-by-2 upper triangular matrix B (column-major)
* @param {integer} LDB - leading dimension of `B`
* @param {Float64Array} alphar - output array for real parts of eigenvalue numerators
* @param {Float64Array} alphai - output array for imaginary parts of eigenvalue numerators
* @param {Float64Array} beta - output array for eigenvalue denominators
* @throws {TypeError} first argument must be a valid order
* @returns {Object} object with fields: `CSL`, `SNL`, `CSR`, `SNR`
*/
function dlagv2( order, A, LDA, B, LDB, alphar, alphai, beta ) { // eslint-disable-line max-params
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	return base( A, sa1, sa2, 0, B, sb1, sb2, 0, alphar, 1, 0, alphai, 1, 0, beta, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlagv2;
