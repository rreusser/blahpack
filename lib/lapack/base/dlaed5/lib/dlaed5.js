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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
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
* @param {integer} strideD - stride length for `D`
* @param {Float64Array} Z - input array of length 2 containing the updating vector components
* @param {integer} strideZ - stride length for `Z`
* @param {Float64Array} DELTA - output array of length 2 for eigenvector construction info
* @param {integer} strideDELTA - stride length for `DELTA`
* @param {number} rho - scalar in the symmetric updating formula
* @param {Float64Array} dlam - output array of length 1; `dlam[0]` receives the computed eigenvalue
* @returns {void}
*/
function dlaed5( i, D, strideD, Z, strideZ, DELTA, strideDELTA, rho, dlam ) {
	const od = stride2offset( 2, strideD );
	const oz = stride2offset( 2, strideZ );
	const odelta = stride2offset( 2, strideDELTA );
	base( i, D, strideD, od, Z, strideZ, oz, DELTA, strideDELTA, odelta, rho, dlam );
}


// EXPORTS //

export default dlaed5;
