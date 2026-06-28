/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

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

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';


// VARIABLES //

var MAXIT = 40;

// Machine parameters (hoisted to module scope):
var EPS = 1.1102230246251565e-16; // DLAMCH('Epsilon') = Number.EPSILON / 2

// Scaling constants derived from DLAMCH('SafMin')=2.2250738585072014e-308 and DLAMCH('Base')=2:
var SMALL1 = 4.464794497196387e-103;
var SMINV1 = 2.2397447421778042e+102;
var SMALL2 = 1.9934389902195135e-205;
var SMINV2 = 5.016456510113119e+204;


// MAIN //

/**
* Computes the positive or negative root (closest to the origin) of the secular equation.
*
* The secular equation is:
*
* ```text
* f(x) = rho + z[0]/(d[0]-x) + z[1]/(d[1]-x) + z[2]/(d[2]-x)
* ```
*
* If `orgati` is true, the root is between `d[1]` and `d[2]`; otherwise it is between `d[0]` and `d[1]`.
*
* Uses a Gragg-Thornton-Warner cubic convergent scheme for stability.
*
* @private
* @param {integer} kniter - iteration count hint from dlaed4
* @param {boolean} orgati - if true, root is between `d[1]` and `d[2]`; otherwise between `d[0]` and `d[1]`
* @param {number} rho - scalar in the secular equation
* @param {Float64Array} d - input array of length 3 containing the original eigenvalues (must satisfy `d[0] < d[1] < d[2]`)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} z - input array of length 3 containing the updating vector components (must be positive)
* @param {integer} strideZ - stride length for `z`
* @param {NonNegativeInteger} offsetZ - starting index for `z`
* @param {number} finit - value of f at 0
* @param {Float64Array} tau - output array of length 1; `tau[0]` receives the computed root
* @returns {integer} info - 0 on success, 1 if convergence fails
*/
function dlaed6( kniter, orgati, rho, d, strideD, offsetD, z, strideZ, offsetZ, finit, tau ) {
	var erretm;
	var dscale;
	var zscale;
	var sclfac;
	var sclinv;
	var scale;
	var temp1;
	var temp2;
	var temp3;
	var temp4;
	var niter;
	var temp;
	var iter;
	var info;
	var lbd;
	var ubd;
	var eta;
	var ddf;
	var fc;
	var df;
	var id;
	var iz;
	var a;
	var b;
	var c;
	var f;
	var i;

	info = 0;

	id = offsetD;
	iz = offsetZ;

	if ( orgati ) {
		lbd = d[ id + strideD ];
		ubd = d[ id + ( 2 * strideD ) ];
	} else {
		lbd = d[ id ];
		ubd = d[ id + strideD ];
	}
	if ( finit < 0.0 ) {
		lbd = 0.0;
	} else {
		ubd = 0.0;
	}

	niter = 1;
	tau[ 0 ] = 0.0;
	if ( kniter === 2 ) {
		if ( orgati ) {
			temp = ( d[ id + ( 2 * strideD ) ] - d[ id + strideD ] ) / 2.0;
			c = rho + ( z[ iz ] / ( ( d[ id ] - d[ id + strideD ] ) - temp ) );
			a = ( c * ( d[ id + strideD ] + d[ id + ( 2 * strideD ) ] ) ) + z[ iz + strideZ ] + z[ iz + ( 2 * strideZ ) ];
			b = ( c * d[ id + strideD ] * d[ id + ( 2 * strideD ) ] ) + ( z[ iz + strideZ ] * d[ id + ( 2 * strideD ) ] ) + ( z[ iz + ( 2 * strideZ ) ] * d[ id + strideD ] );
		} else {
			temp = ( d[ id ] - d[ id + strideD ] ) / 2.0;
			c = rho + ( z[ iz + ( 2 * strideZ ) ] / ( ( d[ id + ( 2 * strideD ) ] - d[ id + strideD ] ) - temp ) );
			a = ( c * ( d[ id ] + d[ id + strideD ] ) ) + z[ iz ] + z[ iz + strideZ ];
			b = ( c * d[ id ] * d[ id + strideD ] ) + ( z[ iz ] * d[ id + strideD ] ) + ( z[ iz + strideZ ] * d[ id ] );
		}
		temp = Math.max( Math.abs( a ), Math.abs( b ), Math.abs( c ) );
		a /= temp;
		b /= temp;
		c /= temp;
		if ( c === 0.0 ) {
			tau[ 0 ] = b / a;
		} else if ( a <= 0.0 ) {
			tau[ 0 ] = ( a - Math.sqrt( Math.abs( ( a * a ) - ( 4.0 * b * c ) ) ) ) / ( 2.0 * c );
		} else {
			tau[ 0 ] = ( 2.0 * b ) / ( a + Math.sqrt( Math.abs( ( a * a ) - ( 4.0 * b * c ) ) ) );
		}
		if ( tau[ 0 ] < lbd || tau[ 0 ] > ubd ) {
			tau[ 0 ] = ( lbd + ubd ) / 2.0;
		}
		if ( d[ id ] === tau[ 0 ] || d[ id + strideD ] === tau[ 0 ] || d[ id + ( 2 * strideD ) ] === tau[ 0 ] ) {
			tau[ 0 ] = 0.0;
		} else {
			temp = finit + ( tau[ 0 ] * z[ iz ] / ( d[ id ] * ( d[ id ] - tau[ 0 ] ) ) ) +
				( tau[ 0 ] * z[ iz + strideZ ] / ( d[ id + strideD ] * ( d[ id + strideD ] - tau[ 0 ] ) ) ) +
				( tau[ 0 ] * z[ iz + ( 2 * strideZ ) ] / ( d[ id + ( 2 * strideD ) ] * ( d[ id + ( 2 * strideD ) ] - tau[ 0 ] ) ) );
			if ( temp <= 0.0 ) {
				lbd = tau[ 0 ];
			} else {
				ubd = tau[ 0 ];
			}
			if ( Math.abs( finit ) <= Math.abs( temp ) ) {
				tau[ 0 ] = 0.0;
			}
		}
	}

	// Determine if scaling of inputs is necessary to avoid overflow when computing 1/TEMP^3:
	dscale = new Float64Array( 3 );
	zscale = new Float64Array( 3 );

	if ( orgati ) {
		temp = Math.min( Math.abs( d[ id + strideD ] - tau[ 0 ] ), Math.abs( d[ id + ( 2 * strideD ) ] - tau[ 0 ] ) );
	} else {
		temp = Math.min( Math.abs( d[ id ] - tau[ 0 ] ), Math.abs( d[ id + strideD ] - tau[ 0 ] ) );
	}
	scale = false;
	if ( temp <= SMALL1 ) {
		scale = true;
		if ( temp <= SMALL2 ) {
			// Scale up by power of radix nearest 1/SAFMIN^(2/3)
			sclfac = SMINV2;
			sclinv = SMALL2;
		} else {
			// Scale up by power of radix nearest 1/SAFMIN^(1/3)
			sclfac = SMINV1;
			sclinv = SMALL1;
		}

		// Scaling up safe because D, Z, TAU scaled elsewhere to be O(1)
		for ( i = 0; i < 3; i += 1 ) {
			dscale[ i ] = d[ id + ( i * strideD ) ] * sclfac;
			zscale[ i ] = z[ iz + ( i * strideZ ) ] * sclfac;
		}
		tau[ 0 ] *= sclfac;
		lbd *= sclfac;
		ubd *= sclfac;
	} else {
		// Copy D and Z to DSCALE and ZSCALE
		for ( i = 0; i < 3; i += 1 ) {
			dscale[ i ] = d[ id + ( i * strideD ) ];
			zscale[ i ] = z[ iz + ( i * strideZ ) ];
		}
	}

	fc = 0.0;
	df = 0.0;
	ddf = 0.0;
	for ( i = 0; i < 3; i += 1 ) {
		temp = 1.0 / ( dscale[ i ] - tau[ 0 ] );
		temp1 = zscale[ i ] * temp;
		temp2 = temp1 * temp;
		temp3 = temp2 * temp;
		fc += temp1 / dscale[ i ];
		df += temp2;
		ddf += temp3;
	}
	f = finit + ( tau[ 0 ] * fc );

	// NOTE: This branch requires f=0 exactly before iteration. Accept as uncovered.
	if ( Math.abs( f ) <= 0.0 ) {
		// Undo scaling
		if ( scale ) {
			tau[ 0 ] *= sclinv;
		}
		return info;
	}
	if ( f <= 0.0 ) {
		lbd = tau[ 0 ];
	} else {
		ubd = tau[ 0 ];
	}

	// Iteration begins -- Use Gragg-Thornton-Warner cubic convergent scheme
	iter = niter + 1;

	for ( niter = iter; niter <= MAXIT; niter += 1 ) {
		if ( orgati ) {
			temp1 = dscale[ 1 ] - tau[ 0 ];
			temp2 = dscale[ 2 ] - tau[ 0 ];
		} else {
			temp1 = dscale[ 0 ] - tau[ 0 ];
			temp2 = dscale[ 1 ] - tau[ 0 ];
		}
		a = ( ( temp1 + temp2 ) * f ) - ( temp1 * temp2 * df );
		b = temp1 * temp2 * f;
		c = f - ( ( temp1 + temp2 ) * df ) + ( temp1 * temp2 * ddf );
		temp = Math.max( Math.abs( a ), Math.abs( b ), Math.abs( c ) );
		a /= temp;
		b /= temp;
		c /= temp;
		if ( c === 0.0 ) {
			eta = b / a;
		} else if ( a <= 0.0 ) {
			eta = ( a - Math.sqrt( Math.abs( ( a * a ) - ( 4.0 * b * c ) ) ) ) / ( 2.0 * c );
		} else {
			eta = ( 2.0 * b ) / ( a + Math.sqrt( Math.abs( ( a * a ) - ( 4.0 * b * c ) ) ) );
		}
		if ( f * eta >= 0.0 ) {
			eta = -f / df;
		}

		tau[ 0 ] += eta;
		if ( tau[ 0 ] < lbd || tau[ 0 ] > ubd ) {
			tau[ 0 ] = ( lbd + ubd ) / 2.0;
		}

		fc = 0.0;
		erretm = 0.0;
		df = 0.0;
		ddf = 0.0;
		for ( i = 0; i < 3; i += 1 ) {
			if ( ( dscale[ i ] - tau[ 0 ] ) === 0.0 ) {
				// Exact hit on a pole — converged
				if ( scale ) {
					tau[ 0 ] *= sclinv;
				}
				return info;
			}
			temp = 1.0 / ( dscale[ i ] - tau[ 0 ] );
			temp1 = zscale[ i ] * temp;
			temp2 = temp1 * temp;
			temp3 = temp2 * temp;
			temp4 = temp1 / dscale[ i ];
			fc += temp4;
			erretm += Math.abs( temp4 );
			df += temp2;
			ddf += temp3;
		}
		f = finit + ( tau[ 0 ] * fc );
		erretm = ( 8.0 * ( Math.abs( finit ) + ( Math.abs( tau[ 0 ] ) * erretm ) ) ) +
			( Math.abs( tau[ 0 ] ) * df );
		if ( ( Math.abs( f ) <= 4.0 * EPS * erretm ) ||
			( ( ubd - lbd ) <= 4.0 * EPS * Math.abs( tau[ 0 ] ) ) ) {
			// Undo scaling
			if ( scale ) {
				tau[ 0 ] *= sclinv;
			}
			return info;
		}
		if ( f <= 0.0 ) {
			lbd = tau[ 0 ];
		} else {
			ubd = tau[ 0 ];
		}
	}
	// NOTE: Convergence failure path (info=1) requires 40 iterations without
	// convergence, which needs pathological inputs. Accept as uncovered.
	info = 1;

	// Undo scaling
	if ( scale ) {
		tau[ 0 ] *= sclinv;
	}
	return info;
}


// EXPORTS //

export default dlaed6;
