/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from ARPACK (arpack-ng 3.9.1), Copyright (c) 1996-2008 Rice
* University. Developed by D.C. Sorensen, R.B. Lehoucq, C. Yang, and
* K. Maschhoff, under the BSD-3-Clause license. See LICENSE.txt in the
* repository root for the full license text and upstream attribution.
*
* dstqrb is a modification of the LAPACK routine dsteqr: it computes all
* eigenvalues and only the last row of the eigenvector matrix, so Z is a
* length-N vector rather than an N-by-N matrix.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlamch from './../../../../lapack/base/dlamch/lib/base.js';
import dlanst from './../../../../lapack/base/dlanst/lib/base.js';
import dlapy2 from './../../../../lapack/base/dlapy2/lib/base.js';
import dlae2 from './../../../../lapack/base/dlae2/lib/base.js';
import dlaev2 from './../../../../lapack/base/dlaev2/lib/base.js';
import dlartg from './../../../../lapack/base/dlartg/lib/base.js';
import dlascl from './../../../../lapack/base/dlascl/lib/base.js';
import dlasr from './../../../../lapack/base/dlasr/lib/base.js';
import dlasrt from './../../../../lapack/base/dlasrt/lib/base.js';


// VARIABLES //

const MAXIT = 30;


// MAIN //

