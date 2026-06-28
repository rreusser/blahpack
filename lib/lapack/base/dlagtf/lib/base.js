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

/* eslint-disable max-len, max-params, no-var */

// MODULES //

import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'Epsilon' );


// MAIN //

/**
* Computes an LU factorization of the matrix (T - lambda_I), where T is an.
_ n-by-n tridiagonal matrix and lambda is a scalar, as T - lambda_I = PLU.
*
* P is a permutation matrix, L is a unit lower tridiagonal matrix with at most
* one non-zero sub-diagonal element per column, and U is an upper triangular
* matrix with at most two non-zero super-diagonal elements per column.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix T
* @param {Float64Array} a - diagonal elements (overwritten with U diagonal), length N
* @param {integer} strideA - stride for a
* @param {NonNegativeInteger} offsetA - offset for a
* @param {number} lambda - scalar lambda
* @param {Float64Array} b - super-diagonal elements (overwritten with U super-diagonal), length N-1
* @param {integer} strideB - stride for b
* @param {NonNegativeInteger} offsetB - offset for b
* @param {Float64Array} c - sub-diagonal elements (overwritten with L sub-diagonal), length N-1
* @param {integer} strideC - stride for c
* @param {NonNegativeInteger} offsetC - offset for c
* @param {number} tol - relative tolerance for near-singularity detection
* @param {Float64Array} d - second super-diagonal of U, length N-2
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - offset for d
* @param {Int32Array} IN - pivot/info array, length N
* @param {integer} strideIN - stride for IN
* @param {NonNegativeInteger} offsetIN - offset for IN
* @returns {integer} info: 0 = success, <0 = illegal argument
*/
function dlagtf( N, a, strideA, offsetA, lambda, b, strideB, offsetB, c, strideC, offsetC, tol, d, strideD, offsetD, IN, strideIN, offsetIN ) { // eslint-disable-line max-len, max-params
	var scale1;
	var scale2;
	var mult;
	var piv1;
	var piv2;
	var temp;
	var tl;
	var pa;
	var pb;
	var pc;
	var pd;
	var pi;
	var k;

	if ( N < 0 ) {
		return -1;
	}
	if ( N === 0 ) {
		return 0;
	}

	a[ offsetA ] -= lambda;
	IN[ offsetIN + ( N - 1 ) * strideIN ] = 0;

	if ( N === 1 ) {
		if ( a[ offsetA ] === 0.0 ) {
			IN[ offsetIN ] = 1;
		}
		return 0;
	}

	tl = Math.max( tol, EPS );

	// Pointers for k=0
	pa = offsetA;
	pb = offsetB;
	pc = offsetC;
	pd = offsetD;
	pi = offsetIN;

	scale1 = Math.abs( a[ pa ] ) + Math.abs( b[ pb ] );

	for ( k = 0; k < N - 1; k++ ) {
		a[ pa + strideA ] -= lambda;
		scale2 = Math.abs( c[ pc ] ) + Math.abs( a[ pa + strideA ] );
		if ( k < N - 2 ) {
			scale2 += Math.abs( b[ pb + strideB ] );
		}
		if ( a[ pa ] === 0.0 ) {
			piv1 = 0.0;
		} else {
			piv1 = Math.abs( a[ pa ] ) / scale1;
		}
		if ( c[ pc ] === 0.0 ) {
			IN[ pi ] = 0;
			piv2 = 0.0;
			scale1 = scale2;
			if ( k < N - 2 ) {
				d[ pd ] = 0.0;
			}
		} else {
			piv2 = Math.abs( c[ pc ] ) / scale2;
			if ( piv2 <= piv1 ) {
				IN[ pi ] = 0;
				scale1 = scale2;
				c[ pc ] = c[ pc ] / a[ pa ];
				a[ pa + strideA ] -= c[ pc ] * b[ pb ];
				if ( k < N - 2 ) {
					d[ pd ] = 0.0;
				}
			} else {
				IN[ pi ] = 1;
				mult = a[ pa ] / c[ pc ];
				a[ pa ] = c[ pc ];
				temp = a[ pa + strideA ];
				a[ pa + strideA ] = b[ pb ] - mult * temp;
				if ( k < N - 2 ) {
					d[ pd ] = b[ pb + strideB ];
					b[ pb + strideB ] = -mult * d[ pd ];
				}
				b[ pb ] = temp;
				c[ pc ] = mult;
			}
		}
		if ( Math.max( piv1, piv2 ) <= tl && IN[ offsetIN + ( N - 1 ) * strideIN ] === 0 ) {
			IN[ offsetIN + ( N - 1 ) * strideIN ] = k + 1; // 1-based index
		}

		pa += strideA;
		pb += strideB;
		pc += strideC;
		if ( k < N - 2 ) {
			pd += strideD;
		}
		pi += strideIN;
	}
	if ( Math.abs( a[ pa ] ) <= scale1 * tl && IN[ offsetIN + ( N - 1 ) * strideIN ] === 0 ) {
		IN[ offsetIN + ( N - 1 ) * strideIN ] = N; // 1-based
	}

	return 0;
}


// EXPORTS //

export default dlagtf;
