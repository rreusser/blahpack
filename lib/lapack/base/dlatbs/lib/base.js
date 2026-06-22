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

/* eslint-disable max-len, max-params, max-depth */

// MODULES //

import dasum from './../../../../blas/base/dasum/lib/base.js';
import daxpy from './../../../../blas/base/daxpy/lib/base.js';
import ddot from './../../../../blas/base/ddot/lib/base.js';
import dscal from './../../../../blas/base/dscal/lib/base.js';
import dtbsv from './../../../../blas/base/dtbsv/lib/base.js';
import idamax from './../../../../blas/base/idamax/lib/base.js';


// VARIABLES //

// DLAMCH('S') / DLAMCH('E') => safe minimum / precision
var SMLNUM = 2.2250738585072014e-308 / 1.1102230246251565e-16;
var BIGNUM = 1.0 / SMLNUM;
var HALF = 0.5;


// MAIN //

/**
* Solves a triangular banded system with scaling to prevent overflow.
*
* `AB*x = s*b  (trans = 'no-transpose')`
* `AB^T*x = s*b  (trans = 'transpose')`
*
* where AB is an N-by-N upper or lower triangular band matrix with KD+1
* diagonals, x and b are N-vectors, and s is a scaling factor chosen to
* prevent overflow.
*
* @private
* @param {string} uplo - 'upper' or 'lower'
* @param {string} trans - 'no-transpose' or 'transpose'
* @param {string} diag - 'non-unit' or 'unit'
* @param {string} normin - `'yes'` if CNORM contains column norms on input, `'no'` to compute them
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} kd - number of superdiagonals (upper) or subdiagonals (lower)
* @param {Float64Array} AB - band matrix in banded storage, (KD+1) by N
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} x - in/out right-hand side vector of length N
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} scale - out: scale[0] is the scale factor s
* @param {Float64Array} CNORM - in/out column norm array of length N
* @param {integer} strideCNORM - stride length for `CNORM`
* @param {NonNegativeInteger} offsetCNORM - starting index for `CNORM`
* @returns {integer} info - 0 if successful
*/
function dlatbs( uplo, trans, diag, normin, N, kd, AB, strideAB1, strideAB2, offsetAB, x, strideX, offsetX, scale, CNORM, strideCNORM, offsetCNORM ) {
	var notran;
	var nounit;
	var jfirst;
	var upper;
	var tscal;
	var uscal;
	var jlast;
	var maind;
	var xbnd;
	var xmax;
	var jlen;
	var grow;
	var sumj;
	var tjjs;
	var tmax;
	var imax;
	var jinc;
	var rec;
	var tjj;
	var sa1;
	var sa2;
	var sx;
	var sc;
	var xj;
	var j;
	var i;

	sa1 = strideAB1;
	sa2 = strideAB2;
	sx = strideX;
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
			// For upper: off-diagonal elements of column j are in rows KD+1-JLEN..KD
			// AB(KD+1-JLEN, j) through AB(KD, j), where JLEN = min(KD, j-1)
			for ( j = 0; j < N; j++ ) {
				jlen = Math.min( kd, j );
				if ( jlen > 0 ) {
					// Elements at AB rows (KD+1-jlen)..(KD) in Fortran = rows (kd-jlen)..(kd-1) in 0-based
					CNORM[ offsetCNORM + (j * sc) ] = dasum( jlen, AB, sa1, offsetAB + ((kd - jlen) * sa1) + (j * sa2) );
				} else {
					CNORM[ offsetCNORM + (j * sc) ] = 0.0;
				}
			}
		} else {
			// For lower: off-diagonal elements of column j are in rows 2..1+JLEN
			// AB(2, j) through AB(1+JLEN, j), where JLEN = min(KD, N-j-1)
			for ( j = 0; j < N; j++ ) {
				jlen = Math.min( kd, N - j - 1 );
				if ( jlen > 0 ) {
					// Elements at AB row 2 in Fortran = row 1 in 0-based
					CNORM[ offsetCNORM + (j * sc) ] = dasum( jlen, AB, sa1, offsetAB + (1 * sa1) + (j * sa2) );
				} else {
					CNORM[ offsetCNORM + (j * sc) ] = 0.0;
				}
			}
		}
	}

	// Scale CNORM if overflow would occur during growth estimation
	imax = idamax( N, CNORM, sc, offsetCNORM );
	tmax = CNORM[ offsetCNORM + (imax * sc) ];
	if ( tmax <= BIGNUM ) {
		tscal = 1.0;
	} else {
		tscal = 1.0 / ( SMLNUM * tmax );
		dscal( N, tscal, CNORM, sc, offsetCNORM );
	}

	// Determine iteration order and main diagonal index
	// In banded storage: upper has main diagonal at row KD (0-based), lower at row 0 (0-based)
	j = idamax( N, x, sx, offsetX );
	xmax = Math.abs( x[ offsetX + (j * sx) ] );
	xbnd = xmax;

	if ( upper ) {
		maind = kd; // 0-based row index of main diagonal for upper
	} else {
		maind = 0; // 0-based row index of main diagonal for lower
	}

	if ( notran ) {
		// Solve A * x = b (non-transpose)
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
			// Non-unit diagonal: compute growth bound
			grow = 1.0 / Math.max( xbnd, SMLNUM );
			xbnd = grow;
			for ( j = jfirst; j !== jlast; j += jinc ) {
				if ( grow <= SMLNUM ) {
					break;
				}
				tjj = Math.abs( AB[ offsetAB + (maind * sa1) + (j * sa2) ] );
				xbnd = Math.min( xbnd, Math.min( 1.0, tjj ) * grow );
				if ( tjj + CNORM[ offsetCNORM + (j * sc) ] >= SMLNUM ) {
					grow *= ( tjj / ( tjj + CNORM[ offsetCNORM + (j * sc) ] ) );
				} else {
					grow = 0.0;
				}
			}
			grow = xbnd;
		} else {
			// Unit diagonal: compute growth bound
			grow = Math.min( 1.0, 1.0 / Math.max( xbnd, SMLNUM ) );
			for ( j = jfirst; j !== jlast; j += jinc ) {
				if ( grow <= SMLNUM ) {
					break;
				}
				grow *= ( 1.0 / ( 1.0 + CNORM[ offsetCNORM + (j * sc) ] ) );
			}
		}
	} else {
		// Transpose solve
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
				tjj = Math.abs( AB[ offsetAB + (maind * sa1) + (j * sa2) ] );
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
		// Use the fast path (dtbsv)
		dtbsv( uplo, trans, diag, N, kd, AB, sa1, sa2, offsetAB, x, sx, offsetX );
	} else {
		// Use the careful solve path
		if ( xmax > BIGNUM ) {
			scale[ 0 ] = BIGNUM / xmax;
			dscal( N, scale[ 0 ], x, sx, offsetX );
			xmax = BIGNUM;
		}

		if ( notran ) {
			// Solve A * x = b (non-transpose, careful)
			for ( j = jfirst; j !== jlast; j += jinc ) {
				xj = Math.abs( x[ offsetX + (j * sx) ] );
				if ( nounit ) {
					tjjs = AB[ offsetAB + (maind * sa1) + (j * sa2) ] * tscal;
				} else {
					tjjs = tscal;
					if ( tscal === 1.0 ) {
						// Unit diagonal: skip diagonal division (Fortran label 100)
						xj = Math.abs( x[ offsetX + (j * sx) ] );

						// Overflow check for off-diagonal update
						if ( xj > 1.0 ) {
							rec = 1.0 / xj;
							if ( CNORM[ offsetCNORM + (j * sc) ] > ( BIGNUM - xmax ) * rec ) {
								rec *= HALF;
								dscal( N, rec, x, sx, offsetX );
								scale[ 0 ] *= rec;
							}
						} else if ( xj * CNORM[ offsetCNORM + (j * sc) ] > ( BIGNUM - xmax ) ) {
							dscal( N, HALF, x, sx, offsetX );
							scale[ 0 ] *= HALF;
						}

						// Off-diagonal update
						if ( upper ) {
							if ( j > 0 ) {
								jlen = Math.min( kd, j );
								daxpy( jlen, -( x[ offsetX + (j * sx) ] * tscal ), AB, sa1, offsetAB + ((kd - jlen) * sa1) + (j * sa2), x, sx, offsetX + ((j - jlen) * sx) );
								i = idamax( j, x, sx, offsetX );
								xmax = Math.abs( x[ offsetX + (i * sx) ] );
							}
						} else if ( j < N - 1 ) {
							jlen = Math.min( kd, N - j - 1 );
							if ( jlen > 0 ) {
								daxpy( jlen, -( x[ offsetX + (j * sx) ] * tscal ), AB, sa1, offsetAB + (1 * sa1) + (j * sa2), x, sx, offsetX + ((j + 1) * sx) );
							}
							i = j + 1 + idamax( N - j - 1, x, sx, offsetX + ((j + 1) * sx) );
							xmax = Math.abs( x[ offsetX + (i * sx) ] );
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
					x[ offsetX + (j * sx) ] /= tjjs;
					xj = Math.abs( x[ offsetX + (j * sx) ] );
				} else if ( tjj > 0.0 ) {
					if ( xj > tjj * BIGNUM ) {
						rec = ( tjj * BIGNUM ) / xj;
						if ( CNORM[ offsetCNORM + (j * sc) ] > 1.0 ) {
							rec /= CNORM[ offsetCNORM + (j * sc) ];
						}
						dscal( N, rec, x, sx, offsetX );
						scale[ 0 ] *= rec;
						xmax *= rec;
					}
					x[ offsetX + (j * sx) ] /= tjjs;
					xj = Math.abs( x[ offsetX + (j * sx) ] );
				} else {
					// tjj === 0: singular matrix
					for ( i = 0; i < N; i++ ) {
						x[ offsetX + (i * sx) ] = 0.0;
					}
					x[ offsetX + (j * sx) ] = 1.0;
					xj = 1.0;
					scale[ 0 ] = 0.0;
					xmax = 0.0;
				}

				// Overflow check for off-diagonal update
				if ( xj > 1.0 ) {
					rec = 1.0 / xj;
					if ( CNORM[ offsetCNORM + (j * sc) ] > ( BIGNUM - xmax ) * rec ) {
						rec *= HALF;
						dscal( N, rec, x, sx, offsetX );
						scale[ 0 ] *= rec;
					}
				} else if ( xj * CNORM[ offsetCNORM + (j * sc) ] > ( BIGNUM - xmax ) ) {
					dscal( N, HALF, x, sx, offsetX );
					scale[ 0 ] *= HALF;
				}

				// Off-diagonal update using banded storage
				if ( upper ) {
					if ( j > 0 ) {
						jlen = Math.min( kd, j );

						// In upper banded storage, elements above diagonal in column j

						// Are at rows (KD+1-JLEN)..(KD) in Fortran = (kd-jlen)..(kd-1) in 0-based
						daxpy( jlen, -( x[ offsetX + (j * sx) ] * tscal ), AB, sa1, offsetAB + ((kd - jlen) * sa1) + (j * sa2), x, sx, offsetX + ((j - jlen) * sx) );
						i = idamax( j, x, sx, offsetX );
						xmax = Math.abs( x[ offsetX + (i * sx) ] );
					}
				} else if ( j < N - 1 ) {
					jlen = Math.min( kd, N - j - 1 );
					if ( jlen > 0 ) {
						// In lower banded storage, elements below diagonal in column j
						// Are at row 2 in Fortran = row 1 in 0-based
						daxpy( jlen, -( x[ offsetX + (j * sx) ] * tscal ), AB, sa1, offsetAB + (1 * sa1) + (j * sa2), x, sx, offsetX + ((j + 1) * sx) );
					}
					i = j + 1 + idamax( N - j - 1, x, sx, offsetX + ((j + 1) * sx) );
					xmax = Math.abs( x[ offsetX + (i * sx) ] );
				}
			}
		} else {
			// Solve A^T * x = b (transpose, careful)
			for ( j = jfirst; j !== jlast; j += jinc ) {
				xj = Math.abs( x[ offsetX + (j * sx) ] );
				uscal = tscal;
				rec = 1.0 / Math.max( xmax, 1.0 );
				if ( CNORM[ offsetCNORM + (j * sc) ] > ( BIGNUM - xj ) * rec ) {
					rec *= HALF;
					if ( nounit ) {
						tjjs = AB[ offsetAB + (maind * sa1) + (j * sa2) ] * tscal;
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
					// No scaling needed for off-diagonal
					if ( upper ) {
						jlen = Math.min( kd, j );
						if ( jlen > 0 ) {
							sumj = ddot( jlen, AB, sa1, offsetAB + ((kd - jlen) * sa1) + (j * sa2), x, sx, offsetX + ((j - jlen) * sx) );
						}
					} else {
						jlen = Math.min( kd, N - j - 1 );
						if ( jlen > 0 ) {
							sumj = ddot( jlen, AB, sa1, offsetAB + (1 * sa1) + (j * sa2), x, sx, offsetX + ((j + 1) * sx) );
						}
					}
				} else {
					// Scale each term individually
					if ( upper ) {
						jlen = Math.min( kd, j );
						for ( i = 0; i < jlen; i++ ) {
							// AB(KD+1-JLEN+I, J) in Fortran = AB row (kd-jlen+i) in 0-based, column j
							sumj += ( AB[ offsetAB + ((kd - jlen + i) * sa1) + (j * sa2) ] * uscal ) * x[ offsetX + ((j - jlen + i) * sx) ];
						}
					} else {
						jlen = Math.min( kd, N - j - 1 );
						for ( i = 0; i < jlen; i++ ) {
							// AB(I+2, J) in Fortran = AB row (i+1) in 0-based, column j
							sumj += ( AB[ offsetAB + ((i + 1) * sa1) + (j * sa2) ] * uscal ) * x[ offsetX + ((j + 1 + i) * sx) ];
						}
					}
				}

				if ( uscal === tscal ) {
					// No special diagonal scaling
					x[ offsetX + (j * sx) ] -= sumj;
					xj = Math.abs( x[ offsetX + (j * sx) ] );
					if ( nounit ) {
						tjjs = AB[ offsetAB + (maind * sa1) + (j * sa2) ] * tscal;
					} else {
						tjjs = tscal;
						if ( tscal === 1.0 ) {
							// Unit diagonal, no division needed (Fortran label 150)
							xmax = Math.max( xmax, Math.abs( x[ offsetX + (j * sx) ] ) );
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
						x[ offsetX + (j * sx) ] /= tjjs;
					} else if ( tjj > 0.0 ) {
						if ( xj > tjj * BIGNUM ) {
							rec = ( tjj * BIGNUM ) / xj;
							dscal( N, rec, x, sx, offsetX );
							scale[ 0 ] *= rec;
							xmax *= rec;
						}
						x[ offsetX + (j * sx) ] /= tjjs;
					} else {
						// Singular
						for ( i = 0; i < N; i++ ) {
							x[ offsetX + (i * sx) ] = 0.0;
						}
						x[ offsetX + (j * sx) ] = 1.0;
						scale[ 0 ] = 0.0;
						xmax = 0.0;
					}
				} else {
					// uscal !== tscal: already divided
					x[ offsetX + (j * sx) ] = ( x[ offsetX + (j * sx) ] / tjjs ) - sumj;
				}
				xmax = Math.max( xmax, Math.abs( x[ offsetX + (j * sx) ] ) );
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

export default dlatbs;
