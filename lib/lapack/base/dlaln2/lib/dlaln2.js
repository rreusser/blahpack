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
* Solves a 1-by-1 or 2-by-2 linear system of equations of the specified form.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {boolean} ltrans - =`true`: A-transpose will be used. =`false`: A will be used (not transposed.)
* @param {NonNegativeInteger} na - the size of the matrix A.
* @param {NonNegativeInteger} nw - 1 if "w" is real, 2 if "w" is complex.
* @param {number} smin - the desired lower bound on the singular values of A.
* @param {number} ca - the coefficient c, which A is multiplied by.
* @param {Float64Array} A - the NA x NA matrix A.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {number} d1 - the 1,1 element in the diagonal matrix D.
* @param {number} d2 - the 2,2 element in the diagonal matrix D.
* @param {Float64Array} B - the NA x NW matrix B (right-hand side).
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {number} wr - the real part of the scalar "w".
* @param {number} wi - the imaginary part of the scalar "w".
* @param {Float64Array} X - the NA x NW matrix X (unknowns), as computed by DLALN2.
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} scale - output (length-1 array): the scale factor that B must be multiplied by to insure that overflow does not occur when computing X
* @param {Float64Array} xnorm - output (length-1 array): the infinity-norm of X, when X is regarded as an NA x NW real matrix
* @throws {TypeError} first argument must be a valid order
* @returns {integer} status code (0 = success)
*/
function dlaln2( order, ltrans, na, nw, smin, ca, A, LDA, d1, d2, B, LDB, wr, wi, X, LDX, scale, xnorm ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const sx1 = ( order === 'column-major' ) ? 1 : LDX;
	const sx2 = ( order === 'column-major' ) ? LDX : 1;
	return base( ltrans, na, nw, smin, ca, A, sa1, sa2, 0, d1, d2, B, sb1, sb2, 0, wr, wi, X, sx1, sx2, 0, scale, xnorm ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaln2;
