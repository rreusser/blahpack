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

import base from './base.js';


// MAIN //

/**
* Computes the Generalized Schur factorization of a real 2-by-2 matrix pencil (A,B) where B is upper triangular.
*
* @param {Float64Array} A - input/output 2-by-2 matrix A
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - input/output 2-by-2 upper triangular matrix B
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} alphar - output array for real parts of eigenvalue numerators
* @param {integer} strideALPHAR - stride length for `alphar`
* @param {NonNegativeInteger} offsetALPHAR - starting index for `alphar`
* @param {Float64Array} alphai - output array for imaginary parts of eigenvalue numerators
* @param {integer} strideALPHAI - stride length for `alphai`
* @param {NonNegativeInteger} offsetALPHAI - starting index for `alphai`
* @param {Float64Array} beta - output array for eigenvalue denominators
* @param {integer} strideBETA - stride length for `beta`
* @param {NonNegativeInteger} offsetBETA - starting index for `beta`
* @param {Float64Array} csl - output (length-1 array): the cosine of the left rotation matrix
* @param {Float64Array} snl - output (length-1 array): the sine of the left rotation matrix
* @param {Float64Array} csr - output (length-1 array): the cosine of the right rotation matrix
* @param {Float64Array} snr - output (length-1 array): the sine of the right rotation matrix
* @returns {Float64Array} `beta`
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlagv2 from '@rreusser/blahpack/lapack/dlagv2';
*
* var A = new Float64Array( [ 4.0, 2.0, 1.0, 3.0 ] );
* var B = new Float64Array( [ 2.0, 0.0, 1.0, 1.0 ] );
* var alphar = new Float64Array( 2 );
* var alphai = new Float64Array( 2 );
* var beta = new Float64Array( 2 );
*
* var csl = new Float64Array( 1 );
* var snl = new Float64Array( 1 );
* var csr = new Float64Array( 1 );
* var snr = new Float64Array( 1 );
*
* dlagv2.strided( A, 1, 2, 0, B, 1, 2, 0, alphar, 1, 0, alphai, 1, 0, beta, 1, 0, csl, snl, csr, snr );
* // alphar => <Float64Array>[ 2.0, 2.0 ]
* // alphai => <Float64Array>[ 1.0, -1.0 ]
* // beta => <Float64Array>[ 1.0, 1.0 ]
* // csl[ 0 ] => ~0.97325
* // snl[ 0 ] => ~0.22975
* // csr[ 0 ] => ~0.85065
* // snr[ 0 ] => ~0.52573
*/
function dlagv2( A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, alphar, strideALPHAR, offsetALPHAR, alphai, strideALPHAI, offsetALPHAI, beta, strideBETA, offsetBETA, csl, snl, csr, snr ) { // eslint-disable-line max-len, max-params
	return base( A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, alphar, strideALPHAR, offsetALPHAR, alphai, strideALPHAI, offsetALPHAI, beta, strideBETA, offsetBETA, csl, snl, csr, snr ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlagv2;
