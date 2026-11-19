/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, new-cap */

// MODULES //

import dlamch from '../../dlamch/lib/base.js';


// MAIN //

/**
* Computes one dqds transform in ping-pong form without a shift.
*
* ## Notes
*
* -   I0 and N0 are 1-based indices (Fortran convention).
* -   Z is a flat array of length >= 4*N0 storing interleaved q/e values.
* -   PP is 0 for ping, 1 for pong.
* -   The routine modifies Z in-place and returns output scalars as an object.
*
* @private
* @param {integer} i0 - first index (1-based)
* @param {integer} n0 - last index (1-based)
* @param {Float64Array} z - input/output array
* @param {integer} stride - stride length for `z`
* @param {NonNegativeInteger} offset - starting index for `z`
* @param {integer} pp - ping-pong flag (0 or 1)
* @param {Float64Array} dmin - output (length-1 array): minimum value of d
* @param {Float64Array} dmin1 - output (length-1 array): minimum value of d, excluding D( N0 )
* @param {Float64Array} dmin2 - output (length-1 array): minimum value of d, excluding D( N0 ) and D( N0-1 )
* @param {Float64Array} dn - output (length-1 array): d(N0), the last value of d
* @param {Float64Array} dnm1 - output (length-1 array): d(N0-1)
* @param {Float64Array} dnm2 - output (length-1 array): d(N0-2)
* @returns {void}
*/
function dlasq6( i0, n0, z, stride, offset, pp, dmin, dmin1, dmin2, dn, dnm1, dnm2 ) {
	let emin, temp, j4p2, j4, d;

	// Quick return...
	if ( ( n0 - i0 - 1 ) <= 0 ) {
		dmin[ 0 ] = 0.0;
		dmin1[ 0 ] = 0.0;
		dmin2[ 0 ] = 0.0;
		dn[ 0 ] = 0.0;
		dnm1[ 0 ] = 0.0;
		dnm2[ 0 ] = 0.0;
		return;
	}

	const safmin = dlamch( 'Safe minimum' );

	/**
	* Access Z using 1-based Fortran index.
	*
	* @private
	* @param {integer} k - 1-based index
	* @returns {number} array element
	*/
	function Z( k ) {
		return z[ offset + (( k - 1 ) * stride) ];
	}

	/**
	* Set Z using 1-based Fortran index.
	*
	* @private
	* @param {integer} k - 1-based index
	* @param {number} val - value to set
	*/
	function setZ( k, val ) {
		z[ offset + (( k - 1 ) * stride) ] = val;
	}

	j4 = ( 4 * i0 ) + pp - 3;
	emin = Z( j4 + 4 );
	d = Z( j4 );
	dmin[ 0 ] = d;

	if ( pp === 0 ) {
		for ( j4 = 4 * i0; j4 <= 4 * ( n0 - 3 ); j4 += 4 ) {
			setZ( j4 - 2, d + Z( j4 - 1 ) );
			if ( Z( j4 - 2 ) === 0.0 ) {
				setZ( j4, 0.0 );
				d = Z( j4 + 1 );
				dmin[ 0 ] = d;
				emin = 0.0;
			} else if ( ( safmin * Z( j4 + 1 ) < Z( j4 - 2 ) ) &&
				( safmin * Z( j4 - 2 ) < Z( j4 + 1 ) ) ) {
				temp = Z( j4 + 1 ) / Z( j4 - 2 );
				setZ( j4, Z( j4 - 1 ) * temp );
				d *= temp;
			} else {
				setZ( j4, Z( j4 + 1 ) * ( Z( j4 - 1 ) / Z( j4 - 2 ) ) );
				d = Z( j4 + 1 ) * ( d / Z( j4 - 2 ) );
			}
			dmin[ 0 ] = Math.min( dmin[ 0 ], d );
			emin = Math.min( emin, Z( j4 ) );
		}
	} else {
		for ( j4 = 4 * i0; j4 <= 4 * ( n0 - 3 ); j4 += 4 ) {
			setZ( j4 - 3, d + Z( j4 ) );
			if ( Z( j4 - 3 ) === 0.0 ) {
				setZ( j4 - 1, 0.0 );
				d = Z( j4 + 2 );
				dmin[ 0 ] = d;
				emin = 0.0;
			} else if ( ( safmin * Z( j4 + 2 ) < Z( j4 - 3 ) ) &&
				( safmin * Z( j4 - 3 ) < Z( j4 + 2 ) ) ) {
				temp = Z( j4 + 2 ) / Z( j4 - 3 );
				setZ( j4 - 1, Z( j4 ) * temp );
				d *= temp;
			} else {
				setZ( j4 - 1, Z( j4 + 2 ) * ( Z( j4 ) / Z( j4 - 3 ) ) );
				d = Z( j4 + 2 ) * ( d / Z( j4 - 3 ) );
			}
			dmin[ 0 ] = Math.min( dmin[ 0 ], d );
			emin = Math.min( emin, Z( j4 - 1 ) );
		}
	}

	// Unroll last two steps...
	dnm2[ 0 ] = d;
	dmin2[ 0 ] = dmin[ 0 ];
	j4 = ( 4 * ( n0 - 2 ) ) - pp;
	j4p2 = j4 + ( 2 * pp ) - 1;
	setZ( j4 - 2, dnm2[ 0 ] + Z( j4p2 ) );
	if ( Z( j4 - 2 ) === 0.0 ) {
		setZ( j4, 0.0 );
		dnm1[ 0 ] = Z( j4p2 + 2 );
		dmin[ 0 ] = dnm1[ 0 ];
		emin = 0.0;
	} else if ( ( safmin * Z( j4p2 + 2 ) < Z( j4 - 2 ) ) &&
		( safmin * Z( j4 - 2 ) < Z( j4p2 + 2 ) ) ) {
		temp = Z( j4p2 + 2 ) / Z( j4 - 2 );
		setZ( j4, Z( j4p2 ) * temp );
		dnm1[ 0 ] = dnm2[ 0 ] * temp;
	} else {
		setZ( j4, Z( j4p2 + 2 ) * ( Z( j4p2 ) / Z( j4 - 2 ) ) );
		dnm1[ 0 ] = Z( j4p2 + 2 ) * ( dnm2[ 0 ] / Z( j4 - 2 ) );
	}
	dmin[ 0 ] = Math.min( dmin[ 0 ], dnm1[ 0 ] );

	dmin1[ 0 ] = dmin[ 0 ];
	j4 += 4;
	j4p2 = j4 + ( 2 * pp ) - 1;
	setZ( j4 - 2, dnm1[ 0 ] + Z( j4p2 ) );
	if ( Z( j4 - 2 ) === 0.0 ) {
		setZ( j4, 0.0 );
		dn[ 0 ] = Z( j4p2 + 2 );
		dmin[ 0 ] = dn[ 0 ];
		emin = 0.0;
	} else if ( ( safmin * Z( j4p2 + 2 ) < Z( j4 - 2 ) ) &&
		( safmin * Z( j4 - 2 ) < Z( j4p2 + 2 ) ) ) {
		temp = Z( j4p2 + 2 ) / Z( j4 - 2 );
		setZ( j4, Z( j4p2 ) * temp );
		dn[ 0 ] = dnm1[ 0 ] * temp;
	} else {
		setZ( j4, Z( j4p2 + 2 ) * ( Z( j4p2 ) / Z( j4 - 2 ) ) );
		dn[ 0 ] = Z( j4p2 + 2 ) * ( dnm1[ 0 ] / Z( j4 - 2 ) );
	}
	dmin[ 0 ] = Math.min( dmin[ 0 ], dn[ 0 ] );

	setZ( j4 + 2, dn[ 0 ] );
	setZ( (4 * n0) - pp, emin );

}


// EXPORTS //

export default dlasq6;
