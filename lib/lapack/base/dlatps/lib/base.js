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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines, max-lines-per-function */

// MODULES //

import dasum from './../../../../blas/base/dasum/lib/base.js';
import daxpy from './../../../../blas/base/daxpy/lib/base.js';
import ddot from './../../../../blas/base/ddot/lib/base.js';
import dscal from './../../../../blas/base/dscal/lib/base.js';
import dtpsv from './../../../../blas/base/dtpsv/lib/base.js';
import idamax from './../../../../blas/base/idamax/lib/base.js';


// VARIABLES //

// DLAMCH('S') / DLAMCH('E') => safe minimum / precision
var SMLNUM = 2.2250738585072014e-308 / 1.1102230246251565e-16; // smlnum / eps
var BIGNUM = 1.0 / SMLNUM;
var HALF = 0.5;


// FUNCTIONS //

/**
* Returns the 0-based packed index of the diagonal element for column j.
*
* Upper packed (column-major): diagonal of column j is at (j+1)(j+2)/2 - 1.
* Lower packed (column-major): diagonal of column j is at j(2N-j+1)/2.
*
* @private
* @param {boolean} upper - whether the matrix is upper triangular
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} j - column index (0-based)
* @returns {NonNegativeInteger} 0-based packed index
*/
function diagIP( upper, N, j ) {
	if ( upper ) {
		return ( ( ( j + 1 ) * ( j + 2 ) ) / 2 ) - 1;
	}
	return ( j * ( ( 2 * N ) - j + 1 ) ) / 2;
}


// MAIN //

