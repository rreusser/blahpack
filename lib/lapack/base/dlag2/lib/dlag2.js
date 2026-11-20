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
* Computes the eigenvalues of a 2-by-2 generalized eigenvalue problem `A - w B`, with scaling as necessary to avoid over-/underflow.
*
* @param {string} order - storage layout
* @param {Float64Array} A - input 2-by-2 matrix A
* @param {PositiveInteger} LDA - leading dimension of A
* @param {Float64Array} B - input 2-by-2 upper triangular matrix B
* @param {PositiveInteger} LDB - leading dimension of B
* @param {number} safmin - smallest positive number such that `1/safmin` does not overflow
* @param {Float64Array} scale1 - output (length-1 array): a scaling factor used to avoid over-/underflow in the eigenvalue equation which defines the first eigenvalue
* @param {Float64Array} scale2 - output (length-1 array): a scaling factor used to avoid over-/underflow in the eigenvalue equation which defines the second eigenvalue
* @param {Float64Array} wr1 - output (length-1 array): if the eigenvalue is real, then WR1 is SCALE1 times the eigenvalue closest to the (2,2) element of A B**(-1)
* @param {Float64Array} wr2 - output (length-1 array): if the eigenvalue is real, then WR2 is SCALE2 times the other eigenvalue
* @param {Float64Array} wi - output (length-1 array): if the eigenvalue is real, then WI is zero
* @throws {TypeError} first argument must be a valid order
*/
function dlag2( order, A, LDA, B, LDB, safmin, scale1, scale2, wr1, wr2, wi ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( order === 'row-major' ) {
		return base( A, LDA, 1, 0, B, LDB, 1, 0, safmin, scale1, scale2, wr1, wr2, wi );
	}
	return base( A, 1, LDA, 0, B, 1, LDB, 0, safmin, scale1, scale2, wr1, wr2, wi );
}


// EXPORTS //

export default dlag2;
