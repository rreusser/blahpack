/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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

// VARIABLES //

var CNST1 = 0.5630;
var CNST2 = 1.010;
var CNST3 = 1.050;
var QURTR = 0.250;
var THIRD = 0.3330;
var HALF = 0.50;
var HUNDRD = 100.0;


// MAIN //

/**
* Computes an approximation TAU to the smallest eigenvalue using values of d.
* from the previous transform. Used by the dqds algorithm (bidiagonal SVD).
*
* @private
* @param {integer} i0 - first index (1-based)
* @param {integer} n0 - last index (1-based)
* @param {Float64Array} z - qd array
* @param {integer} stride - stride length for `z`
* @param {NonNegativeInteger} offset - starting index for `z`
* @param {integer} pp - ping-pong flag (0 or 1)
* @param {integer} n0in - value of n0 at start of eigtest
* @param {number} dmin - minimum value of d
* @param {number} dmin1 - minimum value of d, excluding d(n0)
* @param {number} dmin2 - minimum value of d, excluding d(n0) and d(n0-1)
* @param {number} dn - d(n0)
* @param {number} dn1 - d(n0-1)
* @param {number} dn2 - d(n0-2)
* @param {number} tau - (input, unused — kept for API compat)
* @param {integer} ttype - shift type from previous call
* @param {number} g - damping parameter preserved between calls
* @returns {Object} object with `tau` (shift), `ttype` (shift type), and `g` (updated damping)
*/
function dlasq4( i0, n0, z, stride, offset, pp, n0in, dmin, dmin1, dmin2, dn, dn1, dn2, tau, ttype, g ) {
	var tau0;
	var gap1;
	var gap2;
	var gam;
	var nn;
	var np;
	var i4;
	var a2;
	var b1;
	var b2;
	var s;

	// Save the input tau value for early returns (Fortran leaves TAU unchanged)
	tau0 = tau;

	/**
	* Access Z using 1-based Fortran index.
	*
	* @private
	* @param {integer} idx - 1-based index
	* @returns {number} array element
	*/
	function Z( idx ) {
		return z[ offset + (( idx - 1 ) * stride) ];
	}

	// A negative DMIN forces the shift to take that absolute value.
	// TTYPE records the type of shift.
	if ( dmin <= 0.0 ) {
		tau = -dmin;
		ttype = -1;
		return {
			'tau': tau,
			'ttype': ttype,
			'g': g
		};
	}

	nn = (4 * n0) + pp;

	if ( n0in === n0 ) {
		// No eigenvalues deflated.
		if ( dmin === dn || dmin === dn1 ) {
			b1 = Math.sqrt( Z( nn - 3 ) ) * Math.sqrt( Z( nn - 5 ) );
			b2 = Math.sqrt( Z( nn - 7 ) ) * Math.sqrt( Z( nn - 9 ) );
			a2 = Z( nn - 7 ) + Z( nn - 5 );

			// Cases 2 and 3.
			if ( dmin === dn && dmin1 === dn1 ) {
				gap2 = dmin2 - a2 - ( dmin2 * QURTR );
				if ( gap2 > 0.0 && gap2 > b2 ) {
					gap1 = a2 - dn - ( ( b2 / gap2 ) * b2 );
				} else {
					gap1 = a2 - dn - ( b1 + b2 );
				}
				if ( gap1 > 0.0 && gap1 > b1 ) {
					s = Math.max( dn - ( ( b1 / gap1 ) * b1 ), HALF * dmin );
					ttype = -2;
				} else {
					s = 0.0;
					if ( dn > b1 ) {
						s = dn - b1;
					}
					if ( a2 > ( b1 + b2 ) ) {
						s = Math.min( s, a2 - ( b1 + b2 ) );
					}
					s = Math.max( s, THIRD * dmin );
					ttype = -3;
				}
			} else {
				// Case 4.
				ttype = -4;
				s = QURTR * dmin;
				if ( dmin === dn ) {
					gam = dn;
					a2 = 0.0;
					if ( Z( nn - 5 ) > Z( nn - 7 ) ) {
						return {
							'tau': tau0,
							'ttype': ttype,
							'g': g
						};
					}
					b2 = Z( nn - 5 ) / Z( nn - 7 );
					np = nn - 9;
				} else {
					np = nn - (2 * pp);
					gam = dn1;
					if ( Z( np - 4 ) > Z( np - 2 ) ) {
						return {
							'tau': tau0,
							'ttype': ttype,
							'g': g
						};
					}
					a2 = Z( np - 4 ) / Z( np - 2 );
					if ( Z( nn - 9 ) > Z( nn - 11 ) ) {
						return {
							'tau': tau0,
							'ttype': ttype,
							'g': g
						};
					}
					b2 = Z( nn - 9 ) / Z( nn - 11 );
					np = nn - 13;
				}

				// Approximate contribution to norm squared from I < NN-1.
				a2 += b2;
				for ( i4 = np; i4 >= (4 * i0) - 1 + pp; i4 -= 4 ) {
					if ( b2 === 0.0 ) {
						break;
					}
					b1 = b2;
					if ( Z( i4 ) > Z( i4 - 2 ) ) {
						return {
							'tau': tau0,
							'ttype': ttype,
							'g': g
						};
					}
					b2 *= ( Z( i4 ) / Z( i4 - 2 ) );
					a2 += b2;
					if ( HUNDRD * Math.max( b2, b1 ) < a2 || CNST1 < a2 ) {
						break;
					}
				}
				a2 *= CNST3;

				// Rayleigh quotient residual bound.
				if ( a2 < CNST1 ) {
					s = gam * ( 1.0 - Math.sqrt( a2 ) ) / ( 1.0 + a2 );
				}
			}
		} else if ( dmin === dn2 ) {
			// Case 5.
			ttype = -5;
			s = QURTR * dmin;

			// Compute contribution to norm squared from I > NN-2.
			np = nn - (2 * pp);
			b1 = Z( np - 2 );
			b2 = Z( np - 6 );
			gam = dn2;
			if ( Z( np - 8 ) > b2 || Z( np - 4 ) > b1 ) {
				return {
					'tau': tau0,
					'ttype': ttype,
					'g': g
				};
			}
			a2 = ( Z( np - 8 ) / b2 ) * ( 1.0 + (Z( np - 4 ) / b1) );

			// Approximate contribution to norm squared from I < NN-2.
			if ( n0 - i0 > 2 ) {
				b2 = Z( nn - 13 ) / Z( nn - 15 );
				a2 += b2;
				for ( i4 = nn - 17; i4 >= (4 * i0) - 1 + pp; i4 -= 4 ) {
					if ( b2 === 0.0 ) {
						break;
					}
					b1 = b2;
					if ( Z( i4 ) > Z( i4 - 2 ) ) {
						return {
							'tau': tau0,
							'ttype': ttype,
							'g': g
						};
					}
					b2 *= ( Z( i4 ) / Z( i4 - 2 ) );
					a2 += b2;
					if ( HUNDRD * Math.max( b2, b1 ) < a2 || CNST1 < a2 ) {
						break;
					}
				}
				a2 *= CNST3;
			}

			if ( a2 < CNST1 ) {
				s = gam * ( 1.0 - Math.sqrt( a2 ) ) / ( 1.0 + a2 );
			}
		} else {
			// Case 6, no information to guide us.
			if ( ttype === -6 ) {
				g += THIRD * ( 1.0 - g );
			} else if ( ttype === -18 ) {
				g = QURTR * THIRD;
			} else {
				g = QURTR;
			}
			s = g * dmin;
			ttype = -6;
		}
	} else if ( n0in === n0 + 1 ) {
		// One eigenvalue just deflated. Use DMIN1, DN1 for DMIN and DN.
		if ( dmin1 === dn1 && dmin2 === dn2 ) {
			// Cases 7 and 8.
			ttype = -7;
			s = THIRD * dmin1;
			if ( Z( nn - 5 ) > Z( nn - 7 ) ) {
				return {
					'tau': tau0,
					'ttype': ttype,
					'g': g
				};
			}
			b1 = Z( nn - 5 ) / Z( nn - 7 );
			b2 = b1;
			if ( b2 !== 0.0 ) {
				for ( i4 = (4 * n0) - 9 + pp; i4 >= (4 * i0) - 1 + pp; i4 -= 4 ) {
					a2 = b1;
					if ( Z( i4 ) > Z( i4 - 2 ) ) {
						return {
							'tau': tau0,
							'ttype': ttype,
							'g': g
						};
					}
					b1 *= ( Z( i4 ) / Z( i4 - 2 ) );
					b2 += b1;
					if ( HUNDRD * Math.max( b1, a2 ) < b2 ) {
						break;
					}
				}
			}
			b2 = Math.sqrt( CNST3 * b2 );
			a2 = dmin1 / ( 1.0 + (b2 * b2) );
			gap2 = (HALF * dmin2) - a2;
			if ( gap2 > 0.0 && gap2 > b2 * a2 ) {
				s = Math.max( s, a2 * ( 1.0 - ((CNST2 * a2) * ( b2 / gap2 ) * b2) ) );
			} else {
				s = Math.max( s, a2 * ( 1.0 - (CNST2 * b2) ) );
				ttype = -8;
			}
		} else {
			// Case 9.
			s = QURTR * dmin1;
			if ( dmin1 === dn1 ) {
				s = HALF * dmin1;
			}
			ttype = -9;
		}
	} else if ( n0in === n0 + 2 ) {
		// Two eigenvalues deflated. Use DMIN2, DN2 for DMIN and DN.
		// Cases 10 and 11.
		if ( dmin2 === dn2 && 2.0 * Z( nn - 5 ) < Z( nn - 7 ) ) {
			ttype = -10;
			s = THIRD * dmin2;
			if ( Z( nn - 5 ) > Z( nn - 7 ) ) {
				return {
					'tau': tau0,
					'ttype': ttype,
					'g': g
				};
			}
			b1 = Z( nn - 5 ) / Z( nn - 7 );
			b2 = b1;
			if ( b2 !== 0.0 ) {
				for ( i4 = (4 * n0) - 9 + pp; i4 >= (4 * i0) - 1 + pp; i4 -= 4 ) {
					if ( Z( i4 ) > Z( i4 - 2 ) ) {
						return {
							'tau': tau0,
							'ttype': ttype,
							'g': g
						};
					}
					b1 *= ( Z( i4 ) / Z( i4 - 2 ) );
					b2 += b1;
					if ( HUNDRD * b1 < b2 ) {
						break;
					}
				}
			}
			b2 = Math.sqrt( CNST3 * b2 );
			a2 = dmin2 / ( 1.0 + (b2 * b2) );
			gap2 = Z( nn - 7 ) + Z( nn - 9 ) -
				(Math.sqrt( Z( nn - 11 ) ) * Math.sqrt( Z( nn - 9 ) )) - a2;
			if ( gap2 > 0.0 && gap2 > b2 * a2 ) {
				s = Math.max( s, a2 * ( 1.0 - ((CNST2 * a2) * ( b2 / gap2 ) * b2) ) );
			} else {
				s = Math.max( s, a2 * ( 1.0 - (CNST2 * b2) ) );
			}
		} else {
			s = QURTR * dmin2;
			ttype = -11;
		}
	} else if ( n0in > n0 + 2 ) {
		// Case 12, more than two eigenvalues deflated. No information.
		s = 0.0;
		ttype = -12;
	}

	tau = s;
	return {
		'tau': tau,
		'ttype': ttype,
		'g': g
	};
}


// EXPORTS //

export default dlasq4;
