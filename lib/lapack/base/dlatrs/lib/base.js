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

/* eslint-disable max-len, max-params */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dasum from './../../../../blas/base/dasum/lib/base.js';
import daxpy from './../../../../blas/base/daxpy/lib/base.js';
import ddot from './../../../../blas/base/ddot/lib/base.js';
import dscal from './../../../../blas/base/dscal/lib/base.js';
import dtrsv from './../../../../blas/base/dtrsv/lib/base.js';
import idamax from './../../../../blas/base/idamax/lib/base.js';
import dlange from '../../dlange/lib/base.js';


// VARIABLES //

// DLAMCH('S') / DLAMCH('E') => safe minimum / precision
var SMLNUM = 2.2250738585072014e-308 / 1.1102230246251565e-16; // smlnum / eps
var BIGNUM = 1.0 / SMLNUM;
var HALF = 0.5;
var RMAX = 1.7976931348623157e+308; // DLAMCH('O')


// MAIN //

/**
* Solves a triangular system with scaling to prevent overflow.
*
* `A*x = s*b  (trans = 'no-transpose')`
* `A^T*x = s*b`  (trans = 'transpose' or 'C')
*
* where A is an N-by-N triangular matrix, x and b are N-vectors, and s is a
* scaling factor chosen to prevent overflow. The scale factor s is returned
* in `scale[0]`.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {string} normin - `'yes'` if CNORM contains column norms on input, `'no'` to compute them
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - N-by-N triangular matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} x - in/out right-hand side vector of length N
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} scale - out: scale[0] is the scale factor s
* @param {Float64Array} CNORM - in/out column norm array of length N
* @param {integer} strideCNORM - stride length for `CNORM`
* @param {NonNegativeInteger} offsetCNORM - starting index for `CNORM`
* @returns {integer} info - 0 if successful
*/
function dlatrs( uplo, trans, diag, normin, N, A, strideA1, strideA2, offsetA, x, strideX, offsetX, scale, CNORM, strideCNORM, offsetCNORM ) {
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
	var work;
	var rec;
	var tjj;
	var sa1;
	var sa2;
	var xj;
	var sc;
	var ci;
	var j;
	var i;

	sa1 = strideA1;
	sa2 = strideA2;
	sc = strideCNORM;

	upper = ( uplo === 'upper' );
	notran = ( trans === 'no-transpose' );
	nounit = ( diag === 'non-unit' );

	scale[ 0 ] = 1.0;
	if ( N === 0 ) {
		return 0;
	}

	// Compute column norms if not provided
	if ( normin === 'no' ) {
		if ( upper ) {
			for ( j = 0; j < N; j++ ) {
				CNORM[ offsetCNORM + (j * sc) ] = dasum( j, A, sa1, offsetA + (j * sa2) );
			}
		} else {
			for ( j = 0; j < N - 1; j++ ) {
				CNORM[ offsetCNORM + (j * sc) ] = dasum( N - j - 1, A, sa1, offsetA + (( j + 1 ) * sa1) + (j * sa2) );
			}
			CNORM[ offsetCNORM + (( N - 1 ) * sc) ] = 0.0;
		}
	}

	// Scale CNORM if overflow would occur during growth estimation
	imax = idamax( N, CNORM, sc, offsetCNORM );
	tmax = CNORM[ offsetCNORM + (imax * sc) ];
	if ( tmax <= BIGNUM ) {
		tscal = 1.0;
	} else if ( tmax <= RMAX ) {
		tscal = 1.0 / ( SMLNUM * tmax );
		dscal( N, tscal, CNORM, sc, offsetCNORM );
	} else {
		// Overflow even after scaling — recompute using dlange
		tmax = 0.0;
		work = new Float64Array( 1 );
		if ( upper ) {
			for ( j = 1; j < N; j++ ) {
				tmax = Math.max(dlange( 'max', j, 1, A, sa1, sa2, offsetA + (j * sa2), work, 1, 0 ), tmax);
			}
		} else {
			for ( j = 0; j < N - 1; j++ ) {
				tmax = Math.max(dlange( 'max', N - j - 1, 1, A, sa1, sa2, offsetA + (( j + 1 ) * sa1) + (j * sa2), work, 1, 0 ), tmax);
			}
		}
		if ( tmax <= RMAX ) {
			tscal = 1.0 / ( SMLNUM * tmax );
			for ( j = 0; j < N; j++ ) {
				ci = offsetCNORM + (j * sc);
				if ( CNORM[ ci ] <= RMAX ) {
					CNORM[ ci ] *= tscal;
				} else {
					// Recompute from scratch
					CNORM[ ci ] = 0.0;
					if ( upper ) {
						for ( i = 0; i < j; i++ ) {
							CNORM[ ci ] += tscal * Math.abs( A[ offsetA + (i * sa1) + (j * sa2) ] );
						}
					} else {
						for ( i = j + 1; i < N; i++ ) {
							CNORM[ ci ] += tscal * Math.abs( A[ offsetA + (i * sa1) + (j * sa2) ] );
						}
					}
				}
			}
		} else {
			// tmax is so large we just do a plain dtrsv
			dtrsv( uplo, trans, diag, N, A, sa1, sa2, offsetA, x, strideX, offsetX );
			return 0;
		}
	}

	// Determine iteration order and compute initial growth bound
	j = idamax( N, x, strideX, offsetX );
	xmax = Math.abs( x[ offsetX + (j * strideX) ] );
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
			// Non-transpose, non-unit diagonal
			grow = 1.0 / Math.max( xbnd, SMLNUM );
			xbnd = grow;
			for ( j = jfirst; j !== jlast; j += jinc ) {
				if ( grow <= SMLNUM ) {
					break;
				}
				tjj = Math.abs( A[ offsetA + (j * sa1) + (j * sa2) ] );
				xbnd = Math.min( xbnd, Math.min( 1.0, tjj ) * grow );
				if ( tjj + CNORM[ offsetCNORM + (j * sc) ] >= SMLNUM ) {
					grow *= ( tjj / ( tjj + CNORM[ offsetCNORM + (j * sc) ] ) );
				} else {
					grow = 0.0;
				}
			}
			grow = xbnd;
		} else {
			// Non-transpose, unit diagonal
			grow = Math.min( 1.0, 1.0 / Math.max( xbnd, SMLNUM ) );
			for ( j = jfirst; j !== jlast; j += jinc ) {
				if ( grow <= SMLNUM ) {
					break;
				}
				grow *= ( 1.0 / ( 1.0 + CNORM[ offsetCNORM + (j * sc) ] ) );
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
			for ( j = jfirst; j !== jlast; j += jinc ) {
				if ( grow <= SMLNUM ) {
					break;
				}
				xj = 1.0 + CNORM[ offsetCNORM + (j * sc) ];
				grow = Math.min( grow, xbnd / xj );
				tjj = Math.abs( A[ offsetA + (j * sa1) + (j * sa2) ] );
				if ( xj > tjj ) {
					xbnd *= ( tjj / xj );
				}
			}
			grow = Math.min( grow, xbnd );
		} else {
			grow = Math.min( 1.0, 1.0 / Math.max( xbnd, SMLNUM ) );
			for ( j = jfirst; j !== jlast; j += jinc ) {
				if ( grow <= SMLNUM ) {
					break;
				}
				xj = 1.0 + CNORM[ offsetCNORM + (j * sc) ];
				grow /= xj;
			}
		}
	}

	if ( ( grow * tscal ) > SMLNUM ) {
		// Use the fast path (dtrsv)
		dtrsv( uplo, trans, diag, N, A, sa1, sa2, offsetA, x, strideX, offsetX );
	} else {
		// Use the careful solve path
		if ( xmax > BIGNUM ) {
			scale[ 0 ] = BIGNUM / xmax;
			dscal( N, scale[ 0 ], x, strideX, offsetX );
			xmax = BIGNUM;
		}

		if ( notran ) {
			// Solve A * x = b (non-transpose)
			for ( j = jfirst; j !== jlast; j += jinc ) {
				xj = Math.abs( x[ offsetX + (j * strideX) ] );
				if ( nounit ) {
					tjjs = A[ offsetA + (j * sa1) + (j * sa2) ] * tscal;
				} else {
					tjjs = tscal;
					if ( tscal === 1.0 ) {
						// Skip diagonal division for unit diagonal
						// (Go to label 100 in Fortran)
						// Update xj after "division"
						xj = Math.abs( x[ offsetX + (j * strideX) ] );

						// Fall through to the off-diagonal update
						if ( xj > 1.0 ) {
							rec = 1.0 / xj;
							if ( CNORM[ offsetCNORM + (j * sc) ] > ( BIGNUM - xmax ) * rec ) {
								rec *= HALF;
								dscal( N, rec, x, strideX, offsetX );
								scale[ 0 ] *= rec;
							}
						} else if ( xj * CNORM[ offsetCNORM + (j * sc) ] > ( BIGNUM - xmax ) ) {
							dscal( N, HALF, x, strideX, offsetX );
							scale[ 0 ] *= HALF;
						}

						if ( upper ) {
							if ( j > 0 ) {
								daxpy( j, -(x[ offsetX + (j * strideX) ] * tscal), A, sa1, offsetA + (j * sa2), x, strideX, offsetX );
								i = idamax( j, x, strideX, offsetX );
								xmax = Math.abs( x[ offsetX + (i * strideX) ] );
							}
						} else if ( j < N - 1 ) {
							daxpy( N - j - 1, -(x[ offsetX + (j * strideX) ] * tscal), A, sa1, offsetA + (( j + 1 ) * sa1) + (j * sa2), x, strideX, offsetX + (( j + 1 ) * strideX) );
							i = j + 1 + idamax( N - j - 1, x, strideX, offsetX + (( j + 1 ) * strideX) );
							xmax = Math.abs( x[ offsetX + (i * strideX) ] );
						}
						continue;
					}
				}
				tjj = Math.abs( tjjs );
				if ( tjj > SMLNUM ) {
					if ( tjj < 1.0 ) {
						if ( xj > tjj * BIGNUM ) {
							rec = 1.0 / xj;
							dscal( N, rec, x, strideX, offsetX );
							scale[ 0 ] *= rec;
							xmax *= rec;
						}
					}
					x[ offsetX + (j * strideX) ] /= tjjs;
					xj = Math.abs( x[ offsetX + (j * strideX) ] );
				} else if ( tjj > 0.0 ) {
					if ( xj > tjj * BIGNUM ) {
						rec = ( tjj * BIGNUM ) / xj;
						if ( CNORM[ offsetCNORM + (j * sc) ] > 1.0 ) {
							rec /= CNORM[ offsetCNORM + (j * sc) ];
						}
						dscal( N, rec, x, strideX, offsetX );
						scale[ 0 ] *= rec;
						xmax *= rec;
					}
					x[ offsetX + (j * strideX) ] /= tjjs;
					xj = Math.abs( x[ offsetX + (j * strideX) ] );
				} else {
					// tjj === 0: singular matrix
					for ( i = 0; i < N; i++ ) {
						x[ offsetX + (i * strideX) ] = 0.0;
					}
					x[ offsetX + (j * strideX) ] = 1.0;
					xj = 1.0;
					scale[ 0 ] = 0.0;
					xmax = 0.0;
				}

				// Update right-hand side with off-diagonal entries
				if ( xj > 1.0 ) {
					rec = 1.0 / xj;
					if ( CNORM[ offsetCNORM + (j * sc) ] > ( BIGNUM - xmax ) * rec ) {
						rec *= HALF;
						dscal( N, rec, x, strideX, offsetX );
						scale[ 0 ] *= rec;
					}
				} else if ( xj * CNORM[ offsetCNORM + (j * sc) ] > ( BIGNUM - xmax ) ) {
					dscal( N, HALF, x, strideX, offsetX );
					scale[ 0 ] *= HALF;
				}

				if ( upper ) {
					if ( j > 0 ) {
						daxpy( j, -(x[ offsetX + (j * strideX) ] * tscal), A, sa1, offsetA + (j * sa2), x, strideX, offsetX );
						i = idamax( j, x, strideX, offsetX );
						xmax = Math.abs( x[ offsetX + (i * strideX) ] );
					}
				} else if ( j < N - 1 ) {
					daxpy( N - j - 1, -(x[ offsetX + (j * strideX) ] * tscal), A, sa1, offsetA + (( j + 1 ) * sa1) + (j * sa2), x, strideX, offsetX + (( j + 1 ) * strideX) );
					i = j + 1 + idamax( N - j - 1, x, strideX, offsetX + (( j + 1 ) * strideX) );
					xmax = Math.abs( x[ offsetX + (i * strideX) ] );
				}
			}
		} else {
			// Solve A^T * x = b (transpose)
			for ( j = jfirst; j !== jlast; j += jinc ) {
				xj = Math.abs( x[ offsetX + (j * strideX) ] );
				uscal = tscal;
				rec = 1.0 / Math.max( xmax, 1.0 );
				if ( CNORM[ offsetCNORM + (j * sc) ] > ( BIGNUM - xj ) * rec ) {
					rec *= HALF;
					if ( nounit ) {
						tjjs = A[ offsetA + (j * sa1) + (j * sa2) ] * tscal;
					} else {
						tjjs = tscal;
					}
					tjj = Math.abs( tjjs );
					if ( tjj > 1.0 ) {
						rec = Math.min( 1.0, rec * tjj );
						uscal /= tjjs;
					}
					if ( rec < 1.0 ) {
						dscal( N, rec, x, strideX, offsetX );
						scale[ 0 ] *= rec;
						xmax *= rec;
					}
				}

				sumj = 0.0;
				if ( uscal === 1.0 ) {
					// No scaling needed for off-diagonal
					if ( upper ) {
						sumj = ddot( j, A, sa1, offsetA + (j * sa2), x, strideX, offsetX );
					} else if ( j < N - 1 ) {
						sumj = ddot( N - j - 1, A, sa1, offsetA + (( j + 1 ) * sa1) + (j * sa2), x, strideX, offsetX + (( j + 1 ) * strideX) );
					}
				} else if ( upper ) {
					// Scale each term individually
					for ( i = 0; i < j; i++ ) {
						sumj += ( A[ offsetA + (i * sa1) + (j * sa2) ] * uscal ) * x[ offsetX + (i * strideX) ];
					}
				} else if ( j < N - 1 ) {
					for ( i = j + 1; i < N; i++ ) {
						sumj += ( A[ offsetA + (i * sa1) + (j * sa2) ] * uscal ) * x[ offsetX + (i * strideX) ];
					}
				}

				if ( uscal === tscal ) {
					// No special diagonal scaling
					x[ offsetX + (j * strideX) ] -= sumj;
					xj = Math.abs( x[ offsetX + (j * strideX) ] );
					if ( nounit ) {
						tjjs = A[ offsetA + (j * sa1) + (j * sa2) ] * tscal;
					} else {
						tjjs = tscal;
						if ( tscal === 1.0 ) {
							// Unit diagonal, no division needed (label 150)
							xmax = Math.max( xmax, Math.abs( x[ offsetX + (j * strideX) ] ) );
							continue;
						}
					}

					tjj = Math.abs( tjjs );
					if ( tjj > SMLNUM ) {
						if ( tjj < 1.0 ) {
							if ( xj > tjj * BIGNUM ) {
								rec = 1.0 / xj;
								dscal( N, rec, x, strideX, offsetX );
								scale[ 0 ] *= rec;
								xmax *= rec;
							}
						}
						x[ offsetX + (j * strideX) ] /= tjjs;
					} else if ( tjj > 0.0 ) {
						if ( xj > tjj * BIGNUM ) {
							rec = ( tjj * BIGNUM ) / xj;
							dscal( N, rec, x, strideX, offsetX );
							scale[ 0 ] *= rec;
							xmax *= rec;
						}
						x[ offsetX + (j * strideX) ] /= tjjs;
					} else {
						// Singular
						for ( i = 0; i < N; i++ ) {
							x[ offsetX + (i * strideX) ] = 0.0;
						}
						x[ offsetX + (j * strideX) ] = 1.0;
						scale[ 0 ] = 0.0;
						xmax = 0.0;
					}
				} else {
					// uscal !== tscal: already divided
					x[ offsetX + (j * strideX) ] = (x[ offsetX + (j * strideX) ] / tjjs) - sumj;
				}
				xmax = Math.max( xmax, Math.abs( x[ offsetX + (j * strideX) ] ) );
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

export default dlatrs;
