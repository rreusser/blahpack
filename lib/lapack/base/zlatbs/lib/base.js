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
import ztbsv from '../../../../blas/base/ztbsv/lib/base.js';
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

// Scratch Complex128Array buffers for zladiv calls:
var ZLADIV_X = new Complex128Array( 1 );
var ZLADIV_Y = new Complex128Array( 1 );
var ZLADIV_OUT = new Complex128Array( 1 );
var ZLADIV_Xv = reinterpret( ZLADIV_X, 0 );
var ZLADIV_Yv = reinterpret( ZLADIV_Y, 0 );
var ZLADIV_OUTv = reinterpret( ZLADIV_OUT, 0 );


// FUNCTIONS //

/**
* CABS1: |re(z)| + |im(z)|
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
* CABS2: |re(z)/2| + |im(z)/2| (avoids overflow)
*
* @private
* @param {Float64Array} v - Float64 view
* @param {integer} idx - index of real part
* @returns {number} CABS2 value
*/
function cabs2( v, idx ) {
	return Math.abs( v[ idx ] * HALF ) + Math.abs( v[ idx + 1 ] * HALF );
}


// MAIN //

/**
* Solves a complex triangular banded system with scaling to prevent overflow.
*
* Solves one of:
*   A*x = s*b   (trans = 'no-transpose')
*   A^T*x = s*b (trans = 'transpose')
*   A^H*x = s*b (trans = 'conjugate-transpose')
*
* where A is an N-by-N complex triangular band matrix with KD sub/super-diagonals,
* x and b are N-vectors, and s is a real scaling factor chosen to prevent overflow.
*
* @private
* @param {string} uplo - 'upper' or 'lower'
* @param {string} trans - 'no-transpose', 'transpose', or 'conjugate-transpose'
* @param {string} diag - 'non-unit' or 'unit'
* @param {string} normin - 'yes' if CNORM contains column norms on input, 'no' to compute them
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} kd - number of sub/super-diagonals
* @param {Complex128Array} AB - triangular band matrix in band storage
* @param {integer} strideAB1 - first dimension stride of AB (complex elements)
* @param {integer} strideAB2 - second dimension stride of AB (complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for AB (complex elements)
* @param {Complex128Array} x - in/out right-hand side vector of length N
* @param {integer} strideX - stride for x (complex elements)
* @param {NonNegativeInteger} offsetX - starting index for x (complex elements)
* @param {Float64Array} scale - output: scale[0] is the scale factor s
* @param {Float64Array} CNORM - in/out column norm array of length N
* @param {integer} strideCNORM - stride for CNORM
* @param {NonNegativeInteger} offsetCNORM - starting index for CNORM
* @returns {integer} info - 0 if successful
*/
function zlatbs( uplo, trans, diag, normin, N, kd, AB, strideAB1, strideAB2, offsetAB, x, strideX, offsetX, scale, CNORM, strideCNORM, offsetCNORM ) {
	var notran;
	var nounit;
	var jfirst;
	var upper;
	var tscal;
	var jlast;
	var maind;
	var xbnd;
	var xmax;
	var grow;
	var tmax;
	var imax;
	var jinc;
	var jlen;
	var csumj_re;
	var csumj_im;
	var tjjs_re;
	var tjjs_im;
	var uscal_re;
	var uscal_im;
	var dotResult;
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
	var ar;
	var ai;
	var xr;
	var xi;
	var ur;
	var ui;
	var j;
	var i;

	upper = ( uplo === 'upper' );
	notran = ( trans === 'no-transpose' );
	nounit = ( diag === 'non-unit' );

	sa1 = strideAB1 * 2; // Float64 strides
	sa2 = strideAB2 * 2;
	oA = offsetAB * 2;
	sc = strideCNORM;

	scale[ 0 ] = ONE;
	if ( N === 0 ) {
		return 0;
	}

	av = reinterpret( AB, 0 );
	xv = reinterpret( x, 0 );
	sx = strideX * 2;
	ox = offsetX * 2;

	// In banded storage, the main diagonal index is:
	//   upper: row kd (0-based), i.e., AB(kd+1, j) in 1-based = AB[kd, j] in 0-based
	//   lower: row 0, i.e., AB(1, j) in 1-based = AB[0, j] in 0-based
	// maind is the 0-based row index of the diagonal
	if ( upper ) {
		maind = kd;
	} else {
		maind = 0;
	}

	// Compute column norms if not provided
	if ( normin === 'no' ) {
		if ( upper ) {
			for ( j = 0; j < N; j++ ) {
				jlen = Math.min( kd, j );
				if ( jlen > 0 ) {
					// off-diagonal elements in rows (kd-jlen) to (kd-1) of column j
					CNORM[ offsetCNORM + j * sc ] = dzasum( jlen, AB, strideAB1, offsetAB + (kd - jlen) * strideAB1 + j * strideAB2 );
				} else {
					CNORM[ offsetCNORM + j * sc ] = ZERO;
				}
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				jlen = Math.min( kd, N - j - 1 );
				if ( jlen > 0 ) {
					// off-diagonal elements in rows 1 to jlen of column j
					CNORM[ offsetCNORM + j * sc ] = dzasum( jlen, AB, strideAB1, offsetAB + 1 * strideAB1 + j * strideAB2 );
				} else {
					CNORM[ offsetCNORM + j * sc ] = ZERO;
				}
			}
		}
	}

	// Scale CNORM if necessary
	imax = idamax( N, CNORM, sc, offsetCNORM );
	tmax = CNORM[ offsetCNORM + imax * sc ];
	if ( tmax <= BIGNUM * HALF ) {
		tscal = ONE;
	} else {
		tscal = HALF / ( SMLNUM * tmax );
		dscal( N, tscal, CNORM, sc, offsetCNORM );
	}

	// Find max |x_j| (using CABS2 to avoid overflow)
	xmax = ZERO;
	for ( j = 0; j < N; j++ ) {
		xmax = Math.max( xmax, cabs2( xv, ox + j * sx ) );
	}
	xbnd = xmax;

	if ( notran ) {
		// Compute growth for A*x = b
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
				tjj = cabs1( av, oA + maind * sa1 + j * sa2 );
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
		// Compute growth for A^T*x = b or A^H*x = b
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
				tjj = cabs1( av, oA + maind * sa1 + j * sa2 );
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
		// Use Level 2 BLAS ztbsv
		ztbsv( uplo, trans, diag, N, kd, AB, strideAB1, strideAB2, offsetAB, x, strideX, offsetX );
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
			// Solve A * x = b (no transpose)
			for ( j = jfirst; j !== jlast; j += jinc ) {
				jr = ox + j * sx;
				ji = jr + 1;
				xj = cabs1( xv, jr );

				if ( nounit ) {
					tjjs_re = av[ oA + maind * sa1 + j * sa2 ] * tscal;
					tjjs_im = av[ oA + maind * sa1 + j * sa2 + 1 ] * tscal;
				} else {
					tjjs_re = tscal;
					tjjs_im = ZERO;
					if ( tscal === ONE ) {
						// Unit diagonal: skip to update step
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

						// Update: banded off-diagonal
						if ( upper ) {
							if ( j > 0 ) {
								jlen = Math.min( kd, j );
								zaxpy( jlen, new Complex128( -xv[ jr ] * tscal, -xv[ ji ] * tscal ), AB, strideAB1, offsetAB + (kd - jlen) * strideAB1 + j * strideAB2, x, strideX, offsetX + (j - jlen) * strideX );
								i = izamax( j, x, strideX, offsetX );
								xmax = cabs1( xv, ox + i * sx );
							}
						} else if ( j < N - 1 ) {
							jlen = Math.min( kd, N - j - 1 );
							if ( jlen > 0 ) {
								zaxpy( jlen, new Complex128( -xv[ jr ] * tscal, -xv[ ji ] * tscal ), AB, strideAB1, offsetAB + 1 * strideAB1 + j * strideAB2, x, strideX, offsetX + (j + 1) * strideX );
							}
							i = j + izamax( N - j - 1, x, strideX, offsetX + (j + 1) * strideX );
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
					// Singular: set x(1:n)=0, x(j)=1, scale=0
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

				// Scale x if necessary to avoid overflow when adding column j
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

				// Update off-diagonal (banded)
				if ( upper ) {
					if ( j > 0 ) {
						jlen = Math.min( kd, j );
						zaxpy( jlen, new Complex128( -xv[ jr ] * tscal, -xv[ ji ] * tscal ), AB, strideAB1, offsetAB + (kd - jlen) * strideAB1 + j * strideAB2, x, strideX, offsetX + (j - jlen) * strideX );
						i = izamax( j, x, strideX, offsetX );
						xmax = cabs1( xv, ox + i * sx );
					}
				} else if ( j < N - 1 ) {
					jlen = Math.min( kd, N - j - 1 );
					if ( jlen > 0 ) {
						zaxpy( jlen, new Complex128( -xv[ jr ] * tscal, -xv[ ji ] * tscal ), AB, strideAB1, offsetAB + 1 * strideAB1 + j * strideAB2, x, strideX, offsetX + (j + 1) * strideX );
					}
					i = j + izamax( N - j - 1, x, strideX, offsetX + (j + 1) * strideX );
					xmax = cabs1( xv, ox + i * sx );
				}
			}
		} else if ( trans === 'transpose' ) {
			// Solve A^T * x = b (transpose, non-conjugate)
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
						tjjs_re = av[ oA + maind * sa1 + j * sa2 ] * tscal;
						tjjs_im = av[ oA + maind * sa1 + j * sa2 + 1 ] * tscal;
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

				// Compute dot product
				csumj_re = ZERO;
				csumj_im = ZERO;

				if ( uscal_re === ONE && uscal_im === ZERO ) {
					// Use BLAS zdotu
					if ( upper ) {
						jlen = Math.min( kd, j );
						if ( jlen > 0 ) {
							dotResult = zdotu( jlen, AB, strideAB1, offsetAB + (kd - jlen) * strideAB1 + j * strideAB2, x, strideX, offsetX + (j - jlen) * strideX );
							csumj_re = real( dotResult );
							csumj_im = imag( dotResult );
						}
					} else {
						jlen = Math.min( kd, N - j - 1 );
						if ( jlen > 1 ) {
							dotResult = zdotu( jlen, AB, strideAB1, offsetAB + 1 * strideAB1 + j * strideAB2, x, strideX, offsetX + (j + 1) * strideX );
							csumj_re = real( dotResult );
							csumj_im = imag( dotResult );
						}
					}
				} else {
					// Inline scaled dot product
					if ( upper ) {
						jlen = Math.min( kd, j );
						for ( i = 0; i < jlen; i++ ) {
							ar = av[ oA + (kd - jlen + i) * sa1 + j * sa2 ];
							ai = av[ oA + (kd - jlen + i) * sa1 + j * sa2 + 1 ];
							// (AB_ij * uscal) * x(j-jlen+i)
							ur = ar * uscal_re - ai * uscal_im;
							ui = ar * uscal_im + ai * uscal_re;
							xr = xv[ ox + (j - jlen + i) * sx ];
							xi = xv[ ox + (j - jlen + i) * sx + 1 ];
							csumj_re += ur * xr - ui * xi;
							csumj_im += ur * xi + ui * xr;
						}
					} else {
						jlen = Math.min( kd, N - j - 1 );
						for ( i = 0; i < jlen; i++ ) {
							ar = av[ oA + (i + 1) * sa1 + j * sa2 ];
							ai = av[ oA + (i + 1) * sa1 + j * sa2 + 1 ];
							ur = ar * uscal_re - ai * uscal_im;
							ui = ar * uscal_im + ai * uscal_re;
							xr = xv[ ox + (j + 1 + i) * sx ];
							xi = xv[ ox + (j + 1 + i) * sx + 1 ];
							csumj_re += ur * xr - ui * xi;
							csumj_im += ur * xi + ui * xr;
						}
					}
				}

				if ( uscal_re === tscal && uscal_im === ZERO ) {
					// x(j) = (x(j) - CSUMJ) / A(j,j)
					xv[ jr ] -= csumj_re;
					xv[ ji ] -= csumj_im;
					xj = cabs1( xv, jr );

					if ( nounit ) {
						tjjs_re = av[ oA + maind * sa1 + j * sa2 ] * tscal;
						tjjs_im = av[ oA + maind * sa1 + j * sa2 + 1 ] * tscal;
					} else {
						tjjs_re = tscal;
						tjjs_im = ZERO;
						if ( tscal === ONE ) {
							// Skip division for unit diagonal
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
					// x(j) = x(j)/A(j,j) - CSUMJ
					ZLADIV_Xv[ 0 ] = xv[ jr ];
					ZLADIV_Xv[ 1 ] = xv[ ji ];
					ZLADIV_Yv[ 0 ] = tjjs_re;
					ZLADIV_Yv[ 1 ] = tjjs_im;
					zladiv( ZLADIV_X, 0, ZLADIV_Y, 0, ZLADIV_OUT, 0 );
					xv[ jr ] = ZLADIV_OUTv[ 0 ] - csumj_re;
					xv[ ji ] = ZLADIV_OUTv[ 1 ] - csumj_im;
				}
				xmax = Math.max( xmax, cabs1( xv, jr ) );
			}
		} else {
			// Solve A^H * x = b (conjugate transpose)
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
						// conj(AB(maind, j)) * tscal
						tjjs_re = av[ oA + maind * sa1 + j * sa2 ] * tscal;
						tjjs_im = -av[ oA + maind * sa1 + j * sa2 + 1 ] * tscal;
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

				// Compute conjugate dot product
				csumj_re = ZERO;
				csumj_im = ZERO;

				if ( uscal_re === ONE && uscal_im === ZERO ) {
					// Use BLAS zdotc
					if ( upper ) {
						jlen = Math.min( kd, j );
						if ( jlen > 0 ) {
							dotResult = zdotc( jlen, AB, strideAB1, offsetAB + (kd - jlen) * strideAB1 + j * strideAB2, x, strideX, offsetX + (j - jlen) * strideX );
							csumj_re = real( dotResult );
							csumj_im = imag( dotResult );
						}
					} else {
						jlen = Math.min( kd, N - j - 1 );
						if ( jlen > 1 ) {
							dotResult = zdotc( jlen, AB, strideAB1, offsetAB + 1 * strideAB1 + j * strideAB2, x, strideX, offsetX + (j + 1) * strideX );
							csumj_re = real( dotResult );
							csumj_im = imag( dotResult );
						}
					}
				} else {
					// Inline scaled conjugate dot product
					if ( upper ) {
						jlen = Math.min( kd, j );
						for ( i = 0; i < jlen; i++ ) {
							ar = av[ oA + (kd - jlen + i) * sa1 + j * sa2 ];
							ai = -av[ oA + (kd - jlen + i) * sa1 + j * sa2 + 1 ]; // conjugate
							ur = ar * uscal_re - ai * uscal_im;
							ui = ar * uscal_im + ai * uscal_re;
							xr = xv[ ox + (j - jlen + i) * sx ];
							xi = xv[ ox + (j - jlen + i) * sx + 1 ];
							csumj_re += ur * xr - ui * xi;
							csumj_im += ur * xi + ui * xr;
						}
					} else {
						jlen = Math.min( kd, N - j - 1 );
						for ( i = 0; i < jlen; i++ ) {
							ar = av[ oA + (i + 1) * sa1 + j * sa2 ];
							ai = -av[ oA + (i + 1) * sa1 + j * sa2 + 1 ]; // conjugate
							ur = ar * uscal_re - ai * uscal_im;
							ui = ar * uscal_im + ai * uscal_re;
							xr = xv[ ox + (j + 1 + i) * sx ];
							xi = xv[ ox + (j + 1 + i) * sx + 1 ];
							csumj_re += ur * xr - ui * xi;
							csumj_im += ur * xi + ui * xr;
						}
					}
				}

				if ( uscal_re === tscal && uscal_im === ZERO ) {
					xv[ jr ] -= csumj_re;
					xv[ ji ] -= csumj_im;
					xj = cabs1( xv, jr );

					if ( nounit ) {
						tjjs_re = av[ oA + maind * sa1 + j * sa2 ] * tscal;
						tjjs_im = -av[ oA + maind * sa1 + j * sa2 + 1 ] * tscal; // conjugate
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
					xv[ jr ] = ZLADIV_OUTv[ 0 ] - csumj_re;
					xv[ ji ] = ZLADIV_OUTv[ 1 ] - csumj_im;
				}
				xmax = Math.max( xmax, cabs1( xv, jr ) );
			}
		}
		scale[ 0 ] /= tscal;
	}

	// Scale the column norms by 1/TSCAL for return
	if ( tscal !== ONE ) {
		dscal( N, ONE / tscal, CNORM, sc, offsetCNORM );
	}

	return 0;
}


// EXPORTS //

export default zlatbs;
