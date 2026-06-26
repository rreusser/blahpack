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

/* eslint-disable max-len, max-params, max-depth, max-statements, no-mixed-operators, max-lines-per-function */

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dzasum from '../../../../blas/base/dzasum/lib/base.js';
import idamax from '../../../../blas/base/idamax/lib/base.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zaxpy from '../../../../blas/base/zaxpy/lib/base.js';
import zdotc from '../../../../blas/base/zdotc/lib/base.js';
import zdotu from '../../../../blas/base/zdotu/lib/base.js';
import ztrsv from '../../../../blas/base/ztrsv/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import zladiv from '../../zladiv/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var HALF = 0.5;
var ONE = 1.0;
var TWO = 2.0;

// Machine constants
var SMLNUM = dlamch( 'safe-minimum' ) / dlamch( 'epsilon' );
var BIGNUM = ONE / SMLNUM;
var RMAX = dlamch( 'overflow' );

// Scratch Complex128Array buffers for zladiv calls:
var ZLADIV_X = new Complex128Array( 1 );
var ZLADIV_Y = new Complex128Array( 1 );
var ZLADIV_OUT = new Complex128Array( 1 );
var ZLADIV_Xv = reinterpret( ZLADIV_X, 0 );
var ZLADIV_Yv = reinterpret( ZLADIV_Y, 0 );
var ZLADIV_OUTv = reinterpret( ZLADIV_OUT, 0 );


// FUNCTIONS //

/**
* CABS1: |re(z)| + |im(z)|.
*
* @private
* @param {Float64Array} v - Float64 view
* @param {integer} idx - index of real part
* @returns {number} CABS1 value
*/
function cabs1( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}

/**
* CABS2: |re(z)/2| + |im(z)/2| (avoids overflow).
*
* @private
* @param {Float64Array} v - Float64 view
* @param {integer} idx - index of real part
* @returns {number} CABS2 value
*/
function cabs2( v, idx ) {
	return Math.abs( v[ idx ] * HALF ) + Math.abs( v[ idx + 1 ] * HALF );
}

/**
* Helper to compute the off-diagonal sum for transpose/conjugate-transpose cases.
*
* @private
*/
function computeTransposeSum( av, xv, oA, ox, sa1, sa2, sx, j, N, uscalRe, uscalIm, tscal, upper, conjugate, A, x, strideA1, strideA2, offsetA, strideX, offsetX, out ) {
	var csumjR = ZERO;
	var csumjI = ZERO;
	var dotResult;
	var ar;
	var ai;
	var xr;
	var xi;
	var ur;
	var ui;
	var i;

	if ( uscalRe === ONE && uscalIm === ZERO ) {
		// Use BLAS dot product
		if ( conjugate ) {
			if ( upper ) {
				if ( j > 0 ) {
					dotResult = zdotc( j, A, strideA1, offsetA + j * strideA2, x, strideX, offsetX );
					csumjR = real( dotResult );
					csumjI = imag( dotResult );
				}
			} else if ( j < N - 1 ) {
				dotResult = zdotc( N - j - 1, A, strideA1, offsetA + ( j + 1 ) * strideA1 + j * strideA2, x, strideX, offsetX + ( j + 1 ) * strideX );
				csumjR = real( dotResult );
				csumjI = imag( dotResult );
			}
		} else if ( upper ) {
			if ( j > 0 ) {
				dotResult = zdotu( j, A, strideA1, offsetA + j * strideA2, x, strideX, offsetX );
				csumjR = real( dotResult );
				csumjI = imag( dotResult );
			}
		} else if ( j < N - 1 ) {
			dotResult = zdotu( N - j - 1, A, strideA1, offsetA + ( j + 1 ) * strideA1 + j * strideA2, x, strideX, offsetX + ( j + 1 ) * strideX );
			csumjR = real( dotResult );
			csumjI = imag( dotResult );
		}
	} else {
		// Scale each term individually
		if ( upper ) {
			for ( i = 0; i < j; i++ ) {
				ar = av[ oA + i * sa1 + j * sa2 ];
				ai = ( conjugate ) ? -av[ oA + i * sa1 + j * sa2 + 1 ] : av[ oA + i * sa1 + j * sa2 + 1 ];

				// (A_ij * uscal) * x(i)
				ur = ar * uscalRe - ai * uscalIm;
				ui = ar * uscalIm + ai * uscalRe;
				xr = xv[ ox + i * sx ];
				xi = xv[ ox + i * sx + 1 ];
				csumjR += ur * xr - ui * xi;
				csumjI += ur * xi + ui * xr;
			}
		} else if ( j < N - 1 ) {
			for ( i = j + 1; i < N; i++ ) {
				ar = av[ oA + i * sa1 + j * sa2 ];
				ai = ( conjugate ) ? -av[ oA + i * sa1 + j * sa2 + 1 ] : av[ oA + i * sa1 + j * sa2 + 1 ];
				ur = ar * uscalRe - ai * uscalIm;
				ui = ar * uscalIm + ai * uscalRe;
				xr = xv[ ox + i * sx ];
				xi = xv[ ox + i * sx + 1 ];
				csumjR += ur * xr - ui * xi;
				csumjI += ur * xi + ui * xr;
			}
		}
	}

	out[ 0 ] = csumjR;
	out[ 1 ] = csumjI;
	return out;
}


