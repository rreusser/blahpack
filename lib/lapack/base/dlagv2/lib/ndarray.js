
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
* @returns {Object} object with fields: `CSL`, `SNL`, `CSR`, `SNR`
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var A = new Float64Array( [ 4.0, 2.0, 1.0, 3.0 ] );
* var B = new Float64Array( [ 2.0, 0.0, 1.0, 1.0 ] );
* var alphar = new Float64Array( 2 );
* var alphai = new Float64Array( 2 );
* var beta = new Float64Array( 2 );
*
* var result = dlagv2( A, 1, 2, 0, B, 1, 2, 0, alphar, 1, 0, alphai, 1, 0, beta, 1, 0 );
* // returns { 'CSL': ~0.973, 'SNL': ~0.23, 'CSR': ~0.851, 'SNR': ~0.526 }
*/
function dlagv2( A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, alphar, strideALPHAR, offsetALPHAR, alphai, strideALPHAI, offsetALPHAI, beta, strideBETA, offsetBETA ) { // eslint-disable-line max-len, max-params
	return base( A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, alphar, strideALPHAR, offsetALPHAR, alphai, strideALPHAI, offsetALPHAI, beta, strideBETA, offsetBETA ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlagv2;
