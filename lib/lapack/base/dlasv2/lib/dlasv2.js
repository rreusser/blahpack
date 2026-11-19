/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import base from './base.js';


// MAIN //

/**
* Computes the singular value decomposition of a 2-by-2 triangular matrix:.
* @param {Float64Array} ssmin - output (length-1 array): abs(SSMIN) is the smaller singular value
* @param {Float64Array} ssmax - output (length-1 array): abs(SSMAX) is the larger singular value
* @param {Float64Array} snr - output (length-1 array): `snr`
* @param {Float64Array} csr - output (length-1 array): the vector (CSR, SNR) is a unit right singular vector for the singular value abs(SSMAX)
* @param {Float64Array} snl - output (length-1 array): `snl`
* @param {Float64Array} csl - output (length-1 array): the vector (CSL, SNL) is a unit left singular vector for the singular value abs(SSMAX)
* @returns {void}
*/
function dlasv2( f, g, h, ssmin, ssmax, snr, csr, snl, csl ) {
	return base( f, g, h, ssmin, ssmax, snr, csr, snl, csl );
}


// EXPORTS //

export default dlasv2;
