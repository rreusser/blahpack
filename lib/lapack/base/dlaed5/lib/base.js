/* eslint-disable max-len, max-params */

// MODULES //

import sqrt from '@stdlib/math/base/special/sqrt/lib/index.js';
import abs from '@stdlib/math/base/special/abs/lib/index.js';


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
* The diagonal elements in the array D are assumed to satisfy `D[0] < D[1]`.
* RHO is assumed to be positive and the Euclidean norm of Z is assumed to be
* one.
*
* @private
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
function dlaed5( i, D, strideD, offsetD, Z, strideZ, offsetZ, DELTA, strideDELTA, offsetDELTA, rho, dlam ) {
	var z1sq;
	var z2sq;
	var temp;
	var zsq;
	var del;
	var id1;
	var id2;
	var iz1;
	var iz2;
	var ie1;
	var ie2;
	var tau;
	var b;
	var c;
	var w;

	id1 = offsetD;
	id2 = offsetD + strideD;
	iz1 = offsetZ;
	iz2 = offsetZ + strideZ;
	ie1 = offsetDELTA;
	ie2 = offsetDELTA + strideDELTA;

	del = D[ id2 ] - D[ id1 ];
	z1sq = Z[ iz1 ] * Z[ iz1 ];
	z2sq = Z[ iz2 ] * Z[ iz2 ];
	zsq = z1sq + z2sq;

	if ( i === 1 ) {
		w = 1.0 + ( ( 2.0 * rho * ( z2sq - z1sq ) ) / del );

		if ( w > 0.0 ) {
			b = del + ( rho * zsq );
			c = rho * z1sq * del;

			// B > 0 always in this branch
			tau = ( 2.0 * c ) / ( b + sqrt( abs( ( b * b ) - ( 4.0 * c ) ) ) );
			dlam[ 0 ] = D[ id1 ] + tau;
			DELTA[ ie1 ] = -Z[ iz1 ] / tau;
			DELTA[ ie2 ] = Z[ iz2 ] / ( del - tau );
		} else {
			b = -del + ( rho * zsq );
			c = rho * z2sq * del;

			if ( b > 0.0 ) {
				tau = ( -2.0 * c ) / ( b + sqrt( ( b * b ) + ( 4.0 * c ) ) );
			} else {
				tau = ( b - sqrt( ( b * b ) + ( 4.0 * c ) ) ) / 2.0;
			}
			dlam[ 0 ] = D[ id2 ] + tau;
			DELTA[ ie1 ] = -Z[ iz1 ] / ( del + tau );
			DELTA[ ie2 ] = -Z[ iz2 ] / tau;
		}

		temp = sqrt( ( DELTA[ ie1 ] * DELTA[ ie1 ] ) + ( DELTA[ ie2 ] * DELTA[ ie2 ] ) );
		DELTA[ ie1 ] /= temp;
		DELTA[ ie2 ] /= temp;
	} else {
		// I = 2
		b = -del + ( rho * zsq );
		c = rho * z2sq * del;

		if ( b > 0.0 ) {
			tau = ( b + sqrt( ( b * b ) + ( 4.0 * c ) ) ) / 2.0;
		} else {
			tau = ( 2.0 * c ) / ( -b + sqrt( ( b * b ) + ( 4.0 * c ) ) );
		}
		dlam[ 0 ] = D[ id2 ] + tau;
		DELTA[ ie1 ] = -Z[ iz1 ] / ( del + tau );
		DELTA[ ie2 ] = -Z[ iz2 ] / tau;

		temp = sqrt( ( DELTA[ ie1 ] * DELTA[ ie1 ] ) + ( DELTA[ ie2 ] * DELTA[ ie2 ] ) );
		DELTA[ ie1 ] /= temp;
		DELTA[ ie2 ] /= temp;
	}
}


// EXPORTS //

export default dlaed5;
