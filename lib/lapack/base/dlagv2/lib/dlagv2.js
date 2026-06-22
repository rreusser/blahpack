
// MODULES //

import base from './base.js';


// MAIN //

/**
* Computes the Generalized Schur factorization of a real 2-by-2 matrix pencil (A,B) where B is upper triangular.
*
* @param {Float64Array} A - input/output 2-by-2 matrix A (column-major)
* @param {integer} LDA - leading dimension of `A`
* @param {Float64Array} B - input/output 2-by-2 upper triangular matrix B (column-major)
* @param {integer} LDB - leading dimension of `B`
* @param {Float64Array} alphar - output array for real parts of eigenvalue numerators
* @param {Float64Array} alphai - output array for imaginary parts of eigenvalue numerators
* @param {Float64Array} beta - output array for eigenvalue denominators
* @returns {Object} object with fields: `CSL`, `SNL`, `CSR`, `SNR`
*/
function dlagv2( A, LDA, B, LDB, alphar, alphai, beta ) { // eslint-disable-line max-params
	return base( A, 1, LDA, 0, B, 1, LDB, 0, alphar, 1, 0, alphai, 1, 0, beta, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlagv2;
