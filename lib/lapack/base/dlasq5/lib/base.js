/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable max-len, max-params, new-cap */

// MAIN //

/**
* Computes one dqds transform in ping-pong form with a shift.
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
* @param {number} tau - shift value
* @param {number} sigma - accumulated shift
* @param {boolean} ieee - flag for IEEE arithmetic
* @param {number} eps - machine epsilon
* @returns {Object} object with properties: dmin, dmin1, dmin2, dn, dnm1, dnm2
*/
function dlasq5( i0, n0, z, stride, offset, pp, tau, sigma, ieee, eps ) {
	var dthresh;
	var dmin1;
	var dmin2;
	var dnm1;
	var dnm2;
	var emin;
	var dmin;
	var temp;
	var j4p2;
	var j4;
	var dn;
	var d;

	// Quick return...
	if ( ( n0 - i0 - 1 ) <= 0 ) {
		return {
			'dmin': 0.0,
			'dmin1': 0.0,
			'dmin2': 0.0,
			'dn': 0.0,
			'dnm1': 0.0,
			'dnm2': 0.0
		};
	}

	dthresh = eps * ( sigma + tau );
	if ( tau < dthresh * 0.5 ) {
		tau = 0.0;
	}

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

	if ( tau === 0.0 ) {
		// tau is zero (or was set to zero) — version that sets d's to zero if small enough
		j4 = ( 4 * i0 ) + pp - 3;
		emin = Z( j4 + 4 );
		d = Z( j4 ) - tau;
		dmin = d;
		dmin1 = -Z( j4 );

		if ( ieee ) {
			// Code for IEEE arithmetic...
			if ( pp === 0 ) {
				for ( j4 = 4 * i0; j4 <= 4 * ( n0 - 3 ); j4 += 4 ) {
					setZ( j4 - 2, d + Z( j4 - 1 ) );
					temp = Z( j4 + 1 ) / Z( j4 - 2 );
					d = ( d * temp ) - tau;
					if ( d < dthresh ) {
						d = 0.0;
					}
					dmin = Math.min( dmin, d );
					setZ( j4, Z( j4 - 1 ) * temp );
					emin = Math.min( Z( j4 ), emin );
				}
			} else {
				for ( j4 = 4 * i0; j4 <= 4 * ( n0 - 3 ); j4 += 4 ) {
					setZ( j4 - 3, d + Z( j4 ) );
					temp = Z( j4 + 2 ) / Z( j4 - 3 );
					d = ( d * temp ) - tau;
					if ( d < dthresh ) {
						d = 0.0;
					}
					dmin = Math.min( dmin, d );
					setZ( j4 - 1, Z( j4 ) * temp );
					emin = Math.min( Z( j4 - 1 ), emin );
				}
			}

			// Unroll last two steps...
			dnm2 = d;
			dmin2 = dmin;
			j4 = ( 4 * ( n0 - 2 ) ) - pp;
			j4p2 = j4 + ( 2 * pp ) - 1;
			setZ( j4 - 2, dnm2 + Z( j4p2 ) );
			setZ( j4, Z( j4p2 + 2 ) * ( Z( j4p2 ) / Z( j4 - 2 ) ) );
			dnm1 = ( Z( j4p2 + 2 ) * ( dnm2 / Z( j4 - 2 ) ) ) - tau;
			dmin = Math.min( dmin, dnm1 );

			dmin1 = dmin;
			j4 += 4;
			j4p2 = j4 + ( 2 * pp ) - 1;
			setZ( j4 - 2, dnm1 + Z( j4p2 ) );
			setZ( j4, Z( j4p2 + 2 ) * ( Z( j4p2 ) / Z( j4 - 2 ) ) );
			dn = ( Z( j4p2 + 2 ) * ( dnm1 / Z( j4 - 2 ) ) ) - tau;
			dmin = Math.min( dmin, dn );
		} else {
			// Code for non IEEE arithmetic...
			if ( pp === 0 ) {
				for ( j4 = 4 * i0; j4 <= 4 * ( n0 - 3 ); j4 += 4 ) {
					setZ( j4 - 2, d + Z( j4 - 1 ) );
					if ( d < 0.0 ) {
						return {
							'dmin': dmin,
							'dmin1': dmin1,
							'dmin2': 0.0,
							'dn': 0.0,
							'dnm1': 0.0,
							'dnm2': 0.0
						};
					}
					setZ( j4, Z( j4 + 1 ) * ( Z( j4 - 1 ) / Z( j4 - 2 ) ) );
					d = ( Z( j4 + 1 ) * ( d / Z( j4 - 2 ) ) ) - tau;
					if ( d < dthresh ) {
						d = 0.0;
					}
					dmin = Math.min( dmin, d );
					emin = Math.min( emin, Z( j4 ) );
				}
			} else {
				for ( j4 = 4 * i0; j4 <= 4 * ( n0 - 3 ); j4 += 4 ) {
					setZ( j4 - 3, d + Z( j4 ) );
					if ( d < 0.0 ) {
						return {
							'dmin': dmin,
							'dmin1': dmin1,
							'dmin2': 0.0,
							'dn': 0.0,
							'dnm1': 0.0,
							'dnm2': 0.0
						};
					}
					setZ( j4 - 1, Z( j4 + 2 ) * ( Z( j4 ) / Z( j4 - 3 ) ) );
					d = ( Z( j4 + 2 ) * ( d / Z( j4 - 3 ) ) ) - tau;
					if ( d < dthresh ) {
						d = 0.0;
					}
					dmin = Math.min( dmin, d );
					emin = Math.min( emin, Z( j4 - 1 ) );
				}
			}

			// Unroll last two steps...
			dnm2 = d;
			dmin2 = dmin;
			j4 = ( 4 * ( n0 - 2 ) ) - pp;
			j4p2 = j4 + ( 2 * pp ) - 1;
			setZ( j4 - 2, dnm2 + Z( j4p2 ) );
			if ( dnm2 < 0.0 ) {
				return {
					'dmin': dmin,
					'dmin1': dmin1,
					'dmin2': dmin2,
					'dn': 0.0,
					'dnm1': 0.0,
					'dnm2': dnm2
				};
			}
			setZ( j4, Z( j4p2 + 2 ) * ( Z( j4p2 ) / Z( j4 - 2 ) ) );
			dnm1 = ( Z( j4p2 + 2 ) * ( dnm2 / Z( j4 - 2 ) ) ) - tau;
			dmin = Math.min( dmin, dnm1 );

			dmin1 = dmin;
			j4 += 4;
			j4p2 = j4 + ( 2 * pp ) - 1;
			setZ( j4 - 2, dnm1 + Z( j4p2 ) );
			if ( dnm1 < 0.0 ) {
				return {
					'dmin': dmin,
					'dmin1': dmin1,
					'dmin2': dmin2,
					'dn': 0.0,
					'dnm1': dnm1,
					'dnm2': dnm2
				};
			}
			setZ( j4, Z( j4p2 + 2 ) * ( Z( j4p2 ) / Z( j4 - 2 ) ) );
			dn = ( Z( j4p2 + 2 ) * ( dnm1 / Z( j4 - 2 ) ) ) - tau;
			dmin = Math.min( dmin, dn );
		}
	} else {
		j4 = ( 4 * i0 ) + pp - 3;
		emin = Z( j4 + 4 );
		d = Z( j4 ) - tau;
		dmin = d;
		dmin1 = -Z( j4 );

		if ( ieee ) {
			// Code for IEEE arithmetic...
			if ( pp === 0 ) {
				for ( j4 = 4 * i0; j4 <= 4 * ( n0 - 3 ); j4 += 4 ) {
					setZ( j4 - 2, d + Z( j4 - 1 ) );
					temp = Z( j4 + 1 ) / Z( j4 - 2 );
					d = ( d * temp ) - tau;
					dmin = Math.min( dmin, d );
					setZ( j4, Z( j4 - 1 ) * temp );
					emin = Math.min( Z( j4 ), emin );
				}
			} else {
				for ( j4 = 4 * i0; j4 <= 4 * ( n0 - 3 ); j4 += 4 ) {
					setZ( j4 - 3, d + Z( j4 ) );
					temp = Z( j4 + 2 ) / Z( j4 - 3 );
					d = ( d * temp ) - tau;
					dmin = Math.min( dmin, d );
					setZ( j4 - 1, Z( j4 ) * temp );
					emin = Math.min( Z( j4 - 1 ), emin );
				}
			}

			// Unroll last two steps...
			dnm2 = d;
			dmin2 = dmin;
			j4 = ( 4 * ( n0 - 2 ) ) - pp;
			j4p2 = j4 + ( 2 * pp ) - 1;
			setZ( j4 - 2, dnm2 + Z( j4p2 ) );
			setZ( j4, Z( j4p2 + 2 ) * ( Z( j4p2 ) / Z( j4 - 2 ) ) );
			dnm1 = ( Z( j4p2 + 2 ) * ( dnm2 / Z( j4 - 2 ) ) ) - tau;
			dmin = Math.min( dmin, dnm1 );

			dmin1 = dmin;
			j4 += 4;
			j4p2 = j4 + ( 2 * pp ) - 1;
			setZ( j4 - 2, dnm1 + Z( j4p2 ) );
			setZ( j4, Z( j4p2 + 2 ) * ( Z( j4p2 ) / Z( j4 - 2 ) ) );
			dn = ( Z( j4p2 + 2 ) * ( dnm1 / Z( j4 - 2 ) ) ) - tau;
			dmin = Math.min( dmin, dn );
		} else {
			// Code for non IEEE arithmetic...
			if ( pp === 0 ) {
				for ( j4 = 4 * i0; j4 <= 4 * ( n0 - 3 ); j4 += 4 ) {
					setZ( j4 - 2, d + Z( j4 - 1 ) );
					if ( d < 0.0 ) {
						return {
							'dmin': dmin,
							'dmin1': dmin1,
							'dmin2': 0.0,
							'dn': 0.0,
							'dnm1': 0.0,
							'dnm2': 0.0
						};
					}
					setZ( j4, Z( j4 + 1 ) * ( Z( j4 - 1 ) / Z( j4 - 2 ) ) );
					d = ( Z( j4 + 1 ) * ( d / Z( j4 - 2 ) ) ) - tau;
					dmin = Math.min( dmin, d );
					emin = Math.min( emin, Z( j4 ) );
				}
			} else {
				for ( j4 = 4 * i0; j4 <= 4 * ( n0 - 3 ); j4 += 4 ) {
					setZ( j4 - 3, d + Z( j4 ) );
					if ( d < 0.0 ) {
						return {
							'dmin': dmin,
							'dmin1': dmin1,
							'dmin2': 0.0,
							'dn': 0.0,
							'dnm1': 0.0,
							'dnm2': 0.0
						};
					}
					setZ( j4 - 1, Z( j4 + 2 ) * ( Z( j4 ) / Z( j4 - 3 ) ) );
					d = ( Z( j4 + 2 ) * ( d / Z( j4 - 3 ) ) ) - tau;
					dmin = Math.min( dmin, d );
					emin = Math.min( emin, Z( j4 - 1 ) );
				}
			}

			// Unroll last two steps...
			dnm2 = d;
			dmin2 = dmin;
			j4 = ( 4 * ( n0 - 2 ) ) - pp;
			j4p2 = j4 + ( 2 * pp ) - 1;
			setZ( j4 - 2, dnm2 + Z( j4p2 ) );
			if ( dnm2 < 0.0 ) {
				return {
					'dmin': dmin,
					'dmin1': dmin1,
					'dmin2': dmin2,
					'dn': 0.0,
					'dnm1': 0.0,
					'dnm2': dnm2
				};
			}
			setZ( j4, Z( j4p2 + 2 ) * ( Z( j4p2 ) / Z( j4 - 2 ) ) );
			dnm1 = ( Z( j4p2 + 2 ) * ( dnm2 / Z( j4 - 2 ) ) ) - tau;
			dmin = Math.min( dmin, dnm1 );

			dmin1 = dmin;
			j4 += 4;
			j4p2 = j4 + ( 2 * pp ) - 1;
			setZ( j4 - 2, dnm1 + Z( j4p2 ) );
			if ( dnm1 < 0.0 ) {
				return {
					'dmin': dmin,
					'dmin1': dmin1,
					'dmin2': dmin2,
					'dn': 0.0,
					'dnm1': dnm1,
					'dnm2': dnm2
				};
			}
			setZ( j4, Z( j4p2 + 2 ) * ( Z( j4p2 ) / Z( j4 - 2 ) ) );
			dn = ( Z( j4p2 + 2 ) * ( dnm1 / Z( j4 - 2 ) ) ) - tau;
			dmin = Math.min( dmin, dn );
		}
	}

	setZ( j4 + 2, dn );
	setZ( (4 * n0) - pp, emin );

	return {
		'dmin': dmin,
		'dmin1': dmin1,
		'dmin2': dmin2,
		'dn': dn,
		'dnm1': dnm1,
		'dnm2': dnm2
	};
}


// EXPORTS //

export default dlasq5;
