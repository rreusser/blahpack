
// MODULES //

import base from './base.js';


// MAIN //

/**
* Solves the 2-by-2 secular equation.
*
* @param {integer} i - index of the eigenvalue to compute (1 or 2)
* @param {Float64Array} D - input array of length 2 containing the original eigenvalues
* @param {integer} strideD - stride length for `D`
* @param {NonNegativeInteger} offsetD - starting index for `D`
* @param {Float64Array} Z - input array of length 2 containing the updating vector components
* @param {integer} strideZ - stride length for `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Float64Array} DELTA - output array of length 2 for eigenvector construction info
* @param {integer} strideDELTA - stride length for `DELTA`
* @param {NonNegativeInteger} offsetDELTA - starting index for `DELTA`
* @param {number} rho - scalar in the symmetric updating formula
* @param {Float64Array} dlam - output array of length 1; `dlam[0]` receives the computed eigenvalue
* @returns {void}
*/
function dlaed5( i, D, strideD, offsetD, Z, strideZ, offsetZ, DELTA, strideDELTA, offsetDELTA, rho, dlam ) { // eslint-disable-line max-len, max-params
	return base( i, D, strideD, offsetD, Z, strideZ, offsetZ, DELTA, strideDELTA, offsetDELTA, rho, dlam ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaed5;
