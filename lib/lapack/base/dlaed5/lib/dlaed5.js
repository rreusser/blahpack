/* eslint-disable max-len, max-params */

// MODULES //

import base from './base.js';


// MAIN //

/**
* Solves the 2-by-2 secular equation.
*
* Computes the I-th eigenvalue of a symmetric rank-one modification of a
* 2-by-2 diagonal matrix:
*
* ```text
* diag( D ) + RHO * Z * transpose(Z)
* ```
*
* @param {integer} i - index of the eigenvalue to compute (1 or 2)
* @param {Float64Array} D - input array of length 2 containing the original eigenvalues
* @param {Float64Array} Z - input array of length 2 containing the updating vector components
* @param {Float64Array} DELTA - output array of length 2 for eigenvector construction info
* @param {number} rho - scalar in the symmetric updating formula
* @param {Float64Array} dlam - output array of length 1; `dlam[0]` receives the computed eigenvalue
* @returns {void}
*/
function dlaed5( i, D, Z, DELTA, rho, dlam ) {
	base( i, D, 1, 0, Z, 1, 0, DELTA, 1, 0, rho, dlam );
}


// EXPORTS //

export default dlaed5;
