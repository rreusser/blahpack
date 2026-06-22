/* eslint-disable max-len, max-params */

// MODULES //

import base from './base.js';


// MAIN //

/**
* Computes the positive or negative root (closest to the origin) of the secular equation.
*
* @param {integer} kniter - iteration count hint from dlaed4
* @param {boolean} orgati - if true, root is between `d[1]` and `d[2]`; otherwise between `d[0]` and `d[1]`
* @param {number} rho - scalar in the secular equation
* @param {Float64Array} d - input array of length 3 containing the original eigenvalues
* @param {Float64Array} z - input array of length 3 containing the updating vector components
* @param {number} finit - value of f at 0
* @param {Float64Array} tau - output array of length 1; `tau[0]` receives the computed root
* @returns {integer} info - 0 on success, 1 if convergence fails
*/
function dlaed6( kniter, orgati, rho, d, z, finit, tau ) {
	return base( kniter, orgati, rho, d, 1, 0, z, 1, 0, finit, tau );
}


// EXPORTS //

export default dlaed6;