/**
* Solves a triangular system with scaling to prevent overflow (packed storage).
*
* `A*x = s*b  (trans = 'no-transpose')`
* `A^T*x = s*b  (trans = 'transpose')`
*
* where A is an N-by-N triangular matrix stored in packed form, x and b are
* N-vectors, and s is a scaling factor chosen to prevent overflow. The scale
* factor s is returned in `scale[0]`.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {string} normin - `'yes'` if CNORM contains column norms on input, `'no'` to compute them
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} AP - packed triangular matrix of length N*(N+1)/2
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} x - in/out right-hand side vector of length N
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} scale - out: scale[0] is the scale factor s
* @param {Float64Array} CNORM - in/out column norm array of length N
* @param {integer} strideCNORM - stride length for `CNORM`
* @param {NonNegativeInteger} offsetCNORM - starting index for `CNORM`
* @returns {integer} info - 0 if successful
*/
function dlatps( uplo, trans, diag, normin, N, AP, strideAP, offsetAP, x, strideX, offsetX, scale, CNORM, strideCNORM, offsetCNORM ) {
	var notran;
	var nounit;
	var jfirst;
	var upper;
	var tscal;
	var uscal;
	var jlast;
	var xbnd;
	var xmax;
	var grow;
	var sumj;
	var tjjs;
	var tmax;
	var imax;
	var jinc;
	var jlen;
	var rec;
	var tjj;
	var ip;
	var xj;
	var sc;
	var sx;
	var sa;
	var j;
	var i;

	sx = strideX;
	sc = strideCNORM;
	sa = strideAP;

	upper = ( uplo === 'upper' );
	notran = ( trans === 'no-transpose' );
	nounit = ( diag === 'non-unit' );

	scale[ 0 ] = 1.0;
	if ( N === 0 ) {
		return 0;
	}

	// Compute column norms if not provided...
	if ( normin === 'no' ) {
		if ( upper ) {
			ip = 0;
			for ( j = 0; j < N; j++ ) {
				// Column j has j off-diagonal elements starting at position ip
				CNORM[ offsetCNORM + ( j * sc ) ] = dasum( j, AP, sa, offsetAP + ( ip * sa ) );
				ip += ( j + 1 );
			}
		} else {
			ip = 0;
			for ( j = 0; j < N - 1; j++ ) {
				// Off-diagonal elements start at ip+1
				CNORM[ offsetCNORM + ( j * sc ) ] = dasum( N - j - 1, AP, sa, offsetAP + ( ( ip + 1 ) * sa ) );
				ip += ( N - j );
			}
			CNORM[ offsetCNORM + ( ( N - 1 ) * sc ) ] = 0.0;
		}
	}

	// Scale CNORM if overflow would occur
	imax = idamax( N, CNORM, sc, offsetCNORM );
	tmax = CNORM[ offsetCNORM + ( imax * sc ) ];
	if ( tmax <= BIGNUM ) {
		tscal = 1.0;
	} else {
		tscal = 1.0 / ( SMLNUM * tmax );
		dscal( N, tscal, CNORM, sc, offsetCNORM );
	}

	// Determine iteration order
	j = idamax( N, x, sx, offsetX );
	xmax = Math.abs( x[ offsetX + ( j * sx ) ] );
	xbnd = xmax;

	if ( notran ) {
		if ( upper ) {
			jfirst = N - 1;
			jlast = -1;
			jinc = -1;
		} else {
			jfirst = 0;
			jlast = N;
			jinc = 1;
		}

		if ( tscal !== 1.0 ) {
			grow = 0.0;
		} else if ( nounit ) {
			// Non-transpose, non-unit: compute growth bound
			grow = 1.0 / Math.max( xbnd, SMLNUM );
			xbnd = grow;
			ip = diagIP( upper, N, jfirst );
			jlen = N;
			for ( j = jfirst; j !== jlast; j += jinc ) {
				if ( grow <= SMLNUM ) {
					break;
				}
				tjj = Math.abs( AP[ offsetAP + ( ip * sa ) ] );
				xbnd = Math.min( xbnd, Math.min( 1.0, tjj ) * grow );
				if ( tjj + CNORM[ offsetCNORM + ( j * sc ) ] >= SMLNUM ) {
					grow *= ( tjj / ( tjj + CNORM[ offsetCNORM + ( j * sc ) ] ) );
				} else {
					grow = 0.0;
				}
				// Advance ip: matches Fortran IP = IP + JINC*JLEN; JLEN = JLEN - 1
				ip += jinc * jlen;
				jlen -= 1;
			}
			grow = xbnd;
		} else {
			// Non-transpose, unit diagonal
			grow = Math.min( 1.0, 1.0 / Math.max( xbnd, SMLNUM ) );
			for ( j = jfirst; j !== jlast; j += jinc ) {
				if ( grow <= SMLNUM ) {
					break;
				}
				grow *= ( 1.0 / ( 1.0 + CNORM[ offsetCNORM + ( j * sc ) ] ) );
			}
		}
	} else {
		// Transpose
		if ( upper ) {
			jfirst = 0;
			jlast = N;
			jinc = 1;
		} else {
			jfirst = N - 1;
			jlast = -1;
			jinc = -1;
		}

		if ( tscal !== 1.0 ) {
			grow = 0.0;
		} else if ( nounit ) {
			grow = 1.0 / Math.max( xbnd, SMLNUM );
			xbnd = grow;
			ip = diagIP( upper, N, jfirst );
			jlen = 1;
			for ( j = jfirst; j !== jlast; j += jinc ) {
				if ( grow <= SMLNUM ) {
					break;
				}
				xj = 1.0 + CNORM[ offsetCNORM + ( j * sc ) ];
				grow = Math.min( grow, xbnd / xj );
				tjj = Math.abs( AP[ offsetAP + ( ip * sa ) ] );
				if ( xj > tjj ) {
					xbnd *= ( tjj / xj );
				}
				jlen += 1;
				ip += jinc * jlen;
			}
			grow = Math.min( grow, xbnd );
		} else {
			grow = Math.min( 1.0, 1.0 / Math.max( xbnd, SMLNUM ) );
			for ( j = jfirst; j !== jlast; j += jinc ) {
				if ( grow <= SMLNUM ) {
					break;
				}
				xj = 1.0 + CNORM[ offsetCNORM + ( j * sc ) ];
				grow /= xj;
			}
		}
	}

	if ( ( grow * tscal ) > SMLNUM ) {
		// Fast path: use dtpsv
		dtpsv( uplo, trans, diag, N, AP, sa, offsetAP, x, sx, offsetX );
	} else {
		// Careful solve path
		if ( xmax > BIGNUM ) {
			scale[ 0 ] = BIGNUM / xmax;
			dscal( N, scale[ 0 ], x, sx, offsetX );
			xmax = BIGNUM;
		}

		if ( notran ) {
			// Solve A * x = b (non-transpose)
			ip = diagIP( upper, N, jfirst );
			for ( j = jfirst; j !== jlast; j += jinc ) {
				xj = Math.abs( x[ offsetX + ( j * sx ) ] );
				if ( nounit ) {
					tjjs = AP[ offsetAP + ( ip * sa ) ] * tscal;
				} else {
					tjjs = tscal;
					if ( tscal === 1.0 ) {
						// Unit diagonal: skip division (label 100 in Fortran)
						xj = Math.abs( x[ offsetX + ( j * sx ) ] );
						if ( xj > 1.0 ) {
							rec = 1.0 / xj;
							if ( CNORM[ offsetCNORM + ( j * sc ) ] > ( BIGNUM - xmax ) * rec ) {
								rec *= HALF;
								dscal( N, rec, x, sx, offsetX );
								scale[ 0 ] *= rec;
							}
						} else if ( xj * CNORM[ offsetCNORM + ( j * sc ) ] > ( BIGNUM - xmax ) ) {
							dscal( N, HALF, x, sx, offsetX );
							scale[ 0 ] *= HALF;
						}

						if ( upper ) {
							if ( j > 0 ) {
								// x(0:j-1) -= x(j)*tscal * AP(ip-j..ip-1)
								daxpy( j, -( x[ offsetX + ( j * sx ) ] * tscal ), AP, sa, offsetAP + ( ( ip - j ) * sa ), x, sx, offsetX );
								i = idamax( j, x, sx, offsetX );
								xmax = Math.abs( x[ offsetX + ( i * sx ) ] );
							}
							// Move to previous column diagonal: ip -= (j+1)
							// Fortran: IP = IP - J (1-based J = j+1)
							ip -= ( j + 1 );
						} else {
							if ( j < N - 1 ) {
								daxpy( N - j - 1, -( x[ offsetX + ( j * sx ) ] * tscal ), AP, sa, offsetAP + ( ( ip + 1 ) * sa ), x, sx, offsetX + ( ( j + 1 ) * sx ) );
								i = j + 1 + idamax( N - j - 1, x, sx, offsetX + ( ( j + 1 ) * sx ) );
								xmax = Math.abs( x[ offsetX + ( i * sx ) ] );
							}
							// Move to next column diagonal: ip += (N-j)
							// Fortran: IP = IP + N - J + 1 (1-based J = j+1, so N-(j+1)+1 = N-j)
							ip += ( N - j );
						}
						continue;
					}
				}
				tjj = Math.abs( tjjs );
				if ( tjj > SMLNUM ) {
					if ( tjj < 1.0 ) {
						if ( xj > tjj * BIGNUM ) {
							rec = 1.0 / xj;
							dscal( N, rec, x, sx, offsetX );
							scale[ 0 ] *= rec;
							xmax *= rec;
						}
					}
					x[ offsetX + ( j * sx ) ] /= tjjs;
					xj = Math.abs( x[ offsetX + ( j * sx ) ] );
				} else if ( tjj > 0.0 ) {
					if ( xj > tjj * BIGNUM ) {
						rec = ( tjj * BIGNUM ) / xj;
						if ( CNORM[ offsetCNORM + ( j * sc ) ] > 1.0 ) {
							rec /= CNORM[ offsetCNORM + ( j * sc ) ];
						}
						dscal( N, rec, x, sx, offsetX );
						scale[ 0 ] *= rec;
						xmax *= rec;
					}
					x[ offsetX + ( j * sx ) ] /= tjjs;
					xj = Math.abs( x[ offsetX + ( j * sx ) ] );
				} else {
					for ( i = 0; i < N; i++ ) {
						x[ offsetX + ( i * sx ) ] = 0.0;
					}
					x[ offsetX + ( j * sx ) ] = 1.0;
					xj = 1.0;
					scale[ 0 ] = 0.0;
					xmax = 0.0;
				}

				// Scale x if necessary to avoid overflow when adding column
				if ( xj > 1.0 ) {
					rec = 1.0 / xj;
					if ( CNORM[ offsetCNORM + ( j * sc ) ] > ( BIGNUM - xmax ) * rec ) {
						rec *= HALF;
						dscal( N, rec, x, sx, offsetX );
						scale[ 0 ] *= rec;
					}
				} else if ( xj * CNORM[ offsetCNORM + ( j * sc ) ] > ( BIGNUM - xmax ) ) {
					dscal( N, HALF, x, sx, offsetX );
					scale[ 0 ] *= HALF;
				}

				if ( upper ) {
					if ( j > 0 ) {
						daxpy( j, -( x[ offsetX + ( j * sx ) ] * tscal ), AP, sa, offsetAP + ( ( ip - j ) * sa ), x, sx, offsetX );
						i = idamax( j, x, sx, offsetX );
						xmax = Math.abs( x[ offsetX + ( i * sx ) ] );
					}
					ip -= ( j + 1 );
				} else {
					if ( j < N - 1 ) {
						daxpy( N - j - 1, -( x[ offsetX + ( j * sx ) ] * tscal ), AP, sa, offsetAP + ( ( ip + 1 ) * sa ), x, sx, offsetX + ( ( j + 1 ) * sx ) );
						i = j + 1 + idamax( N - j - 1, x, sx, offsetX + ( ( j + 1 ) * sx ) );
						xmax = Math.abs( x[ offsetX + ( i * sx ) ] );
					}
					ip += ( N - j );
				}
			}
		} else {
			// Solve A^T * x = b (transpose)
			ip = diagIP( upper, N, jfirst );
			jlen = 1;
			for ( j = jfirst; j !== jlast; j += jinc ) {
				xj = Math.abs( x[ offsetX + ( j * sx ) ] );
				uscal = tscal;
				rec = 1.0 / Math.max( xmax, 1.0 );
				if ( CNORM[ offsetCNORM + ( j * sc ) ] > ( BIGNUM - xj ) * rec ) {
					rec *= HALF;
					if ( nounit ) {
						tjjs = AP[ offsetAP + ( ip * sa ) ] * tscal;
					} else {
						tjjs = tscal;
					}
					tjj = Math.abs( tjjs );
					if ( tjj > 1.0 ) {
						rec = Math.min( 1.0, rec * tjj );
						uscal /= tjjs;
					}
					if ( rec < 1.0 ) {
						dscal( N, rec, x, sx, offsetX );
						scale[ 0 ] *= rec;
						xmax *= rec;
					}
				}

				sumj = 0.0;
				if ( uscal === 1.0 ) {
					if ( upper ) {
						sumj = ddot( j, AP, sa, offsetAP + ( ( ip - j ) * sa ), x, sx, offsetX );
					} else if ( j < N - 1 ) {
						sumj = ddot( N - j - 1, AP, sa, offsetAP + ( ( ip + 1 ) * sa ), x, sx, offsetX + ( ( j + 1 ) * sx ) );
					}
				} else if ( upper ) {
					for ( i = 0; i < j; i++ ) {
						sumj += ( AP[ offsetAP + ( ( ip - j + i ) * sa ) ] * uscal ) * x[ offsetX + ( i * sx ) ];
					}
				} else if ( j < N - 1 ) {
					for ( i = 1; i <= N - j - 1; i++ ) {
						sumj += ( AP[ offsetAP + ( ( ip + i ) * sa ) ] * uscal ) * x[ offsetX + ( ( j + i ) * sx ) ];
					}
				}

				if ( uscal === tscal ) {
					x[ offsetX + ( j * sx ) ] -= sumj;
					xj = Math.abs( x[ offsetX + ( j * sx ) ] );
					if ( nounit ) {
						tjjs = AP[ offsetAP + ( ip * sa ) ] * tscal;
					} else {
						tjjs = tscal;
						if ( tscal === 1.0 ) {
							// Unit diagonal (label 150)
							xmax = Math.max( xmax, Math.abs( x[ offsetX + ( j * sx ) ] ) );
							jlen += 1;
							ip += jinc * jlen;
							continue;
						}
					}

					tjj = Math.abs( tjjs );
					if ( tjj > SMLNUM ) {
						if ( tjj < 1.0 ) {
							if ( xj > tjj * BIGNUM ) {
								rec = 1.0 / xj;
								dscal( N, rec, x, sx, offsetX );
								scale[ 0 ] *= rec;
								xmax *= rec;
							}
						}
						x[ offsetX + ( j * sx ) ] /= tjjs;
					} else if ( tjj > 0.0 ) {
						if ( xj > tjj * BIGNUM ) {
							rec = ( tjj * BIGNUM ) / xj;
							dscal( N, rec, x, sx, offsetX );
							scale[ 0 ] *= rec;
							xmax *= rec;
						}
						x[ offsetX + ( j * sx ) ] /= tjjs;
					} else {
						for ( i = 0; i < N; i++ ) {
							x[ offsetX + ( i * sx ) ] = 0.0;
						}
						x[ offsetX + ( j * sx ) ] = 1.0;
						scale[ 0 ] = 0.0;
						xmax = 0.0;
					}
				} else {
					x[ offsetX + ( j * sx ) ] = ( x[ offsetX + ( j * sx ) ] / tjjs ) - sumj;
				}
				xmax = Math.max( xmax, Math.abs( x[ offsetX + ( j * sx ) ] ) );
				jlen += 1;
				ip += jinc * jlen;
			}
		}
		scale[ 0 ] /= tscal;
	}

	// Restore CNORM if it was scaled
	if ( tscal !== 1.0 ) {
		dscal( N, 1.0 / tscal, CNORM, sc, offsetCNORM );
	}

	return 0;
}


// EXPORTS //

export default dlatps;
