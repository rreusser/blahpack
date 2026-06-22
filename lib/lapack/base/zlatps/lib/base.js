/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable max-len, max-params, max-depth, max-statements, no-mixed-operators, max-lines-per-function, max-lines, camelcase */

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
import ztpsv from '../../../../blas/base/ztpsv/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import zladiv from '../../zladiv/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var HALF = 0.5;
var ONE = 1.0;
var TWO = 2.0;

// Machine constants (Fortran: SMLNUM = DLAMCH('Safe minimum') / DLAMCH('Precision')):
var SMLNUM = dlamch( 'safe-minimum' ) / dlamch( 'precision' );
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
* Computes the off-diagonal sum for transpose/conjugate-transpose cases in packed storage.
*
* @private
* @param {Float64Array} av - Float64 view of AP
* @param {Float64Array} xv - Float64 view of x
* @param {integer} sap - Float64 stride for AP
* @param {integer} ox - Float64 offset for x
* @param {integer} sx - Float64 stride for x
* @param {integer} ip - Float64 index of current diagonal
* @param {integer} j - current column index (0-based)
* @param {integer} N - matrix order
* @param {number} uscalRe - real part of uscal
* @param {number} uscalIm - imaginary part of uscal
* @param {number} tscal - scaling factor
* @param {boolean} upper - whether matrix is upper triangular
* @param {boolean} conjugate - whether to conjugate
* @param {Complex128Array} AP - packed matrix
* @param {Complex128Array} x - vector
* @param {integer} strideAP - complex stride for AP
* @param {integer} strideX - complex stride for x
* @param {integer} offsetAP - complex offset for AP
* @param {integer} offsetX - complex offset for x
* @param {Array} out - output array for real and imaginary parts
* @returns {Array} output array
*/
function computeTransposeSum( av, xv, sap, ox, sx, ip, j, N, uscalRe, uscalIm, tscal, upper, conjugate, AP, x, strideAP, strideX, offsetAP, offsetX, out ) { // eslint-disable-line max-params
	var dotResult;
	var csumjR = ZERO;
	var csumjI = ZERO;
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
					// AP column j starts at ip - j (in complex elements, 0-based)
					dotResult = zdotc( j, AP, strideAP, ( ip / 2 ) - j, x, strideX, offsetX );
					csumjR = real( dotResult );
					csumjI = imag( dotResult );
				}
			} else if ( j < N - 1 ) {
				dotResult = zdotc( N - j - 1, AP, strideAP, ( ip / 2 ) + 1, x, strideX, offsetX + ( ( j + 1 ) * strideX ) );
				csumjR = real( dotResult );
				csumjI = imag( dotResult );
			}
		} else if ( upper ) {
			if ( j > 0 ) {
				dotResult = zdotu( j, AP, strideAP, ( ip / 2 ) - j, x, strideX, offsetX );
				csumjR = real( dotResult );
				csumjI = imag( dotResult );
			}
		} else if ( j < N - 1 ) {
			dotResult = zdotu( N - j - 1, AP, strideAP, ( ip / 2 ) + 1, x, strideX, offsetX + ( ( j + 1 ) * strideX ) );
			csumjR = real( dotResult );
			csumjI = imag( dotResult );
		}
	} else if ( upper ) {
		// Scale each term individually
		for ( i = 0; i < j; i++ ) {
			ar = av[ ip - ( ( j - i ) * sap ) ];
			ai = ( conjugate ) ? -av[ ip - ( ( j - i ) * sap ) + 1 ] : av[ ip - ( ( j - i ) * sap ) + 1 ];
			ur = ( ar * uscalRe ) - ( ai * uscalIm );
			ui = ( ar * uscalIm ) + ( ai * uscalRe );
			xr = xv[ ox + ( i * sx ) ];
			xi = xv[ ox + ( i * sx ) + 1 ];
			csumjR += ( ur * xr ) - ( ui * xi );
			csumjI += ( ur * xi ) + ( ui * xr );
		}
	} else if ( j < N - 1 ) {
		for ( i = 1; i <= N - j - 1; i++ ) {
			ar = av[ ip + ( i * sap ) ];
			ai = ( conjugate ) ? -av[ ip + ( i * sap ) + 1 ] : av[ ip + ( i * sap ) + 1 ];
			ur = ( ar * uscalRe ) - ( ai * uscalIm );
			ui = ( ar * uscalIm ) + ( ai * uscalRe );
			xr = xv[ ox + ( ( j + i ) * sx ) ];
			xi = xv[ ox + ( ( j + i ) * sx ) + 1 ];
			csumjR += ( ur * xr ) - ( ui * xi );
			csumjI += ( ur * xi ) + ( ui * xr );
		}
	}

	out[ 0 ] = csumjR;
	out[ 1 ] = csumjI;
	return out;
}