// MAIN //

/**
* Solves a complex triangular system with scaling to prevent overflow.
*
* Solves one of:
*   A_x = s_b   (trans = 'N')
*   A^T_x = s_b (trans = 'T')
*   A^H_x = s_b (trans = 'C')
*
* where A is an N-by-N complex triangular matrix, x and b are N-vectors,
* and s is a real scaling factor chosen to prevent overflow.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {string} normin - `'yes'` if CNORM contains column norms on input, `'no'` to compute them
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - N-by-N triangular matrix
* @param {integer} strideA1 - first dimension stride of A (complex elements)
* @param {integer} strideA2 - second dimension stride of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} x - in/out right-hand side vector of length N
* @param {integer} strideX - stride for x (complex elements)
* @param {NonNegativeInteger} offsetX - starting index for x (complex elements)
* @param {Float64Array} scale - output: scale[0] is the scale factor s
* @param {Float64Array} CNORM - in/out column norm array of length N
* @param {integer} strideCNORM - stride for CNORM
* @param {NonNegativeInteger} offsetCNORM - starting index for CNORM
* @returns {integer} info - 0 if successful
*/
function zlatrs( uplo, trans, diag, normin, N, A, strideA1, strideA2, offsetA, x, strideX, offsetX, scale, CNORM, strideCNORM, offsetCNORM ) {
	var notran;
	var nounit;
	var jfirst;
	var upper;
	var tscal;
	var jlast;
	var xbnd;
	var xmax;
	var grow;
	var tmax;
	var imax;
	var jinc;
	var csumj;
	var tjjs_re;
	var tjjs_im;
	var uscal_re;
	var uscal_im;
	var rec;
	var tjj;
	var xj;
	var sa1;
	var sa2;
	var oA;
	var sc;
	var av;
	var xv;
	var sx;
	var ox;
	var jr;
	var ji;
	var j;
	var i;

	sa1 = strideA1 * 2; // Float64 strides
	sa2 = strideA2 * 2;
	oA = offsetA * 2;
	sc = strideCNORM;

	upper = ( uplo === 'upper' );
	notran = ( trans === 'no-transpose' );
	nounit = ( diag === 'non-unit' );

	scale[ 0 ] = ONE;
	if ( N === 0 ) {
		return 0;
	}

	av = reinterpret( A, 0 );
	xv = reinterpret( x, 0 );
	sx = strideX * 2;
	ox = offsetX * 2;
	csumj = [ ZERO, ZERO ];

	// Compute column norms if not provided
	if ( normin === 'no' ) {
		if ( upper ) {
			for ( j = 0; j < N; j++ ) {
				CNORM[ offsetCNORM + j * sc ] = dzasum( j, A, strideA1, offsetA + j * strideA2 );
			}
		} else {
			for ( j = 0; j < N - 1; j++ ) {
				CNORM[ offsetCNORM + j * sc ] = dzasum( N - j - 1, A, strideA1, offsetA + ( j + 1 ) * strideA1 + j * strideA2 );
			}
			CNORM[ offsetCNORM + ( N - 1 ) * sc ] = ZERO;
		}
	}

	// Scale CNORM if overflow would occur
	imax = idamax( N, CNORM, sc, offsetCNORM );
	tmax = CNORM[ offsetCNORM + imax * sc ];
	if ( tmax <= BIGNUM * HALF ) {
		tscal = ONE;
	} else if ( tmax <= RMAX ) {
		tscal = HALF / ( SMLNUM * tmax );
		dscal( N, tscal, CNORM, sc, offsetCNORM );
	} else {
		// Overflow even in CNORM — try element-wise recompute
		tmax = ZERO;
		if ( upper ) {
			for ( j = 1; j < N; j++ ) {
				for ( i = 0; i < j; i++ ) {
					tmax = Math.max( tmax, Math.abs( av[ oA + i * sa1 + j * sa2 ] ), Math.abs( av[ oA + i * sa1 + j * sa2 + 1 ] ) );
				}
			}
		} else {
			for ( j = 0; j < N - 1; j++ ) {
				for ( i = j + 1; i < N; i++ ) {
					tmax = Math.max( tmax, Math.abs( av[ oA + i * sa1 + j * sa2 ] ), Math.abs( av[ oA + i * sa1 + j * sa2 + 1 ] ) );
				}
			}
		}

		if ( tmax <= RMAX ) {
			tscal = ONE / ( SMLNUM * tmax );
			for ( j = 0; j < N; j++ ) {
				if ( CNORM[ offsetCNORM + j * sc ] <= RMAX ) {
					CNORM[ offsetCNORM + j * sc ] *= tscal;
				} else {
					// Recompute from scratch
					var newTscal = TWO * tscal; // eslint-disable-line no-var
					CNORM[ offsetCNORM + j * sc ] = ZERO;
					if ( upper ) {
						for ( i = 0; i < j; i++ ) {
							CNORM[ offsetCNORM + j * sc ] += newTscal * cabs2( av, oA + i * sa1 + j * sa2 );
						}
					} else {
						for ( i = j + 1; i < N; i++ ) {
							CNORM[ offsetCNORM + j * sc ] += newTscal * cabs2( av, oA + i * sa1 + j * sa2 );
						}
					}
				}
			}
		} else {
			// tmax too large, just do plain ztrsv
			ztrsv( uplo, trans, diag, N, A, strideA1, strideA2, offsetA, x, strideX, offsetX );
			return 0;
		}
	}

	// Find max |x_j|
	xmax = ZERO;
	for ( j = 0; j < N; j++ ) {
		xmax = Math.max( xmax, cabs2( xv, ox + j * sx ) );
	}
	xbnd = xmax;

	if ( notran ) {
		// No transpose
		if ( upper ) {
			jfirst = N - 1;
			jlast = -1;
			jinc = -1;
		} else {
			jfirst = 0;
			jlast = N;
			jinc = 1;
		}

		if ( tscal !== ONE ) {
			grow = ZERO;
		} else if ( nounit ) {
			grow = HALF / Math.max( xbnd, SMLNUM );
			xbnd = grow;
			for ( j = jfirst; j !== jlast; j += jinc ) {
				if ( grow <= SMLNUM ) {
					break;
				}
				tjj = cabs1( av, oA + j * sa1 + j * sa2 );
				xbnd = Math.min( xbnd, Math.min( ONE, tjj ) * grow );
				if ( tjj + CNORM[ offsetCNORM + j * sc ] >= SMLNUM ) {
					grow *= ( tjj / ( tjj + CNORM[ offsetCNORM + j * sc ] ) );
				} else {
					grow = ZERO;
				}
			}
			grow = xbnd;
		} else {
			grow = Math.min( ONE, HALF / Math.max( xbnd, SMLNUM ) );
			for ( j = jfirst; j !== jlast; j += jinc ) {
				if ( grow <= SMLNUM ) {
					break;
				}
				grow *= ( ONE / ( ONE + CNORM[ offsetCNORM + j * sc ] ) );
			}
		}
	} else {
		// Transpose or conjugate transpose
		if ( upper ) {
			jfirst = 0;
			jlast = N;
			jinc = 1;
		} else {
			jfirst = N - 1;
			jlast = -1;
			jinc = -1;
		}

		if ( tscal !== ONE ) {
			grow = ZERO;
		} else if ( nounit ) {
			grow = HALF / Math.max( xbnd, SMLNUM );
			xbnd = grow;
			for ( j = jfirst; j !== jlast; j += jinc ) {
				if ( grow <= SMLNUM ) {
					break;
				}
				xj = ONE + CNORM[ offsetCNORM + j * sc ];
				grow = Math.min( grow, xbnd / xj );
				tjj = cabs1( av, oA + j * sa1 + j * sa2 );
				if ( xj > tjj ) {
					xbnd *= ( tjj / xj );
				}
			}
			grow = Math.min( grow, xbnd );
		} else {
			grow = Math.min( ONE, HALF / Math.max( xbnd, SMLNUM ) );
			for ( j = jfirst; j !== jlast; j += jinc ) {
				if ( grow <= SMLNUM ) {
					break;
				}
				xj = ONE + CNORM[ offsetCNORM + j * sc ];
				grow /= xj;
			}
		}
	}

	if ( ( grow * tscal ) > SMLNUM ) {
		// Use fast path: ztrsv
		ztrsv( uplo, trans, diag, N, A, strideA1, strideA2, offsetA, x, strideX, offsetX );
	} else {
		// Careful solve with scaling
		if ( xmax > BIGNUM * HALF ) {
			scale[ 0 ] = ( BIGNUM * HALF ) / xmax;
			zdscal( N, scale[ 0 ], x, strideX, offsetX );
			xmax = BIGNUM;
		} else {
			xmax *= TWO;
		}

		if ( notran ) {
			// Solve A*x = b (no transpose)
			for ( j = jfirst; j !== jlast; j += jinc ) {
				jr = ox + j * sx;
				ji = jr + 1;
				xj = cabs1( xv, jr );

				if ( nounit ) {
					// Tjjs = A(j,j) * tscal
					tjjs_re = av[ oA + j * sa1 + j * sa2 ] * tscal;
					tjjs_im = av[ oA + j * sa1 + j * sa2 + 1 ] * tscal;
				} else {
					tjjs_re = tscal;
					tjjs_im = ZERO;
					if ( tscal === ONE ) {
						// Unit diagonal: skip division (Fortran label 110)
						xj = cabs1( xv, jr );
						if ( xj > ONE ) {
							rec = ONE / xj;
							if ( CNORM[ offsetCNORM + j * sc ] > ( BIGNUM - xmax ) * rec ) {
								rec *= HALF;
								zdscal( N, rec, x, strideX, offsetX );
								scale[ 0 ] *= rec;
							}
						} else if ( xj * CNORM[ offsetCNORM + j * sc ] > ( BIGNUM - xmax ) ) {
							zdscal( N, HALF, x, strideX, offsetX );
							scale[ 0 ] *= HALF;
						}

						if ( upper ) {
							if ( j > 0 ) {
								zaxpy( j, new Complex128( -xv[ jr ] * tscal, -xv[ ji ] * tscal ), A, strideA1, offsetA + j * strideA2, x, strideX, offsetX );
								i = izamax( j, x, strideX, offsetX );
								xmax = cabs1( xv, ox + i * sx );
							}
						} else if ( j < N - 1 ) {
							zaxpy( N - j - 1, new Complex128( -xv[ jr ] * tscal, -xv[ ji ] * tscal ), A, strideA1, offsetA + ( j + 1 ) * strideA1 + j * strideA2, x, strideX, offsetX + ( j + 1 ) * strideX );
							i = j + 1 + izamax( N - j - 1, x, strideX, offsetX + ( j + 1 ) * strideX );
							xmax = cabs1( xv, ox + i * sx );
						}
						continue;
					}
				}

				tjj = Math.abs( tjjs_re ) + Math.abs( tjjs_im );
				if ( tjj > SMLNUM ) {
					if ( tjj < ONE ) {
						if ( xj > tjj * BIGNUM ) {
							rec = ONE / xj;
							zdscal( N, rec, x, strideX, offsetX );
							scale[ 0 ] *= rec;
							xmax *= rec;
						}
					}
					// x(j) = x(j) / tjjs (complex division)
					ZLADIV_Xv[ 0 ] = xv[ jr ];
					ZLADIV_Xv[ 1 ] = xv[ ji ];
					ZLADIV_Yv[ 0 ] = tjjs_re;
					ZLADIV_Yv[ 1 ] = tjjs_im;
					zladiv( ZLADIV_X, 0, ZLADIV_Y, 0, ZLADIV_OUT, 0 );
					xv[ jr ] = ZLADIV_OUTv[ 0 ];
					xv[ ji ] = ZLADIV_OUTv[ 1 ];
					xj = cabs1( xv, jr );
				} else if ( tjj > ZERO ) {
					if ( xj > tjj * BIGNUM ) {
						rec = ( tjj * BIGNUM ) / xj;
						if ( CNORM[ offsetCNORM + j * sc ] > ONE ) {
							rec /= CNORM[ offsetCNORM + j * sc ];
						}
						zdscal( N, rec, x, strideX, offsetX );
						scale[ 0 ] *= rec;
						xmax *= rec;
					}
					ZLADIV_Xv[ 0 ] = xv[ jr ];
					ZLADIV_Xv[ 1 ] = xv[ ji ];
					ZLADIV_Yv[ 0 ] = tjjs_re;
					ZLADIV_Yv[ 1 ] = tjjs_im;
					zladiv( ZLADIV_X, 0, ZLADIV_Y, 0, ZLADIV_OUT, 0 );
					xv[ jr ] = ZLADIV_OUTv[ 0 ];
					xv[ ji ] = ZLADIV_OUTv[ 1 ];
					xj = cabs1( xv, jr );
				} else {
					// Singular
					for ( i = 0; i < N; i++ ) {
						xv[ ox + i * sx ] = ZERO;
						xv[ ox + i * sx + 1 ] = ZERO;
					}
					xv[ jr ] = ONE;
					xv[ ji ] = ZERO;
					xj = ONE;
					scale[ 0 ] = ZERO;
					xmax = ZERO;
				}

				// Update off-diagonal
				if ( xj > ONE ) {
					rec = ONE / xj;
					if ( CNORM[ offsetCNORM + j * sc ] > ( BIGNUM - xmax ) * rec ) {
						rec *= HALF;
						zdscal( N, rec, x, strideX, offsetX );
						scale[ 0 ] *= rec;
					}
				} else if ( xj * CNORM[ offsetCNORM + j * sc ] > ( BIGNUM - xmax ) ) {
					zdscal( N, HALF, x, strideX, offsetX );
					scale[ 0 ] *= HALF;
				}

				if ( upper ) {
					if ( j > 0 ) {
						zaxpy( j, new Complex128( -xv[ jr ] * tscal, -xv[ ji ] * tscal ), A, strideA1, offsetA + j * strideA2, x, strideX, offsetX );
						i = izamax( j, x, strideX, offsetX );
						xmax = cabs1( xv, ox + i * sx );
					}
				} else if ( j < N - 1 ) {
					zaxpy( N - j - 1, new Complex128( -xv[ jr ] * tscal, -xv[ ji ] * tscal ), A, strideA1, offsetA + ( j + 1 ) * strideA1 + j * strideA2, x, strideX, offsetX + ( j + 1 ) * strideX );
					i = j + 1 + izamax( N - j - 1, x, strideX, offsetX + ( j + 1 ) * strideX );
					xmax = cabs1( xv, ox + i * sx );
				}
			}
		} else if ( trans === 'transpose' ) {
			// Solve A^T*x = b (transpose, non-conjugate)
			for ( j = jfirst; j !== jlast; j += jinc ) {
				jr = ox + j * sx;
				ji = jr + 1;
				xj = cabs1( xv, jr );
				uscal_re = tscal;
				uscal_im = ZERO;
				rec = ONE / Math.max( xmax, ONE );

				if ( CNORM[ offsetCNORM + j * sc ] > ( BIGNUM - xj ) * rec ) {
					rec *= HALF;
					if ( nounit ) {
						tjjs_re = av[ oA + j * sa1 + j * sa2 ] * tscal;
						tjjs_im = av[ oA + j * sa1 + j * sa2 + 1 ] * tscal;
					} else {
						tjjs_re = tscal;
						tjjs_im = ZERO;
					}
					tjj = Math.abs( tjjs_re ) + Math.abs( tjjs_im );
					if ( tjj > ONE ) {
						rec = Math.min( ONE, rec * tjj );
						ZLADIV_Xv[ 0 ] = uscal_re;
						ZLADIV_Xv[ 1 ] = uscal_im;
						ZLADIV_Yv[ 0 ] = tjjs_re;
						ZLADIV_Yv[ 1 ] = tjjs_im;
						zladiv( ZLADIV_X, 0, ZLADIV_Y, 0, ZLADIV_OUT, 0 );
						uscal_re = ZLADIV_OUTv[ 0 ];
						uscal_im = ZLADIV_OUTv[ 1 ];
					}
					if ( rec < ONE ) {
						zdscal( N, rec, x, strideX, offsetX );
						scale[ 0 ] *= rec;
						xmax *= rec;
					}
				}

				computeTransposeSum( av, xv, oA, ox, sa1, sa2, sx, j, N, uscal_re, uscal_im, tscal, upper, false, A, x, strideA1, strideA2, offsetA, strideX, offsetX, csumj );

				if ( uscal_re === tscal && uscal_im === ZERO ) {
					xv[ jr ] -= csumj[ 0 ];
					xv[ ji ] -= csumj[ 1 ];
					xj = cabs1( xv, jr );

					if ( nounit ) {
						tjjs_re = av[ oA + j * sa1 + j * sa2 ] * tscal;
						tjjs_im = av[ oA + j * sa1 + j * sa2 + 1 ] * tscal;
					} else {
						tjjs_re = tscal;
						tjjs_im = ZERO;
						if ( tscal === ONE ) {
							xmax = Math.max( xmax, cabs1( xv, jr ) );
							continue;
						}
					}

					tjj = Math.abs( tjjs_re ) + Math.abs( tjjs_im );
					if ( tjj > SMLNUM ) {
						if ( tjj < ONE ) {
							if ( xj > tjj * BIGNUM ) {
								rec = ONE / xj;
								zdscal( N, rec, x, strideX, offsetX );
								scale[ 0 ] *= rec;
								xmax *= rec;
							}
						}
						ZLADIV_Xv[ 0 ] = xv[ jr ];
						ZLADIV_Xv[ 1 ] = xv[ ji ];
						ZLADIV_Yv[ 0 ] = tjjs_re;
						ZLADIV_Yv[ 1 ] = tjjs_im;
						zladiv( ZLADIV_X, 0, ZLADIV_Y, 0, ZLADIV_OUT, 0 );
						xv[ jr ] = ZLADIV_OUTv[ 0 ];
						xv[ ji ] = ZLADIV_OUTv[ 1 ];
					} else if ( tjj > ZERO ) {
						if ( xj > tjj * BIGNUM ) {
							rec = ( tjj * BIGNUM ) / xj;
							zdscal( N, rec, x, strideX, offsetX );
							scale[ 0 ] *= rec;
							xmax *= rec;
						}
						ZLADIV_Xv[ 0 ] = xv[ jr ];
						ZLADIV_Xv[ 1 ] = xv[ ji ];
						ZLADIV_Yv[ 0 ] = tjjs_re;
						ZLADIV_Yv[ 1 ] = tjjs_im;
						zladiv( ZLADIV_X, 0, ZLADIV_Y, 0, ZLADIV_OUT, 0 );
						xv[ jr ] = ZLADIV_OUTv[ 0 ];
						xv[ ji ] = ZLADIV_OUTv[ 1 ];
					} else {
						for ( i = 0; i < N; i++ ) {
							xv[ ox + i * sx ] = ZERO;
							xv[ ox + i * sx + 1 ] = ZERO;
						}
						xv[ jr ] = ONE;
						xv[ ji ] = ZERO;
						scale[ 0 ] = ZERO;
						xmax = ZERO;
					}
				} else {
					ZLADIV_Xv[ 0 ] = xv[ jr ];
					ZLADIV_Xv[ 1 ] = xv[ ji ];
					ZLADIV_Yv[ 0 ] = tjjs_re;
					ZLADIV_Yv[ 1 ] = tjjs_im;
					zladiv( ZLADIV_X, 0, ZLADIV_Y, 0, ZLADIV_OUT, 0 );
					xv[ jr ] = ZLADIV_OUTv[ 0 ] - csumj[ 0 ];
					xv[ ji ] = ZLADIV_OUTv[ 1 ] - csumj[ 1 ];
				}
				xmax = Math.max( xmax, cabs1( xv, jr ) );
			}
		} else {
			// Solve A^H*x = b (conjugate transpose)
			for ( j = jfirst; j !== jlast; j += jinc ) {
				jr = ox + j * sx;
				ji = jr + 1;
				xj = cabs1( xv, jr );
				uscal_re = tscal;
				uscal_im = ZERO;
				rec = ONE / Math.max( xmax, ONE );

				if ( CNORM[ offsetCNORM + j * sc ] > ( BIGNUM - xj ) * rec ) {
					rec *= HALF;
					if ( nounit ) {
						// Tjjs = conj(A(j,j)) * tscal
						tjjs_re = av[ oA + j * sa1 + j * sa2 ] * tscal;
						tjjs_im = -av[ oA + j * sa1 + j * sa2 + 1 ] * tscal;
					} else {
						tjjs_re = tscal;
						tjjs_im = ZERO;
					}
					tjj = Math.abs( tjjs_re ) + Math.abs( tjjs_im );
					if ( tjj > ONE ) {
						rec = Math.min( ONE, rec * tjj );
						ZLADIV_Xv[ 0 ] = uscal_re;
						ZLADIV_Xv[ 1 ] = uscal_im;
						ZLADIV_Yv[ 0 ] = tjjs_re;
						ZLADIV_Yv[ 1 ] = tjjs_im;
						zladiv( ZLADIV_X, 0, ZLADIV_Y, 0, ZLADIV_OUT, 0 );
						uscal_re = ZLADIV_OUTv[ 0 ];
						uscal_im = ZLADIV_OUTv[ 1 ];
					}
					if ( rec < ONE ) {
						zdscal( N, rec, x, strideX, offsetX );
						scale[ 0 ] *= rec;
						xmax *= rec;
					}
				}

				computeTransposeSum( av, xv, oA, ox, sa1, sa2, sx, j, N, uscal_re, uscal_im, tscal, upper, true, A, x, strideA1, strideA2, offsetA, strideX, offsetX, csumj );

				if ( uscal_re === tscal && uscal_im === ZERO ) {
					xv[ jr ] -= csumj[ 0 ];
					xv[ ji ] -= csumj[ 1 ];
					xj = cabs1( xv, jr );

					if ( nounit ) {
						tjjs_re = av[ oA + j * sa1 + j * sa2 ] * tscal;
						tjjs_im = -av[ oA + j * sa1 + j * sa2 + 1 ] * tscal;
					} else {
						tjjs_re = tscal;
						tjjs_im = ZERO;
						if ( tscal === ONE ) {
							xmax = Math.max( xmax, cabs1( xv, jr ) );
							continue;
						}
					}

					tjj = Math.abs( tjjs_re ) + Math.abs( tjjs_im );
					if ( tjj > SMLNUM ) {
						if ( tjj < ONE ) {
							if ( xj > tjj * BIGNUM ) {
								rec = ONE / xj;
								zdscal( N, rec, x, strideX, offsetX );
								scale[ 0 ] *= rec;
								xmax *= rec;
							}
						}
						ZLADIV_Xv[ 0 ] = xv[ jr ];
						ZLADIV_Xv[ 1 ] = xv[ ji ];
						ZLADIV_Yv[ 0 ] = tjjs_re;
						ZLADIV_Yv[ 1 ] = tjjs_im;
						zladiv( ZLADIV_X, 0, ZLADIV_Y, 0, ZLADIV_OUT, 0 );
						xv[ jr ] = ZLADIV_OUTv[ 0 ];
						xv[ ji ] = ZLADIV_OUTv[ 1 ];
					} else if ( tjj > ZERO ) {
						if ( xj > tjj * BIGNUM ) {
							rec = ( tjj * BIGNUM ) / xj;
							zdscal( N, rec, x, strideX, offsetX );
							scale[ 0 ] *= rec;
							xmax *= rec;
						}
						ZLADIV_Xv[ 0 ] = xv[ jr ];
						ZLADIV_Xv[ 1 ] = xv[ ji ];
						ZLADIV_Yv[ 0 ] = tjjs_re;
						ZLADIV_Yv[ 1 ] = tjjs_im;
						zladiv( ZLADIV_X, 0, ZLADIV_Y, 0, ZLADIV_OUT, 0 );
						xv[ jr ] = ZLADIV_OUTv[ 0 ];
						xv[ ji ] = ZLADIV_OUTv[ 1 ];
					} else {
						for ( i = 0; i < N; i++ ) {
							xv[ ox + i * sx ] = ZERO;
							xv[ ox + i * sx + 1 ] = ZERO;
						}
						xv[ jr ] = ONE;
						xv[ ji ] = ZERO;
						scale[ 0 ] = ZERO;
						xmax = ZERO;
					}
				} else {
					ZLADIV_Xv[ 0 ] = xv[ jr ];
					ZLADIV_Xv[ 1 ] = xv[ ji ];
					ZLADIV_Yv[ 0 ] = tjjs_re;
					ZLADIV_Yv[ 1 ] = tjjs_im;
					zladiv( ZLADIV_X, 0, ZLADIV_Y, 0, ZLADIV_OUT, 0 );
					xv[ jr ] = ZLADIV_OUTv[ 0 ] - csumj[ 0 ];
					xv[ ji ] = ZLADIV_OUTv[ 1 ] - csumj[ 1 ];
				}
				xmax = Math.max( xmax, cabs1( xv, jr ) );
			}
		}
		scale[ 0 ] /= tscal;
	}

	// Restore CNORM if it was scaled
	if ( tscal !== ONE ) {
		dscal( N, ONE / tscal, CNORM, sc, offsetCNORM );
	}

	return 0;
}


// EXPORTS //

export default zlatrs;
