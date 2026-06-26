// MODULES //

import base from './base.js';


// MAIN //

/**
* Compute |re|^2 + |im|^2.
*
* @param {number} re - real part
* @param {number} im - imaginary part
* @returns {number} sum of squares
*/
function zlartg( f, offsetF, g, offsetG, c, offsetC, s, offsetS, r, offsetR ) {
	return base( f, offsetF, g, offsetG, c, offsetC, s, offsetS, r, offsetR );
}


// EXPORTS //

export default zlartg;