// MAIN //

/**
* Solves a complex triangular system with scaling to prevent overflow.
* where the matrix is in packed storage.
*
* Solves one of:
*   A_x = s_b   (trans = 'no-transpose')
*   A^T_x = s_b (trans = 'transpose')
*   A^H_x = s_b (trans = 'conjugate-transpose')
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {string} normin - `'yes'` if CNORM contains column norms on input, `'no'` to compute them
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} AP - packed triangular matrix
* @param {integer} strideAP - stride for AP (complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for AP (complex elements)
* @param {Complex128Array} x - in/out right-hand side vector of length N
* @param {integer} strideX - stride for x (complex elements)
* @param {NonNegativeInteger} offsetX - starting index for x (complex elements)
* @param {Float64Array} scale - output: scale[0] is the scale factor s
* @param {Float64Array} CNORM - in/out column norm array of length N
* @param {integer} strideCNORM - stride for CNORM
* @param {NonNegativeInteger} offsetCNORM - starting index for CNORM
* @returns {integer} info - 0 if successful
*/
function zlatps( uplo, trans, diag, normin, N, AP, strideAP, offsetAP, x, strideX, offsetX, scale, CNORM, strideCNORM, offsetCNORM ) {
	var uscal_re;
	var uscal_im;
	var tjjs_re;
	var tjjs_im;
	var notran;
	var nounit;
	var jfirst;
	var upper;
	var tscal;
	var jlast;
	var csumj;
	var xbnd;
	var xmax;
	var grow;
	var tmax;
	var imax;
	var jinc;
	var jlen;
	var rec;
	var tjj;
	var sap;
	var xj;
	var av;
	var xv;
	var sx;
	var ox;
	var ip;
	var jr;
	var ji;
	var sc;
	var j;
	var i;

	sap = strideAP * 2;
	sc = strideCNORM;

	upper = ( uplo === 'upper' );
	notran = ( trans === 'no-transpose' );
	nounit = ( diag === 'non-unit' );

	scale[ 0 ] = ONE;
	if ( N === 0 ) {
		return 0;
	}

	av = reinterpret( AP, 0 );
	xv = reinterpret( x, 0 );
	sx = strideX * 2;
	ox = offsetX * 2;
	csumj = [ ZERO, ZERO ];

	// Compute column norms if not provided
	if ( normin === 'no' ) {
		if ( upper ) {
			// Upper packed: column j has j elements above diagonal
			// Column j starts at position j*(j+1)/2 in packed (0-based complex elements)
			ip = offsetAP * 2;
			for ( j = 0; j < N; j++ ) {
				CNORM[ offsetCNORM + ( j * sc ) ] = dzasum( j, AP, strideAP, offsetAP + ( ( j * ( j + 1 ) ) / 2 ) );
				ip += ( j + 1 ) * sap;
			}
		} else {
			// Lower packed: column j has N-j-1 elements below diagonal
			ip = offsetAP * 2;
			for ( j = 0; j < N - 1; j++ ) {
				CNORM[ offsetCNORM + ( j * sc ) ] = dzasum( N - j - 1, AP, strideAP, offsetAP + ( ip / sap ) + 1 );
				ip += ( N - j ) * sap;
			}
			CNORM[ offsetCNORM + ( ( N - 1 ) * sc ) ] = ZERO;
		}
	}

	// Scale CNORM if overflow would occur
	imax = idamax( N, CNORM, sc, offsetCNORM );
	tmax = CNORM[ offsetCNORM + ( imax * sc ) ];
	if ( tmax <= BIGNUM * HALF ) {
		tscal = ONE;
	} else {
		tscal = HALF / ( SMLNUM * tmax );
		dscal( N, tscal, CNORM, sc, offsetCNORM );
	}

	// Find max |x_j|
	xmax = ZERO;
	for ( j = 0; j < N; j++ ) {
		xmax = Math.max( xmax, cabs2( xv, ox + ( j * sx ) ) );
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

			// ip points to diagonal of column jfirst in packed storage (0-based, Float64)

			// Fortran: IP = JFIRST*(JFIRST+1)/2 (1-based complex)

			// JS 0-based complex: jfirst*(jfirst+1)/2, then *2 for Float64
			ip = ( offsetAP + ( ( jfirst * ( jfirst + 1 ) ) / 2 ) + jfirst ) * 2;
			jlen = N;
			for ( j = jfirst; j !== jlast; j += jinc ) {
				if ( grow <= SMLNUM ) {
					break;
				}
				tjj = cabs1( av, ip );
				xbnd = Math.min( xbnd, Math.min( ONE, tjj ) * grow );
				if ( tjj + CNORM[ offsetCNORM + ( j * sc ) ] >= SMLNUM ) {
					grow *= ( tjj / ( tjj + CNORM[ offsetCNORM + ( j * sc ) ] ) );
				} else {
					grow = ZERO;
				}
				if ( upper ) {
					// Move to previous diagonal: ip -= jlen * sap_complex
					ip -= jlen * sap;
				} else {
					// Move to next diagonal: ip += (jlen) * sap_complex ... but jlen changes
					ip += jlen * sap;
				}
				jlen -= 1;
			}
			grow = xbnd;
		} else {
			grow = Math.min( ONE, HALF / Math.max( xbnd, SMLNUM ) );
			for ( j = jfirst; j !== jlast; j += jinc ) {
				if ( grow <= SMLNUM ) {
					break;
				}
				grow *= ( ONE / ( ONE + CNORM[ offsetCNORM + ( j * sc ) ] ) );
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

			// ip points to diagonal of column jfirst
			ip = ( offsetAP + ( ( jfirst * ( jfirst + 1 ) ) / 2 ) + jfirst ) * 2;
			jlen = 1;
			for ( j = jfirst; j !== jlast; j += jinc ) {
				if ( grow <= SMLNUM ) {
					break;
				}
				xj = ONE + CNORM[ offsetCNORM + ( j * sc ) ];
				grow = Math.min( grow, xbnd / xj );
				tjj = cabs1( av, ip );
				if ( xj > tjj ) {
					xbnd *= ( tjj / xj );
				}
				jlen += 1;
				if ( upper ) {
					ip += jlen * sap;
				} else {
					ip -= jlen * sap;
				}
			}
			grow = Math.min( grow, xbnd );
		} else {
			grow = Math.min( ONE, HALF / Math.max( xbnd, SMLNUM ) );
			for ( j = jfirst; j !== jlast; j += jinc ) {
				if ( grow <= SMLNUM ) {
					break;
				}
				xj = ONE + CNORM[ offsetCNORM + ( j * sc ) ];
				grow /= xj;
			}
		}
	}

	if ( ( grow * tscal ) > SMLNUM ) {
		// Use fast path: ztpsv
		ztpsv( uplo, trans, diag, N, AP, strideAP, offsetAP, x, strideX, offsetX );
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
			// Solve A*x = b (no transpose) with packed storage
			// ip tracks the Float64 index of diagonal element A(j,j) in packed array
			// Fortran: IP = JFIRST*(JFIRST+1)/2 (works for both upper/lower when JFIRST=1 or N)
			ip = ( offsetAP + ( ( jfirst * ( jfirst + 1 ) ) / 2 ) + jfirst ) * 2;
			for ( j = jfirst; j !== jlast; j += jinc ) {
				jr = ox + ( j * sx );
				ji = jr + 1;
				xj = cabs1( xv, jr );

				if ( nounit ) {
					tjjs_re = av[ ip ] * tscal;
					tjjs_im = av[ ip + 1 ] * tscal;
				} else {
					tjjs_re = tscal;
					tjjs_im = ZERO;
					if ( tscal === ONE ) {
						// Unit diagonal: skip division (Fortran label 110)
						xj = cabs1( xv, jr );
						if ( xj > ONE ) {
							rec = ONE / xj;
							if ( CNORM[ offsetCNORM + ( j * sc ) ] > ( BIGNUM - xmax ) * rec ) {
								rec *= HALF;
								zdscal( N, rec, x, strideX, offsetX );
								scale[ 0 ] *= rec;
							}
						} else if ( xj * CNORM[ offsetCNORM + ( j * sc ) ] > ( BIGNUM - xmax ) ) {
							zdscal( N, HALF, x, strideX, offsetX );
							scale[ 0 ] *= HALF;
						}

						if ( upper ) {
							if ( j > 0 ) {
								// Update x(0..j-1): packed column j has off-diag elements at ip - sap, ip - 2*sap, ...
								zaxpy( j, new Complex128( -xv[ jr ] * tscal, -xv[ ji ] * tscal ), AP, strideAP, ( ip / 2 ) - j, x, strideX, offsetX );
								i = izamax( j, x, strideX, offsetX );
								xmax = cabs1( xv, ox + ( i * sx ) );
							}
						} else if ( j < N - 1 ) {
							zaxpy( N - j - 1, new Complex128( -xv[ jr ] * tscal, -xv[ ji ] * tscal ), AP, strideAP, ( ip / 2 ) + 1, x, strideX, offsetX + ( ( j + 1 ) * strideX ) );
							i = j + 1 + izamax( N - j - 1, x, strideX, offsetX + ( ( j + 1 ) * strideX ) );
							xmax = cabs1( xv, ox + ( i * sx ) );
						}

						// Update ip for next column (Fortran: upper IP-=J, lower IP+=N-J+1; J is 1-based)
						if ( upper ) {
							ip -= ( j + 1 ) * sap;
						} else {
							ip += ( N - j ) * sap;
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
						if ( CNORM[ offsetCNORM + ( j * sc ) ] > ONE ) {
							rec /= CNORM[ offsetCNORM + ( j * sc ) ];
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
						xv[ ox + ( i * sx ) ] = ZERO;
						xv[ ox + ( i * sx ) + 1 ] = ZERO;
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
					if ( CNORM[ offsetCNORM + ( j * sc ) ] > ( BIGNUM - xmax ) * rec ) {
						rec *= HALF;
						zdscal( N, rec, x, strideX, offsetX );
						scale[ 0 ] *= rec;
					}
				} else if ( xj * CNORM[ offsetCNORM + ( j * sc ) ] > ( BIGNUM - xmax ) ) {
					zdscal( N, HALF, x, strideX, offsetX );
					scale[ 0 ] *= HALF;
				}

				if ( upper ) {
					if ( j > 0 ) {
						zaxpy( j, new Complex128( -xv[ jr ] * tscal, -xv[ ji ] * tscal ), AP, strideAP, ( ip / 2 ) - j, x, strideX, offsetX );
						i = izamax( j, x, strideX, offsetX );
						xmax = cabs1( xv, ox + ( i * sx ) );
					}
				} else if ( j < N - 1 ) {
					zaxpy( N - j - 1, new Complex128( -xv[ jr ] * tscal, -xv[ ji ] * tscal ), AP, strideAP, ( ip / 2 ) + 1, x, strideX, offsetX + ( ( j + 1 ) * strideX ) );
					i = j + 1 + izamax( N - j - 1, x, strideX, offsetX + ( ( j + 1 ) * strideX ) );
					xmax = cabs1( xv, ox + ( i * sx ) );
				}

				// Update ip for next column (Fortran: upper IP-=J, lower IP+=N-J+1; J is 1-based)
				if ( upper ) {
					ip -= ( j + 1 ) * sap;
				} else {
					ip += ( N - j ) * sap;
				}
			}
		} else if ( trans === 'transpose' ) {
			// Solve A^T*x = b (transpose, non-conjugate)
			// ip tracks the Float64 index of diagonal element A(j,j)
			// Fortran: IP = JFIRST*(JFIRST+1)/2 (works for both upper/lower)
			ip = ( offsetAP + ( ( jfirst * ( jfirst + 1 ) ) / 2 ) + jfirst ) * 2;
			jlen = 1;
			for ( j = jfirst; j !== jlast; j += jinc ) {
				jr = ox + ( j * sx );
				ji = jr + 1;
				xj = cabs1( xv, jr );
				uscal_re = tscal;
				uscal_im = ZERO;
				rec = ONE / Math.max( xmax, ONE );

				if ( CNORM[ offsetCNORM + ( j * sc ) ] > ( BIGNUM - xj ) * rec ) {
					rec *= HALF;
					if ( nounit ) {
						tjjs_re = av[ ip ] * tscal;
						tjjs_im = av[ ip + 1 ] * tscal;
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

				computeTransposeSum( av, xv, sap, ox, sx, ip, j, N, uscal_re, uscal_im, tscal, upper, false, AP, x, strideAP, strideX, offsetAP, offsetX, csumj );

				if ( uscal_re === tscal && uscal_im === ZERO ) {
					xv[ jr ] -= csumj[ 0 ];
					xv[ ji ] -= csumj[ 1 ];
					xj = cabs1( xv, jr );

					if ( nounit ) {
						tjjs_re = av[ ip ] * tscal;
						tjjs_im = av[ ip + 1 ] * tscal;
					} else {
						tjjs_re = tscal;
						tjjs_im = ZERO;
						if ( tscal === ONE ) {
							xmax = Math.max( xmax, cabs1( xv, jr ) );
							jlen += 1;
							if ( upper ) {
								ip += jlen * sap;
							} else {
								ip -= jlen * sap;
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
							xv[ ox + ( i * sx ) ] = ZERO;
							xv[ ox + ( i * sx ) + 1 ] = ZERO;
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
				jlen += 1;
				if ( upper ) {
					ip += jlen * sap;
				} else {
					ip -= jlen * sap;
				}
			}
		} else {
			// Solve A^H*x = b (conjugate transpose)
			// Fortran: IP = JFIRST*(JFIRST+1)/2 (works for both upper/lower)
			ip = ( offsetAP + ( ( jfirst * ( jfirst + 1 ) ) / 2 ) + jfirst ) * 2;
			jlen = 1;
			for ( j = jfirst; j !== jlast; j += jinc ) {
				jr = ox + ( j * sx );
				ji = jr + 1;
				xj = cabs1( xv, jr );
				uscal_re = tscal;
				uscal_im = ZERO;
				rec = ONE / Math.max( xmax, ONE );

				if ( CNORM[ offsetCNORM + ( j * sc ) ] > ( BIGNUM - xj ) * rec ) {
					rec *= HALF;
					if ( nounit ) {
						// Tjjs = conj(AP(j,j)) * tscal
						tjjs_re = av[ ip ] * tscal;
						tjjs_im = -av[ ip + 1 ] * tscal;
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

				computeTransposeSum( av, xv, sap, ox, sx, ip, j, N, uscal_re, uscal_im, tscal, upper, true, AP, x, strideAP, strideX, offsetAP, offsetX, csumj );

				if ( uscal_re === tscal && uscal_im === ZERO ) {
					xv[ jr ] -= csumj[ 0 ];
					xv[ ji ] -= csumj[ 1 ];
					xj = cabs1( xv, jr );

					if ( nounit ) {
						tjjs_re = av[ ip ] * tscal;
						tjjs_im = -av[ ip + 1 ] * tscal;
					} else {
						tjjs_re = tscal;
						tjjs_im = ZERO;
						if ( tscal === ONE ) {
							xmax = Math.max( xmax, cabs1( xv, jr ) );
							jlen += 1;
							if ( upper ) {
								ip += jlen * sap;
							} else {
								ip -= jlen * sap;
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
							xv[ ox + ( i * sx ) ] = ZERO;
							xv[ ox + ( i * sx ) + 1 ] = ZERO;
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
				jlen += 1;
				if ( upper ) {
					ip += jlen * sap;
				} else {
					ip -= jlen * sap;
				}
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

export default zlatps;
