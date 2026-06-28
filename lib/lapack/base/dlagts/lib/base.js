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

/* eslint-disable max-len, max-params, no-var, max-lines */

// MODULES //

import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'Epsilon' );
var SFMIN = dlamch( 'Safe minimum' );
var BIGNUM = 1.0 / SFMIN;


// MAIN //

/**
* Solves the system (T - lambda_I)_x = y or (T - lambda_I)__T_x = y using.
* the LU factorization computed by dlagtf.
*
* @private
* @param {integer} job - 1: solve (T-lambda*I)x=y, no perturbation;
*                        -1: same with perturbation; 2: solve transpose, no perturbation;
*                        -2: transpose with perturbation
* @param {NonNegativeInteger} N - order of the matrix T
* @param {Float64Array} a - diagonal of U from dlagtf, length N
* @param {integer} strideA - stride for a
* @param {NonNegativeInteger} offsetA - offset for a
* @param {Float64Array} b - first super-diagonal of U from dlagtf, length N-1
* @param {integer} strideB - stride for b
* @param {NonNegativeInteger} offsetB - offset for b
* @param {Float64Array} c - sub-diagonal of L from dlagtf, length N-1
* @param {integer} strideC - stride for c
* @param {NonNegativeInteger} offsetC - offset for c
* @param {Float64Array} d - second super-diagonal of U from dlagtf, length N-2
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - offset for d
* @param {Int32Array} IN - pivot info from dlagtf, length N
* @param {integer} strideIN - stride for IN
* @param {NonNegativeInteger} offsetIN - offset for IN
* @param {Float64Array} y - right-hand side (overwritten with solution), length N
* @param {integer} strideY - stride for y
* @param {NonNegativeInteger} offsetY - offset for y
* @param {number} tol - perturbation tolerance (used when job < 0)
* @returns {integer} info: 0 = success, >0 = overflow at element k
*/
function dlagts( job, N, a, strideA, offsetA, b, strideB, offsetB, c, strideC, offsetC, d, strideD, offsetD, IN, strideIN, offsetIN, y, strideY, offsetY, tol ) { // eslint-disable-line max-len, max-params
	var absak;
	var pert;
	var temp;
	var ak;
	var k;

	if ( Math.abs( job ) > 2 || job === 0 ) {
		return -1;
	}
	if ( N < 0 ) {
		return -2;
	}
	if ( N === 0 ) {
		return 0;
	}

	// When job < 0, compute tol if not positive
	if ( job < 0 ) {
		if ( tol <= 0.0 ) {
			tol = Math.abs( a[ offsetA ] );
			if ( N > 1 ) {
				tol = Math.max( tol, Math.abs( a[ offsetA + strideA ] ), Math.abs( b[ offsetB ] ) );
			}
			for ( k = 2; k < N; k++ ) {
				tol = Math.max( tol, Math.abs( a[ offsetA + k * strideA ] ), Math.abs( b[ offsetB + ( k - 1 ) * strideB ] ), Math.abs( d[ offsetD + ( k - 2 ) * strideD ] ) );
			}
			tol *= EPS;
			if ( tol === 0.0 ) {
				tol = EPS;
			}
		}
	}

	if ( Math.abs( job ) === 1 ) {
		// Forward sweep: apply permutation and L
		for ( k = 1; k < N; k++ ) {
			if ( IN[ offsetIN + ( k - 1 ) * strideIN ] === 0 ) {
				y[ offsetY + k * strideY ] -= c[ offsetC + ( k - 1 ) * strideC ] * y[ offsetY + ( k - 1 ) * strideY ];
			} else {
				temp = y[ offsetY + ( k - 1 ) * strideY ];
				y[ offsetY + ( k - 1 ) * strideY ] = y[ offsetY + k * strideY ];
				y[ offsetY + k * strideY ] = temp - c[ offsetC + ( k - 1 ) * strideC ] * y[ offsetY + k * strideY ];
			}
		}

		if ( job === 1 ) {
			// Back substitution without perturbation
			for ( k = N - 1; k >= 0; k-- ) {
				if ( k <= N - 3 ) {
					temp = y[ offsetY + k * strideY ] - b[ offsetB + k * strideB ] * y[ offsetY + ( k + 1 ) * strideY ] - d[ offsetD + k * strideD ] * y[ offsetY + ( k + 2 ) * strideY ];
				} else if ( k === N - 2 ) {
					temp = y[ offsetY + k * strideY ] - b[ offsetB + k * strideB ] * y[ offsetY + ( k + 1 ) * strideY ];
				} else {
					temp = y[ offsetY + k * strideY ];
				}
				ak = a[ offsetA + k * strideA ];
				absak = Math.abs( ak );
				if ( absak < 1.0 ) {
					if ( absak < SFMIN ) {
						if ( absak === 0.0 || Math.abs( temp ) * SFMIN > absak ) {
							return k + 1; // 1-based
						}
						temp *= BIGNUM;
						ak *= BIGNUM;
					} else if ( Math.abs( temp ) > absak * BIGNUM ) {
						return k + 1; // 1-based
					}
				}
				y[ offsetY + k * strideY ] = temp / ak;
			}
		} else {
			// Back substitution with perturbation (job === -1)
			for ( k = N - 1; k >= 0; k-- ) {
				if ( k <= N - 3 ) {
					temp = y[ offsetY + k * strideY ] - b[ offsetB + k * strideB ] * y[ offsetY + ( k + 1 ) * strideY ] - d[ offsetD + k * strideD ] * y[ offsetY + ( k + 2 ) * strideY ];
				} else if ( k === N - 2 ) {
					temp = y[ offsetY + k * strideY ] - b[ offsetB + k * strideB ] * y[ offsetY + ( k + 1 ) * strideY ];
				} else {
					temp = y[ offsetY + k * strideY ];
				}
				ak = a[ offsetA + k * strideA ];
				pert = Math.abs( tol ) * ( ( ak >= 0.0 ) ? 1.0 : -1.0 ); // SIGN(TOL, AK)
				while ( true ) { // eslint-disable-line no-constant-condition
					absak = Math.abs( ak );
					if ( absak < 1.0 ) {
						if ( absak < SFMIN ) {
							if ( absak === 0.0 || Math.abs( temp ) * SFMIN > absak ) {
								ak += pert;
								pert *= 2.0;
								continue;
							}
							temp *= BIGNUM;
							ak *= BIGNUM;
						} else if ( Math.abs( temp ) > absak * BIGNUM ) {
							ak += pert;
							pert *= 2.0;
							continue;
						}
					}
					break;
				}
				y[ offsetY + k * strideY ] = temp / ak;
			}
		}
	} else {
		// JOB = 2 or -2: solve transpose system

		if ( job === 2 ) {
			// Forward substitution without perturbation
			for ( k = 0; k < N; k++ ) {
				if ( k >= 2 ) {
					temp = y[ offsetY + k * strideY ] - b[ offsetB + ( k - 1 ) * strideB ] * y[ offsetY + ( k - 1 ) * strideY ] - d[ offsetD + ( k - 2 ) * strideD ] * y[ offsetY + ( k - 2 ) * strideY ];
				} else if ( k === 1 ) {
					temp = y[ offsetY + k * strideY ] - b[ offsetB + ( k - 1 ) * strideB ] * y[ offsetY + ( k - 1 ) * strideY ];
				} else {
					temp = y[ offsetY + k * strideY ];
				}
				ak = a[ offsetA + k * strideA ];
				absak = Math.abs( ak );
				if ( absak < 1.0 ) {
					if ( absak < SFMIN ) {
						if ( absak === 0.0 || Math.abs( temp ) * SFMIN > absak ) {
							return k + 1; // 1-based
						}
						temp *= BIGNUM;
						ak *= BIGNUM;
					} else if ( Math.abs( temp ) > absak * BIGNUM ) {
						return k + 1; // 1-based
					}
				}
				y[ offsetY + k * strideY ] = temp / ak;
			}
		} else {
			// Forward substitution with perturbation (job === -2)
			for ( k = 0; k < N; k++ ) {
				if ( k >= 2 ) {
					temp = y[ offsetY + k * strideY ] - b[ offsetB + ( k - 1 ) * strideB ] * y[ offsetY + ( k - 1 ) * strideY ] - d[ offsetD + ( k - 2 ) * strideD ] * y[ offsetY + ( k - 2 ) * strideY ];
				} else if ( k === 1 ) {
					temp = y[ offsetY + k * strideY ] - b[ offsetB + ( k - 1 ) * strideB ] * y[ offsetY + ( k - 1 ) * strideY ];
				} else {
					temp = y[ offsetY + k * strideY ];
				}
				ak = a[ offsetA + k * strideA ];
				pert = Math.abs( tol ) * ( ( ak >= 0.0 ) ? 1.0 : -1.0 ); // SIGN(TOL, AK)
				while ( true ) { // eslint-disable-line no-constant-condition
					absak = Math.abs( ak );
					if ( absak < 1.0 ) {
						if ( absak < SFMIN ) {
							if ( absak === 0.0 || Math.abs( temp ) * SFMIN > absak ) {
								ak += pert;
								pert *= 2.0;
								continue;
							}
							temp *= BIGNUM;
							ak *= BIGNUM;
						} else if ( Math.abs( temp ) > absak * BIGNUM ) {
							ak += pert;
							pert *= 2.0;
							continue;
						}
					}
					break;
				}
				y[ offsetY + k * strideY ] = temp / ak;
			}
		}

		// Back sweep: apply L^T P^T
		for ( k = N - 1; k >= 1; k-- ) {
			if ( IN[ offsetIN + ( k - 1 ) * strideIN ] === 0 ) {
				y[ offsetY + ( k - 1 ) * strideY ] -= c[ offsetC + ( k - 1 ) * strideC ] * y[ offsetY + k * strideY ];
			} else {
				temp = y[ offsetY + ( k - 1 ) * strideY ];
				y[ offsetY + ( k - 1 ) * strideY ] = y[ offsetY + k * strideY ];
				y[ offsetY + k * strideY ] = temp - c[ offsetC + ( k - 1 ) * strideC ] * y[ offsetY + k * strideY ];
			}
		}
	}

	return 0;
}


// EXPORTS //

export default dlagts;