/**
* Computes all eigenvalues and the last components of the eigenvectors of a symmetric tridiagonal matrix using the implicit QL or QR method.
*
* ## Notes
*
* -   On entry, `d` holds the diagonal and `e` the subdiagonal of the tridiagonal matrix. On exit, `d` holds the eigenvalues in ascending order, `e` is destroyed, and `Z` holds the last row of the orthonormal eigenvector matrix.
* -   This is a faithful translation of ARPACK's `dstqrb`, itself a modification of LAPACK's `dsteqr` with the eigenvector accumulation restricted to the last row (`icompz = 2`).
*
* @private
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements of the tridiagonal matrix (length N)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - subdiagonal elements of the tridiagonal matrix (length N-1)
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} Z - on exit, the last row of the orthonormal eigenvector matrix (length N)
* @param {integer} strideZ - stride length for `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Float64Array} WORK - workspace array (length >= 2*(N-1))
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} INFO - 0 if successful, >0 if INFO eigenvalues did not converge
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0 ] );
* var e = new Float64Array( [ -1.0, -1.0, -1.0 ] );
* var Z = new Float64Array( 4 );
* var WORK = new Float64Array( 6 );
*
* var info = dstqrb( 4, d, 1, 0, e, 1, 0, Z, 1, 0, WORK, 1, 0 );
* // returns 0
*/
function dstqrb( N, d, strideD, offsetD, e, strideE, offsetE, Z, strideZ, offsetZ, WORK, strideWork, offsetWork ) {
	let lendsv, iscale, anorm, info, jtot, lend, tst, obj, lsv, mm, l1, ii, zi;
	let zj, l, m, p, g, r, f, b, c, s, i, j, k;

	const rot = new Float64Array( 3 );

	info = 0;

	// New starting with ARPACK version 2.5: always accumulate the last row.
	const icompz = 2;

	if ( N === 0 ) {
		return 0;
	}

	if ( N === 1 ) {
		if ( icompz === 2 ) {
			Z[ offsetZ ] = 1.0;
		}
		return 0;
	}

	// Determine machine parameters
	const eps = dlamch( 'epsilon' );
	const eps2 = eps * eps;
	const safmin = dlamch( 'safe-minimum' );
	const safmax = 1.0 / safmin;
	const ssfmax = Math.sqrt( safmax ) / 3.0;
	const ssfmin = Math.sqrt( safmin ) / eps2;

	// Initialize Z to the last row of the identity matrix
	if ( icompz === 2 ) {
		for ( j = 0; j < N - 1; j++ ) {
			Z[ offsetZ + (j * strideZ) ] = 0.0;
		}
		Z[ offsetZ + (( N - 1 ) * strideZ) ] = 1.0;
	}

	const nmaxit = N * MAXIT;
	jtot = 0;

	// Determine where the matrix splits and choose QL or QR iteration for each block.
	l1 = 0; // 0-based

	// Outer loop (label 10 in Fortran): find unreduced blocks
	while ( l1 < N ) {
		// Zero out the subdiagonal element below l1 if l1 > 0
		if ( l1 > 0 ) {
			e[ offsetE + (( l1 - 1 ) * strideE) ] = 0.0;
		}

		// Find the end of the unreduced block: search for first negligible E(m)
		m = N - 1; // default: entire remaining matrix is unreduced
		if ( l1 <= N - 2 ) {
			for ( m = l1; m <= N - 2; m++ ) {
				tst = Math.abs( e[ offsetE + (m * strideE) ] );
				if ( tst === 0.0 ) {
					break;
				}
				if ( tst <= ( Math.sqrt( Math.abs( d[ offsetD + (m * strideD) ] ) ) * Math.sqrt( Math.abs( d[ offsetD + (( m + 1 ) * strideD) ] ) ) ) * eps ) {
					e[ offsetE + (m * strideE) ] = 0.0;
					break;
				}
			}
			if ( m > N - 2 ) {
				m = N - 1;
			}
		}

		// Label 30: set up the block [l..lend]
		l = l1;
		lsv = l;
		lend = m;
		lendsv = lend;
		l1 = m + 1;

		// If block is a single element, nothing to do — go to next block
		if ( lend === l ) {
			continue;
		}

		// Scale the block if necessary
		anorm = dlanst( 'max', lend - l + 1, d, strideD, offsetD + (l * strideD), e, strideE, offsetE + (l * strideE) );
		iscale = 0;
		if ( anorm === 0.0 ) {
			continue;
		}
		if ( anorm > ssfmax ) {
			iscale = 1;
			dlascl( 'general', 0, 0, anorm, ssfmax, lend - l + 1, 1, d, strideD, 0, offsetD + (l * strideD) );
			dlascl( 'general', 0, 0, anorm, ssfmax, lend - l, 1, e, strideE, 0, offsetE + (l * strideE) );
		} else if ( anorm < ssfmin ) {
			iscale = 2;
			dlascl( 'general', 0, 0, anorm, ssfmin, lend - l + 1, 1, d, strideD, 0, offsetD + (l * strideD) );
			dlascl( 'general', 0, 0, anorm, ssfmin, lend - l, 1, e, strideE, 0, offsetE + (l * strideE) );
		}

		// Choose QL or QR iteration based on which end has smaller |D| element
		if ( Math.abs( d[ offsetD + (lend * strideD) ] ) < Math.abs( d[ offsetD + (l * strideD) ] ) ) {
			lend = lsv;
			l = lendsv;
		}

		if ( lend > l ) {
			// QL iteration
			while ( true ) {
				// Look for small subdiagonal element (label 40 -> 50 -> 60)
				if ( l === lend ) {
					m = lend;
				} else {
					for ( m = l; m <= lend - 1; m++ ) {
						tst = Math.abs( e[ offsetE + (m * strideE) ] );
						tst *= tst;
						if ( tst <= (( eps2 * Math.abs( d[ offsetD + (m * strideD) ] ) ) * Math.abs( d[ offsetD + (( m + 1 ) * strideD) ] )) + safmin ) {
							break;
						}
					}
					if ( m > lend - 1 ) {
						m = lend;
					}
				}

				if ( m < lend ) {
					e[ offsetE + (m * strideE) ] = 0.0;
				}
				p = d[ offsetD + (l * strideD) ];

				// If m === l, single eigenvalue has converged (label 80)
				if ( m === l ) {
					d[ offsetD + (l * strideD) ] = p;
					l += 1;
					if ( l <= lend ) {
						continue;
					}
					break;
				}

				// If m === l + 1, use direct 2x2 eigenvalue computation
				if ( m === l + 1 ) {
					if ( icompz > 0 ) {
						obj = dlaev2( d[ offsetD + (l * strideD) ], e[ offsetE + (l * strideE) ], d[ offsetD + (( l + 1 ) * strideD) ] );
						c = obj.cs1;
						s = obj.sn1;
						WORK[ offsetWork + (l * strideWork) ] = c;
						WORK[ offsetWork + (( N - 1 + l ) * strideWork) ] = s;

						// Apply the rotation directly to the last row of Z
						tst = Z[ offsetZ + (( l + 1 ) * strideZ) ];
						Z[ offsetZ + (( l + 1 ) * strideZ) ] = (c * tst) - (s * Z[ offsetZ + (l * strideZ) ]);
						Z[ offsetZ + (l * strideZ) ] = (s * tst) + (c * Z[ offsetZ + (l * strideZ) ]);
					} else {
						obj = dlae2( d[ offsetD + (l * strideD) ], e[ offsetE + (l * strideE) ], d[ offsetD + (( l + 1 ) * strideD) ] );
					}
					d[ offsetD + (l * strideD) ] = obj.rt1;
					d[ offsetD + (( l + 1 ) * strideD) ] = obj.rt2;
					e[ offsetE + (l * strideE) ] = 0.0;
					l += 2;
					if ( l <= lend ) {
						continue;
					}
					break;
				}

				if ( jtot === nmaxit ) {
					break;
				}
				jtot += 1;

				// Form shift. `SIGN(r, g)` must honor signed zero (g can be -0.0 here, e.g. +0.0 / -2.0); a plain `g >= 0` test would flip the eigenvector.
				g = ( d[ offsetD + (( l + 1 ) * strideD) ] - p ) / ( 2.0 * e[ offsetE + (l * strideE) ] );
				r = dlapy2( g, 1.0 );
				g = ( d[ offsetD + (m * strideD) ] - p ) + ( e[ offsetE + (l * strideE) ] / ( g + ( ( g < 0.0 || Object.is( g, -0 ) ) ? -r : r ) ) );

				s = 1.0;
				c = 1.0;
				p = 0.0;

				// Inner loop: chase bulge from bottom to top (label 70)
				for ( i = m - 1; i >= l; i-- ) {
					f = s * e[ offsetE + (i * strideE) ];
					b = c * e[ offsetE + (i * strideE) ];
					dlartg( g, f, rot );
					c = rot[ 0 ];
					s = rot[ 1 ];
					r = rot[ 2 ];
					if ( i !== m - 1 ) {
						e[ offsetE + (( i + 1 ) * strideE) ] = r;
					}
					g = d[ offsetD + (( i + 1 ) * strideD) ] - p;
					r = (( d[ offsetD + (i * strideD) ] - g ) * s) + ((2.0 * c) * b);
					p = s * r;
					d[ offsetD + (( i + 1 ) * strideD) ] = g + p;
					g = (c * r) - b;

					// Save rotations for the eigenvector update
					if ( icompz > 0 ) {
						WORK[ offsetWork + (i * strideWork) ] = c;
						WORK[ offsetWork + (( N - 1 + i ) * strideWork) ] = -s;
					}
				}

				// Apply saved rotations to the last row of Z (a single row)
				if ( icompz > 0 ) {
					mm = m - l + 1;
					dlasr( 'right', 'variable', 'backward', 1, mm, WORK, strideWork, offsetWork + (l * strideWork), WORK, strideWork, offsetWork + (( N - 1 + l ) * strideWork), Z, strideZ, strideZ, offsetZ + (l * strideZ) );
				}

				d[ offsetD + (l * strideD) ] -= p;
				e[ offsetE + (l * strideE) ] = g;
			}
		} else {
			// QR iteration
			while ( true ) {
				// Look for small superdiagonal element (labels 90 -> 100 -> 110)
				if ( l === lend ) {
					m = lend;
				} else {
					for ( m = l; m >= lend + 1; m-- ) {
						tst = Math.abs( e[ offsetE + (( m - 1 ) * strideE) ] );
						tst *= tst;
						if ( tst <= (( eps2 * Math.abs( d[ offsetD + (m * strideD) ] ) ) * Math.abs( d[ offsetD + (( m - 1 ) * strideD) ] )) + safmin ) {
							break;
						}
					}
					if ( m < lend + 1 ) {
						m = lend;
					}
				}

				if ( m > lend ) {
					e[ offsetE + (( m - 1 ) * strideE) ] = 0.0;
				}
				p = d[ offsetD + (l * strideD) ];

				// If m === l, single eigenvalue has converged (label 130)
				if ( m === l ) {
					d[ offsetD + (l * strideD) ] = p;
					l -= 1;
					if ( l >= lend ) {
						continue;
					}
					break;
				}

				// If m === l - 1, use direct 2x2 eigenvalue computation
				if ( m === l - 1 ) {
					if ( icompz > 0 ) {
						obj = dlaev2( d[ offsetD + (( l - 1 ) * strideD) ], e[ offsetE + (( l - 1 ) * strideE) ], d[ offsetD + (l * strideD) ] );
						c = obj.cs1;
						s = obj.sn1;

						// Apply the rotation directly to the last row of Z
						tst = Z[ offsetZ + (l * strideZ) ];
						Z[ offsetZ + (l * strideZ) ] = (c * tst) - (s * Z[ offsetZ + (( l - 1 ) * strideZ) ]);
						Z[ offsetZ + (( l - 1 ) * strideZ) ] = (s * tst) + (c * Z[ offsetZ + (( l - 1 ) * strideZ) ]);
					} else {
						obj = dlae2( d[ offsetD + (( l - 1 ) * strideD) ], e[ offsetE + (( l - 1 ) * strideE) ], d[ offsetD + (l * strideD) ] );
					}
					d[ offsetD + (( l - 1 ) * strideD) ] = obj.rt1;
					d[ offsetD + (l * strideD) ] = obj.rt2;
					e[ offsetE + (( l - 1 ) * strideE) ] = 0.0;
					l -= 2;
					if ( l >= lend ) {
						continue;
					}
					break;
				}

				if ( jtot === nmaxit ) {
					break;
				}
				jtot += 1;

				// Form shift (signed-zero-aware `SIGN(r, g)`; see the QL branch).
				g = ( d[ offsetD + (( l - 1 ) * strideD) ] - p ) / ( 2.0 * e[ offsetE + (( l - 1 ) * strideE) ] );
				r = dlapy2( g, 1.0 );
				g = ( d[ offsetD + (m * strideD) ] - p ) + ( e[ offsetE + (( l - 1 ) * strideE) ] / ( g + ( ( g < 0.0 || Object.is( g, -0 ) ) ? -r : r ) ) );

				s = 1.0;
				c = 1.0;
				p = 0.0;

				// Inner loop: chase bulge from top to bottom (label 120)
				for ( i = m; i <= l - 1; i++ ) {
					f = s * e[ offsetE + (i * strideE) ];
					b = c * e[ offsetE + (i * strideE) ];
					dlartg( g, f, rot );
					c = rot[ 0 ];
					s = rot[ 1 ];
					r = rot[ 2 ];
					if ( i !== m ) {
						e[ offsetE + (( i - 1 ) * strideE) ] = r;
					}
					g = d[ offsetD + (i * strideD) ] - p;
					r = (( d[ offsetD + (( i + 1 ) * strideD) ] - g ) * s) + ((2.0 * c) * b);
					p = s * r;
					d[ offsetD + (i * strideD) ] = g + p;
					g = (c * r) - b;

					// Save rotations for the eigenvector update
					if ( icompz > 0 ) {
						WORK[ offsetWork + (i * strideWork) ] = c;
						WORK[ offsetWork + (( N - 1 + i ) * strideWork) ] = s;
					}
				}

				// Apply saved rotations to the last row of Z (a single row)
				if ( icompz > 0 ) {
					mm = l - m + 1;
					dlasr( 'right', 'variable', 'forward', 1, mm, WORK, strideWork, offsetWork + (m * strideWork), WORK, strideWork, offsetWork + (( N - 1 + m ) * strideWork), Z, strideZ, strideZ, offsetZ + (m * strideZ) );
				}

				d[ offsetD + (l * strideD) ] -= p;
				e[ offsetE + (( l - 1 ) * strideE) ] = g;
			}
		}

		// Label 140: Undo scaling if necessary
		if ( iscale === 1 ) {
			dlascl( 'general', 0, 0, ssfmax, anorm, lendsv - lsv + 1, 1, d, strideD, 0, offsetD + (lsv * strideD) );
			dlascl( 'general', 0, 0, ssfmax, anorm, lendsv - lsv, 1, e, strideE, 0, offsetE + (lsv * strideE) );
		} else if ( iscale === 2 ) {
			dlascl( 'general', 0, 0, ssfmin, anorm, lendsv - lsv + 1, 1, d, strideD, 0, offsetD + (lsv * strideD) );
			dlascl( 'general', 0, 0, ssfmin, anorm, lendsv - lsv, 1, e, strideE, 0, offsetE + (lsv * strideE) );
		}

		// Check if any eigenvalues failed to converge
		if ( jtot >= nmaxit ) {
			break;
		}
	}

	// Convergence failure: count nonzero off-diagonal elements
	if ( jtot >= nmaxit ) {
		info = 0;
		for ( i = 0; i < N - 1; i++ ) {
			if ( e[ offsetE + (i * strideE) ] !== 0.0 ) {
				info += 1;
			}
		}
		return info;
	}

	// Label 160: Sort eigenvalues (and the last eigenvector row) in ascending order
	if ( icompz === 0 ) {
		dlasrt( 'increasing', N, d, strideD, offsetD );
	} else {
		// Selection sort, permuting the last-row entries of Z alongside
		for ( ii = 1; ii < N; ii++ ) {
			i = ii - 1;
			k = i;
			p = d[ offsetD + (i * strideD) ];
			for ( j = ii; j < N; j++ ) {
				if ( d[ offsetD + (j * strideD) ] < p ) {
					k = j;
					p = d[ offsetD + (j * strideD) ];
				}
			}
			if ( k !== i ) {
				d[ offsetD + (k * strideD) ] = d[ offsetD + (i * strideD) ];
				d[ offsetD + (i * strideD) ] = p;
				zi = offsetZ + (i * strideZ);
				zj = offsetZ + (k * strideZ);
				p = Z[ zj ];
				Z[ zj ] = Z[ zi ];
				Z[ zi ] = p;
			}
		}
	}

	return 0;
}


// EXPORTS //

export default dstqrb;
