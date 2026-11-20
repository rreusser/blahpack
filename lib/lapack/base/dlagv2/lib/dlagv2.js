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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the Generalized Schur factorization of a real 2-by-2 matrix pencil (A,B) where B is upper triangular.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {Float64Array} A - input/output 2-by-2 matrix A (column-major)
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} B - input/output 2-by-2 upper triangular matrix B (column-major)
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} alphar - output array for real parts of eigenvalue numerators
* @param {integer} strideALPHAR - stride length for `alphar`
* @param {Float64Array} alphai - output array for imaginary parts of eigenvalue numerators
* @param {integer} strideALPHAI - stride length for `alphai`
* @param {Float64Array} beta - output array for eigenvalue denominators
* @param {integer} strideBETA - stride length for `beta`
* @param {Float64Array} csl - output (length-1 array): the cosine of the left rotation matrix
* @param {Float64Array} snl - output (length-1 array): the sine of the left rotation matrix
* @param {Float64Array} csr - output (length-1 array): the cosine of the right rotation matrix
* @param {Float64Array} snr - output (length-1 array): the sine of the right rotation matrix
* @throws {TypeError} first argument must be a valid order
* @returns {Float64Array} `beta`
*/
function dlagv2( order, A, LDA, B, LDB, alphar, strideALPHAR, alphai, strideALPHAI, beta, strideBETA, csl, snl, csr, snr ) { // eslint-disable-line max-params
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const oalphar = stride2offset( 2, strideALPHAR );
	const oalphai = stride2offset( 2, strideALPHAI );
	const obeta = stride2offset( 2, strideBETA );
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	return base( A, sa1, sa2, 0, B, sb1, sb2, 0, alphar, strideALPHAR, oalphar, alphai, strideALPHAI, oalphai, beta, strideBETA, obeta, csl, snl, csr, snr ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlagv2;
