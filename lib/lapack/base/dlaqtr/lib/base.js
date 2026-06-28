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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, max-lines, no-var */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dasum from './../../../../blas/base/dasum/lib/base.js';
import daxpy from './../../../../blas/base/daxpy/lib/base.js';
import ddot from './../../../../blas/base/ddot/lib/base.js';
import dscal from './../../../../blas/base/dscal/lib/base.js';
import idamax from './../../../../blas/base/idamax/lib/base.js';
import dladiv from './../../dladiv/lib/base.js';
import dlaln2 from './../../dlaln2/lib/base.js';
import dlamch from './../../dlamch/lib/base.js';
import dlange from './../../dlange/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;

var EPS = dlamch( 'precision' );
var SMLNUM = dlamch( 'safe-minimum' ) / EPS;
var BIGNUM = ONE / SMLNUM;

// Scratch arrays for dladiv output and dlaln2 D/V buffers
var DIVOUT = new Float64Array( 2 );
var D = new Float64Array( 4 );
var V = new Float64Array( 4 );
var DUM = new Float64Array( 1 );


// MAIN //

/**
* Solves a real quasi-triangular system of equations, or a complex.
* quasi-triangular system of special form, in real arithmetic.
*
* Solves `op(T)*p = scale*c` (if lreal = true), or
* `op(T + i*B) * (p + i*q) = scale * (c + i*d)` (if lreal = false),
* where T is upper quasi-triangular. When lreal = false, the first
* diagonal block of T must be 1-by-1, and B has the special structure
* described in the LAPACK documentation. Designed for condition number
* estimation in DTRSNA.
*
* @private
* @param {boolean} ltran - if true, solve the transposed system
* @param {boolean} lreal - if true, purely real system; else complex
* @param {NonNegativeInteger} N - order of T (and of T+i*B)
* @param {Float64Array} T - Schur canonical form matrix
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} b - vector forming the top row of B
* @param {integer} strideB - stride length for `b`
* @param {NonNegativeInteger} offsetB - starting index for `b`
* @param {number} w - diagonal element of B (unused if lreal = true)
* @param {Float64Array} x - right-hand side on entry, solution on exit (length 2*N for complex, N for real)
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} WORK - workspace of length N
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {Object} result with properties: info (0=success, 1=1x1 perturbed, 2=2x2 perturbed), scale
*/
function dlaqtr( ltran, lreal, N, T, strideT1, strideT2, offsetT, b, strideB, offsetB, w, x, strideX, offsetX, WORK, strideWork, offsetWork ) {
	var notran;
	var scaloc;
	var scale;
	var xnorm;
	var sminw;
	var jnext;
	var info;
	var smin;
	var xmax;
	var ierr;
	var tjj;
	var tmp;
	var rec;
	var ln2;
	var n1;
	var n2;
	var j1;
	var j2;
	var xj;
	var k;
	var j;
	var i;
	var z;

	notran = !ltran;
	info = 0;

	if ( N === 0 ) {
		return {
			'info': 0,
			'scale': ONE
		};
	}

	// Compute ||T||_max, and if complex also include |w| and ||b||_max
	xnorm = dlange( 'max', N, N, T, strideT1, strideT2, offsetT, DUM, 1, 0 );
	if ( !lreal ) {
		ln2 = ZERO;
		for ( i = 0; i < N; i++ ) {
			ln2 = Math.max( ln2, Math.abs( b[ offsetB + ( i * strideB ) ] ) );
		}
		xnorm = Math.max( xnorm, Math.abs( w ), ln2 );
	}
	smin = Math.max( SMLNUM, EPS * xnorm );

	// WORK(j) = sum of |T(1:j-1, j)|; plus |B(i)| if complex.
	WORK[ offsetWork ] = ZERO;
	for ( j = 2; j <= N; j++ ) {
		WORK[ offsetWork + ( ( j - 1 ) * strideWork ) ] = dasum( j - 1, T, strideT1, offsetT + ( ( j - 1 ) * strideT2 ) );
	}
	if ( !lreal ) {
		for ( i = 2; i <= N; i++ ) {
			WORK[ offsetWork + ( ( i - 1 ) * strideWork ) ] += Math.abs( b[ offsetB + ( ( i - 1 ) * strideB ) ] );
		}
	}

	n2 = 2 * N;
	n1 = N;
	if ( !lreal ) {
		n1 = n2;
	}

	k = idamax( n1, x, strideX, offsetX );
	xmax = Math.abs( x[ offsetX + ( k * strideX ) ] );
	scale = ONE;

	if ( xmax > BIGNUM ) {
		scale = BIGNUM / xmax;
		dscal( n1, scale, x, strideX, offsetX );
		xmax = BIGNUM;
	}

	if ( lreal ) {
		if ( notran ) {
			// Solve T*p = scale*c
			jnext = N;
			for ( j = N; j >= 1; j-- ) {
				if ( j > jnext ) {
					continue;
				}
				j1 = j;
				j2 = j;
				jnext = j - 1;
				if ( j > 1 ) {
					if ( T[ offsetT + ( ( j - 1 ) * strideT1 ) + ( ( j - 2 ) * strideT2 ) ] !== ZERO ) {
						j1 = j - 1;
						jnext = j - 2;
					}
				}

				if ( j1 === j2 ) {
					// 1-by-1 diagonal block
					xj = Math.abs( x[ offsetX + ( ( j1 - 1 ) * strideX ) ] );
					tjj = Math.abs( T[ offsetT + ( ( j1 - 1 ) * strideT1 ) + ( ( j1 - 1 ) * strideT2 ) ] );
					tmp = T[ offsetT + ( ( j1 - 1 ) * strideT1 ) + ( ( j1 - 1 ) * strideT2 ) ];
					if ( tjj < smin ) {
						tmp = smin;
						tjj = smin;
						info = 1;
					}
					if ( xj === ZERO ) {
						continue;
					}
					if ( tjj < ONE ) {
						if ( xj > BIGNUM * tjj ) {
							rec = ONE / xj;
							dscal( N, rec, x, strideX, offsetX );
							scale *= rec;
							xmax *= rec;
						}
					}
					x[ offsetX + ( ( j1 - 1 ) * strideX ) ] /= tmp;
					xj = Math.abs( x[ offsetX + ( ( j1 - 1 ) * strideX ) ] );

					if ( xj > ONE ) {
						rec = ONE / xj;
						if ( WORK[ offsetWork + ( ( j1 - 1 ) * strideWork ) ] > ( BIGNUM - xmax ) * rec ) {
							dscal( N, rec, x, strideX, offsetX );
							scale *= rec;
						}
					}
					if ( j1 > 1 ) {
						daxpy( j1 - 1, -x[ offsetX + ( ( j1 - 1 ) * strideX ) ], T, strideT1, offsetT + ( ( j1 - 1 ) * strideT2 ), x, strideX, offsetX );
						k = idamax( j1 - 1, x, strideX, offsetX );
						xmax = Math.abs( x[ offsetX + ( k * strideX ) ] );
					}
				} else {
					// 2-by-2 diagonal block
					D[ 0 ] = x[ offsetX + ( ( j1 - 1 ) * strideX ) ];
					D[ 1 ] = x[ offsetX + ( ( j2 - 1 ) * strideX ) ];
					ierr = dlaln2( false, 2, 1, smin, ONE, T, strideT1, strideT2, offsetT + ( ( j1 - 1 ) * strideT1 ) + ( ( j1 - 1 ) * strideT2 ), ONE, ONE, D, 1, 2, 0, ZERO, ZERO, V, 1, 2, 0 );
					scaloc = ierr.scale;
					if ( ierr.info !== 0 ) {
						info = 2;
					}
					if ( scaloc !== ONE ) {
						dscal( N, scaloc, x, strideX, offsetX );
						scale *= scaloc;
					}
					x[ offsetX + ( ( j1 - 1 ) * strideX ) ] = V[ 0 ];
					x[ offsetX + ( ( j2 - 1 ) * strideX ) ] = V[ 1 ];

					xj = Math.max( Math.abs( V[ 0 ] ), Math.abs( V[ 1 ] ) );
					if ( xj > ONE ) {
						rec = ONE / xj;
						if ( Math.max( WORK[ offsetWork + ( ( j1 - 1 ) * strideWork ) ], WORK[ offsetWork + ( ( j2 - 1 ) * strideWork ) ] ) > ( BIGNUM - xmax ) * rec ) {
							dscal( N, rec, x, strideX, offsetX );
							scale *= rec;
						}
					}
					if ( j1 > 1 ) {
						daxpy( j1 - 1, -x[ offsetX + ( ( j1 - 1 ) * strideX ) ], T, strideT1, offsetT + ( ( j1 - 1 ) * strideT2 ), x, strideX, offsetX );
						daxpy( j1 - 1, -x[ offsetX + ( ( j2 - 1 ) * strideX ) ], T, strideT1, offsetT + ( ( j2 - 1 ) * strideT2 ), x, strideX, offsetX );
						k = idamax( j1 - 1, x, strideX, offsetX );
						xmax = Math.abs( x[ offsetX + ( k * strideX ) ] );
					}
				}
			}
		} else {
			// Solve T^T * p = scale*c
			jnext = 1;
			for ( j = 1; j <= N; j++ ) {
				if ( j < jnext ) {
					continue;
				}
				j1 = j;
				j2 = j;
				jnext = j + 1;
				if ( j < N ) {
					if ( T[ offsetT + ( j * strideT1 ) + ( ( j - 1 ) * strideT2 ) ] !== ZERO ) {
						j2 = j + 1;
						jnext = j + 2;
					}
				}

				if ( j1 === j2 ) {
					xj = Math.abs( x[ offsetX + ( ( j1 - 1 ) * strideX ) ] );
					if ( xmax > ONE ) {
						rec = ONE / xmax;
						if ( WORK[ offsetWork + ( ( j1 - 1 ) * strideWork ) ] > ( BIGNUM - xj ) * rec ) {
							dscal( N, rec, x, strideX, offsetX );
							scale *= rec;
							xmax *= rec;
						}
					}

					x[ offsetX + ( ( j1 - 1 ) * strideX ) ] -= ddot( j1 - 1, T, strideT1, offsetT + ( ( j1 - 1 ) * strideT2 ), x, strideX, offsetX );

					xj = Math.abs( x[ offsetX + ( ( j1 - 1 ) * strideX ) ] );
					tjj = Math.abs( T[ offsetT + ( ( j1 - 1 ) * strideT1 ) + ( ( j1 - 1 ) * strideT2 ) ] );
					tmp = T[ offsetT + ( ( j1 - 1 ) * strideT1 ) + ( ( j1 - 1 ) * strideT2 ) ];
					if ( tjj < smin ) {
						tmp = smin;
						tjj = smin;
						info = 1;
					}
					if ( tjj < ONE ) {
						if ( xj > BIGNUM * tjj ) {
							rec = ONE / xj;
							dscal( N, rec, x, strideX, offsetX );
							scale *= rec;
							xmax *= rec;
						}
					}
					x[ offsetX + ( ( j1 - 1 ) * strideX ) ] /= tmp;
					xmax = Math.max( xmax, Math.abs( x[ offsetX + ( ( j1 - 1 ) * strideX ) ] ) );
				} else {
					xj = Math.max( Math.abs( x[ offsetX + ( ( j1 - 1 ) * strideX ) ] ), Math.abs( x[ offsetX + ( ( j2 - 1 ) * strideX ) ] ) );
					if ( xmax > ONE ) {
						rec = ONE / xmax;
						if ( Math.max( WORK[ offsetWork + ( ( j2 - 1 ) * strideWork ) ], WORK[ offsetWork + ( ( j1 - 1 ) * strideWork ) ] ) > ( BIGNUM - xj ) * rec ) {
							dscal( N, rec, x, strideX, offsetX );
							scale *= rec;
							xmax *= rec;
						}
					}

					D[ 0 ] = x[ offsetX + ( ( j1 - 1 ) * strideX ) ] - ddot( j1 - 1, T, strideT1, offsetT + ( ( j1 - 1 ) * strideT2 ), x, strideX, offsetX );
					D[ 1 ] = x[ offsetX + ( ( j2 - 1 ) * strideX ) ] - ddot( j1 - 1, T, strideT1, offsetT + ( ( j2 - 1 ) * strideT2 ), x, strideX, offsetX );

					ierr = dlaln2( true, 2, 1, smin, ONE, T, strideT1, strideT2, offsetT + ( ( j1 - 1 ) * strideT1 ) + ( ( j1 - 1 ) * strideT2 ), ONE, ONE, D, 1, 2, 0, ZERO, ZERO, V, 1, 2, 0 );
					scaloc = ierr.scale;
					if ( ierr.info !== 0 ) {
						info = 2;
					}
					if ( scaloc !== ONE ) {
						dscal( N, scaloc, x, strideX, offsetX );
						scale *= scaloc;
					}
					x[ offsetX + ( ( j1 - 1 ) * strideX ) ] = V[ 0 ];
					x[ offsetX + ( ( j2 - 1 ) * strideX ) ] = V[ 1 ];
					xmax = Math.max( Math.abs( x[ offsetX + ( ( j1 - 1 ) * strideX ) ] ), Math.abs( x[ offsetX + ( ( j2 - 1 ) * strideX ) ] ), xmax );
				}
			}
		}
	} else {
		// Complex case
		sminw = Math.max( EPS * Math.abs( w ), smin );
		if ( notran ) {
			// Solve (T + i*B) * (p + i*q) = c + i*d
			jnext = N;
			for ( j = N; j >= 1; j-- ) {
				if ( j > jnext ) {
					continue;
				}
				j1 = j;
				j2 = j;
				jnext = j - 1;
				if ( j > 1 ) {
					if ( T[ offsetT + ( ( j - 1 ) * strideT1 ) + ( ( j - 2 ) * strideT2 ) ] !== ZERO ) {
						j1 = j - 1;
						jnext = j - 2;
					}
				}

				if ( j1 === j2 ) {
					z = w;
					if ( j1 === 1 ) {
						z = b[ offsetB ];
					}
					xj = Math.abs( x[ offsetX + ( ( j1 - 1 ) * strideX ) ] ) + Math.abs( x[ offsetX + ( ( N + j1 - 1 ) * strideX ) ] );
					tjj = Math.abs( T[ offsetT + ( ( j1 - 1 ) * strideT1 ) + ( ( j1 - 1 ) * strideT2 ) ] ) + Math.abs( z );
					tmp = T[ offsetT + ( ( j1 - 1 ) * strideT1 ) + ( ( j1 - 1 ) * strideT2 ) ];
					if ( tjj < sminw ) {
						tmp = sminw;
						tjj = sminw;
						info = 1;
					}
					if ( xj === ZERO ) {
						continue;
					}
					if ( tjj < ONE ) {
						if ( xj > BIGNUM * tjj ) {
							rec = ONE / xj;
							dscal( n2, rec, x, strideX, offsetX );
							scale *= rec;
							xmax *= rec;
						}
					}
					dladiv( x[ offsetX + ( ( j1 - 1 ) * strideX ) ], x[ offsetX + ( ( N + j1 - 1 ) * strideX ) ], tmp, z, DIVOUT );
					x[ offsetX + ( ( j1 - 1 ) * strideX ) ] = DIVOUT[ 0 ];
					x[ offsetX + ( ( N + j1 - 1 ) * strideX ) ] = DIVOUT[ 1 ];
					xj = Math.abs( x[ offsetX + ( ( j1 - 1 ) * strideX ) ] ) + Math.abs( x[ offsetX + ( ( N + j1 - 1 ) * strideX ) ] );

					if ( xj > ONE ) {
						rec = ONE / xj;
						if ( WORK[ offsetWork + ( ( j1 - 1 ) * strideWork ) ] > ( BIGNUM - xmax ) * rec ) {
							dscal( n2, rec, x, strideX, offsetX );
							scale *= rec;
						}
					}

					if ( j1 > 1 ) {
						daxpy( j1 - 1, -x[ offsetX + ( ( j1 - 1 ) * strideX ) ], T, strideT1, offsetT + ( ( j1 - 1 ) * strideT2 ), x, strideX, offsetX );
						daxpy( j1 - 1, -x[ offsetX + ( ( N + j1 - 1 ) * strideX ) ], T, strideT1, offsetT + ( ( j1 - 1 ) * strideT2 ), x, strideX, offsetX + ( N * strideX ) );

						x[ offsetX ] += b[ offsetB + ( ( j1 - 1 ) * strideB ) ] * x[ offsetX + ( ( N + j1 - 1 ) * strideX ) ];
						x[ offsetX + ( N * strideX ) ] -= b[ offsetB + ( ( j1 - 1 ) * strideB ) ] * x[ offsetX + ( ( j1 - 1 ) * strideX ) ];

						xmax = ZERO;
						for ( k = 1; k <= j1 - 1; k++ ) {
							xmax = Math.max( xmax, Math.abs( x[ offsetX + ( ( k - 1 ) * strideX ) ] ) + Math.abs( x[ offsetX + ( ( k + N - 1 ) * strideX ) ] ) );
						}
					}
				} else {
					D[ 0 ] = x[ offsetX + ( ( j1 - 1 ) * strideX ) ];
					D[ 1 ] = x[ offsetX + ( ( j2 - 1 ) * strideX ) ];
					D[ 2 ] = x[ offsetX + ( ( N + j1 - 1 ) * strideX ) ];
					D[ 3 ] = x[ offsetX + ( ( N + j2 - 1 ) * strideX ) ];
					ierr = dlaln2( false, 2, 2, sminw, ONE, T, strideT1, strideT2, offsetT + ( ( j1 - 1 ) * strideT1 ) + ( ( j1 - 1 ) * strideT2 ), ONE, ONE, D, 1, 2, 0, ZERO, -w, V, 1, 2, 0 );
					scaloc = ierr.scale;
					if ( ierr.info !== 0 ) {
						info = 2;
					}
					if ( scaloc !== ONE ) {
						dscal( 2 * N, scaloc, x, strideX, offsetX );
						scale *= scaloc;
					}
					x[ offsetX + ( ( j1 - 1 ) * strideX ) ] = V[ 0 ];
					x[ offsetX + ( ( j2 - 1 ) * strideX ) ] = V[ 1 ];
					x[ offsetX + ( ( N + j1 - 1 ) * strideX ) ] = V[ 2 ];
					x[ offsetX + ( ( N + j2 - 1 ) * strideX ) ] = V[ 3 ];

					xj = Math.max( Math.abs( V[ 0 ] ) + Math.abs( V[ 2 ] ), Math.abs( V[ 1 ] ) + Math.abs( V[ 3 ] ) );
					if ( xj > ONE ) {
						rec = ONE / xj;
						if ( Math.max( WORK[ offsetWork + ( ( j1 - 1 ) * strideWork ) ], WORK[ offsetWork + ( ( j2 - 1 ) * strideWork ) ] ) > ( BIGNUM - xmax ) * rec ) {
							dscal( n2, rec, x, strideX, offsetX );
							scale *= rec;
						}
					}

					if ( j1 > 1 ) {
						daxpy( j1 - 1, -x[ offsetX + ( ( j1 - 1 ) * strideX ) ], T, strideT1, offsetT + ( ( j1 - 1 ) * strideT2 ), x, strideX, offsetX );
						daxpy( j1 - 1, -x[ offsetX + ( ( j2 - 1 ) * strideX ) ], T, strideT1, offsetT + ( ( j2 - 1 ) * strideT2 ), x, strideX, offsetX );

						daxpy( j1 - 1, -x[ offsetX + ( ( N + j1 - 1 ) * strideX ) ], T, strideT1, offsetT + ( ( j1 - 1 ) * strideT2 ), x, strideX, offsetX + ( N * strideX ) );
						daxpy( j1 - 1, -x[ offsetX + ( ( N + j2 - 1 ) * strideX ) ], T, strideT1, offsetT + ( ( j2 - 1 ) * strideT2 ), x, strideX, offsetX + ( N * strideX ) );

						x[ offsetX ] += ( b[ offsetB + ( ( j1 - 1 ) * strideB ) ] * x[ offsetX + ( ( N + j1 - 1 ) * strideX ) ] ) + ( b[ offsetB + ( ( j2 - 1 ) * strideB ) ] * x[ offsetX + ( ( N + j2 - 1 ) * strideX ) ] );
						x[ offsetX + ( N * strideX ) ] -= ( b[ offsetB + ( ( j1 - 1 ) * strideB ) ] * x[ offsetX + ( ( j1 - 1 ) * strideX ) ] ) + ( b[ offsetB + ( ( j2 - 1 ) * strideB ) ] * x[ offsetX + ( ( j2 - 1 ) * strideX ) ] );

						xmax = ZERO;
						for ( k = 1; k <= j1 - 1; k++ ) {
							xmax = Math.max( Math.abs( x[ offsetX + ( ( k - 1 ) * strideX ) ] ) + Math.abs( x[ offsetX + ( ( k + N - 1 ) * strideX ) ] ), xmax );
						}
					}
				}
			}
		} else {
			// Solve (T + i*B)^T * (p + i*q) = c + i*d
			jnext = 1;
			for ( j = 1; j <= N; j++ ) {
				if ( j < jnext ) {
					continue;
				}
				j1 = j;
				j2 = j;
				jnext = j + 1;
				if ( j < N ) {
					if ( T[ offsetT + ( j * strideT1 ) + ( ( j - 1 ) * strideT2 ) ] !== ZERO ) {
						j2 = j + 1;
						jnext = j + 2;
					}
				}

				if ( j1 === j2 ) {
					xj = Math.abs( x[ offsetX + ( ( j1 - 1 ) * strideX ) ] ) + Math.abs( x[ offsetX + ( ( j1 + N - 1 ) * strideX ) ] );
					if ( xmax > ONE ) {
						rec = ONE / xmax;
						if ( WORK[ offsetWork + ( ( j1 - 1 ) * strideWork ) ] > ( BIGNUM - xj ) * rec ) {
							dscal( n2, rec, x, strideX, offsetX );
							scale *= rec;
							xmax *= rec;
						}
					}

					x[ offsetX + ( ( j1 - 1 ) * strideX ) ] -= ddot( j1 - 1, T, strideT1, offsetT + ( ( j1 - 1 ) * strideT2 ), x, strideX, offsetX );
					x[ offsetX + ( ( N + j1 - 1 ) * strideX ) ] -= ddot( j1 - 1, T, strideT1, offsetT + ( ( j1 - 1 ) * strideT2 ), x, strideX, offsetX + ( N * strideX ) );
					if ( j1 > 1 ) {
						x[ offsetX + ( ( j1 - 1 ) * strideX ) ] -= b[ offsetB + ( ( j1 - 1 ) * strideB ) ] * x[ offsetX + ( N * strideX ) ];
						x[ offsetX + ( ( N + j1 - 1 ) * strideX ) ] += b[ offsetB + ( ( j1 - 1 ) * strideB ) ] * x[ offsetX ];
					}
					xj = Math.abs( x[ offsetX + ( ( j1 - 1 ) * strideX ) ] ) + Math.abs( x[ offsetX + ( ( j1 + N - 1 ) * strideX ) ] );

					z = w;
					if ( j1 === 1 ) {
						z = b[ offsetB ];
					}

					tjj = Math.abs( T[ offsetT + ( ( j1 - 1 ) * strideT1 ) + ( ( j1 - 1 ) * strideT2 ) ] ) + Math.abs( z );
					tmp = T[ offsetT + ( ( j1 - 1 ) * strideT1 ) + ( ( j1 - 1 ) * strideT2 ) ];
					if ( tjj < sminw ) {
						tmp = sminw;
						tjj = sminw;
						info = 1;
					}
					if ( tjj < ONE ) {
						if ( xj > BIGNUM * tjj ) {
							rec = ONE / xj;
							dscal( n2, rec, x, strideX, offsetX );
							scale *= rec;
							xmax *= rec;
						}
					}
					dladiv( x[ offsetX + ( ( j1 - 1 ) * strideX ) ], x[ offsetX + ( ( N + j1 - 1 ) * strideX ) ], tmp, -z, DIVOUT );
					x[ offsetX + ( ( j1 - 1 ) * strideX ) ] = DIVOUT[ 0 ];
					x[ offsetX + ( ( j1 + N - 1 ) * strideX ) ] = DIVOUT[ 1 ];
					xmax = Math.max( Math.abs( x[ offsetX + ( ( j1 - 1 ) * strideX ) ] ) + Math.abs( x[ offsetX + ( ( j1 + N - 1 ) * strideX ) ] ), xmax );
				} else {
					xj = Math.max( Math.abs( x[ offsetX + ( ( j1 - 1 ) * strideX ) ] ) + Math.abs( x[ offsetX + ( ( N + j1 - 1 ) * strideX ) ] ), Math.abs( x[ offsetX + ( ( j2 - 1 ) * strideX ) ] ) + Math.abs( x[ offsetX + ( ( N + j2 - 1 ) * strideX ) ] ) );
					if ( xmax > ONE ) {
						rec = ONE / xmax;
						if ( Math.max( WORK[ offsetWork + ( ( j1 - 1 ) * strideWork ) ], WORK[ offsetWork + ( ( j2 - 1 ) * strideWork ) ] ) > ( BIGNUM - xj ) / xmax ) {
							dscal( n2, rec, x, strideX, offsetX );
							scale *= rec;
							xmax *= rec;
						}
					}

					D[ 0 ] = x[ offsetX + ( ( j1 - 1 ) * strideX ) ] - ddot( j1 - 1, T, strideT1, offsetT + ( ( j1 - 1 ) * strideT2 ), x, strideX, offsetX );
					D[ 1 ] = x[ offsetX + ( ( j2 - 1 ) * strideX ) ] - ddot( j1 - 1, T, strideT1, offsetT + ( ( j2 - 1 ) * strideT2 ), x, strideX, offsetX );
					D[ 2 ] = x[ offsetX + ( ( N + j1 - 1 ) * strideX ) ] - ddot( j1 - 1, T, strideT1, offsetT + ( ( j1 - 1 ) * strideT2 ), x, strideX, offsetX + ( N * strideX ) );
					D[ 3 ] = x[ offsetX + ( ( N + j2 - 1 ) * strideX ) ] - ddot( j1 - 1, T, strideT1, offsetT + ( ( j2 - 1 ) * strideT2 ), x, strideX, offsetX + ( N * strideX ) );
					D[ 0 ] -= b[ offsetB + ( ( j1 - 1 ) * strideB ) ] * x[ offsetX + ( N * strideX ) ];
					D[ 1 ] -= b[ offsetB + ( ( j2 - 1 ) * strideB ) ] * x[ offsetX + ( N * strideX ) ];
					D[ 2 ] += b[ offsetB + ( ( j1 - 1 ) * strideB ) ] * x[ offsetX ];
					D[ 3 ] += b[ offsetB + ( ( j2 - 1 ) * strideB ) ] * x[ offsetX ];

					ierr = dlaln2( true, 2, 2, sminw, ONE, T, strideT1, strideT2, offsetT + ( ( j1 - 1 ) * strideT1 ) + ( ( j1 - 1 ) * strideT2 ), ONE, ONE, D, 1, 2, 0, ZERO, w, V, 1, 2, 0 );
					scaloc = ierr.scale;
					if ( ierr.info !== 0 ) {
						info = 2;
					}
					if ( scaloc !== ONE ) {
						dscal( n2, scaloc, x, strideX, offsetX );
						scale *= scaloc;
					}
					x[ offsetX + ( ( j1 - 1 ) * strideX ) ] = V[ 0 ];
					x[ offsetX + ( ( j2 - 1 ) * strideX ) ] = V[ 1 ];
					x[ offsetX + ( ( N + j1 - 1 ) * strideX ) ] = V[ 2 ];
					x[ offsetX + ( ( N + j2 - 1 ) * strideX ) ] = V[ 3 ];
					xmax = Math.max( Math.abs( x[ offsetX + ( ( j1 - 1 ) * strideX ) ] ) + Math.abs( x[ offsetX + ( ( N + j1 - 1 ) * strideX ) ] ), Math.abs( x[ offsetX + ( ( j2 - 1 ) * strideX ) ] ) + Math.abs( x[ offsetX + ( ( N + j2 - 1 ) * strideX ) ] ), xmax );
				}
			}
		}
	}

	return {
		'info': info,
		'scale': scale
	};
}


// EXPORTS //

export default dlaqtr;
