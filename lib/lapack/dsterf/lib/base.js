/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, no-constant-condition, no-continue */

// MODULES //

import dlamch from '../../dlamch/lib/base.js';
import dlanst from '../../dlanst/lib/base.js';
import dlapy2 from '../../dlapy2/lib/base.js';
import dlae2 from '../../dlae2/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
import dlasrt from '../../dlasrt/lib/base.js';


// VARIABLES //

const MAXIT = 30;


// MAIN //

/**
* Computes all eigenvalues of a real symmetric tridiagonal matrix using the.
* Pal-Walker-Kahan variant of the QL or QR algorithm.
*
* On exit, the diagonal array `d` contains the eigenvalues in ascending order,
* and the off-diagonal array `e` is destroyed.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements (length N); on exit, eigenvalues in ascending order
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - off-diagonal elements (length N-1); destroyed on exit
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @returns {integer} info - 0 on success, >0 if failed to converge (number of unconverged elements)
*/
function dsterf( N, d, strideD, offsetD, e, strideE, offsetE ) {
	const rt1 = new Float64Array( 1 );
	const rt2 = new Float64Array( 1 );
	let lendsv, oldgam, iscale, anorm, sigma, alpha, gamma, oldc, jtot, lend;
	let info, rte, lsv, bb, l1, l, m, p, r, s, c, i;

	info = 0;

	// Quick return if possible
	if ( N <= 1 ) {
		return info;
	}

	// Determine the unit roundoff for this environment
	const eps = dlamch( 'epsilon' );
	const eps2 = eps * eps;
	const safmin = dlamch( 'safe-minimum' );
	const safmax = 1.0 / safmin;
	const ssfmax = Math.sqrt( safmax ) / 3.0;
	const ssfmin = Math.sqrt( safmin ) / eps2;

	// Compute the eigenvalues of the tridiagonal matrix
	const nmaxit = N * MAXIT;
	sigma = 0.0;
	jtot = 0;

	// Determine where the matrix splits and choose QL or QR iteration

	// For each block, according to whether top or bottom diagonal

	// Element is smaller.

	// Outer loop (Fortran label 10): iterate over unreduced blocks.

	// l1 is 0-based index of current block start.
	l1 = 0;

	// eslint-disable-next-line no-labels
	while ( l1 < N ) {
		// Zero out the off-diagonal before the block start
		if ( l1 > 0 ) {
			e[ offsetE + (( l1 - 1 ) * strideE) ] = 0.0;
		}

		// Find the end of the unreduced block (label 20-30):
		// Scan for a negligible off-diagonal element
		for ( m = l1; m < N - 1; m++ ) {
			if ( Math.abs( e[ offsetE + (m * strideE) ] ) <=
				Math.sqrt( Math.abs( d[ offsetD + (m * strideD) ] ) ) *
				Math.sqrt( Math.abs( d[ offsetD + (( m + 1 ) * strideD) ] ) ) *
				eps ) {
				e[ offsetE + (m * strideE) ] = 0.0;
				break;
			}
		}
		// A completed loop leaves m = N - 1 (0-based), the Fortran `M = N`.

		// (label 30)
		l = l1;
		lsv = l;
		lend = m;
		lendsv = lend;
		l1 = m + 1;

		// If single element block, skip to next block
		if ( lend === l ) {
			continue;
		}

		// Scale submatrix in rows and columns l to lend
		anorm = dlanst( 'max', lend - l + 1, d, strideD, offsetD + (l * strideD), e, strideE, offsetE + (l * strideE) );
		iscale = 0;
		if ( anorm === 0.0 ) {
			continue;
		}
		if ( anorm > ssfmax ) {
			iscale = 1;
			dlascl( 'general', 0, 0, anorm, ssfmax, lend - l + 1, 1, d, strideD, strideD, offsetD + (l * strideD) );
			dlascl( 'general', 0, 0, anorm, ssfmax, lend - l, 1, e, strideE, strideE, offsetE + (l * strideE) );
		} else if ( anorm < ssfmin ) {
			iscale = 2;
			dlascl( 'general', 0, 0, anorm, ssfmin, lend - l + 1, 1, d, strideD, strideD, offsetD + (l * strideD) );
			dlascl( 'general', 0, 0, anorm, ssfmin, lend - l, 1, e, strideE, strideE, offsetE + (l * strideE) );
		}

		// Square the off-diagonal elements
		for ( i = l; i < lend; i++ ) {
			e[ offsetE + (i * strideE) ] = e[ offsetE + (i * strideE) ] * e[ offsetE + (i * strideE) ];
		}

		// Choose between QL and QR iteration
		if ( Math.abs( d[ offsetD + (lend * strideD) ] ) < Math.abs( d[ offsetD + (l * strideD) ] ) ) {
			lend = lsv;
			l = lendsv;
		}

		if ( lend >= l ) {
			// QL Iteration (labels 50-90)
			// Look for small subdiagonal element
			while ( true ) {
				if ( l === lend ) {
					m = lend;
				} else {
					for ( m = l; m < lend; m++ ) {
						if ( Math.abs( e[ offsetE + (m * strideE) ] ) <=
							eps2 * Math.abs( d[ offsetD + (m * strideD) ] * d[ offsetD + (( m + 1 ) * strideD) ] ) ) {
							break;
						}
					}
					// A completed loop leaves m = lend, the Fortran `M = LEND`.
				}

				if ( m < lend ) {
					e[ offsetE + (m * strideE) ] = 0.0;
				}
				p = d[ offsetD + (l * strideD) ];

				// Eigenvalue found (label 90)
				if ( m === l ) {
					d[ offsetD + (l * strideD) ] = p;
					l += 1;
					if ( l <= lend ) {
						continue; // continue the while loop (GO TO 50)
					}
					break; // GO TO 150
				}

				// If remaining matrix is 2-by-2, use dlae2
				if ( m === l + 1 ) {
					rte = Math.sqrt( e[ offsetE + (l * strideE) ] );
					dlae2( d[ offsetD + (l * strideD) ], rte, d[ offsetD + (( l + 1 ) * strideD) ], rt1, rt2 );
					d[ offsetD + (l * strideD) ] = rt1[ 0 ];
					d[ offsetD + (( l + 1 ) * strideD) ] = rt2[ 0 ];
					e[ offsetE + (l * strideE) ] = 0.0;
					l += 2;
					if ( l <= lend ) {
						continue; // GO TO 50
					}
					break; // GO TO 150
				}

				if ( jtot === nmaxit ) {
					break; // GO TO 150
				}
				jtot += 1;

				// Form shift
				rte = Math.sqrt( e[ offsetE + (l * strideE) ] );
				sigma = ( d[ offsetD + (( l + 1 ) * strideD) ] - p ) / ( 2.0 * rte );
				r = dlapy2( sigma, 1.0 );
				sigma = p - ( rte / ( sigma + ( Math.abs( r ) * ( Math.sign( sigma ) || 1.0 ) ) ) );

				c = 1.0;
				s = 0.0;
				gamma = d[ offsetD + (m * strideD) ] - sigma;
				p = gamma * gamma;

				// Inner loop (DO 80): QL sweep from m-1 down to l
				for ( i = m - 1; i >= l; i-- ) {
					bb = e[ offsetE + (i * strideE) ];
					r = p + bb;
					if ( i !== m - 1 ) {
						e[ offsetE + (( i + 1 ) * strideE) ] = s * r;
					}
					oldc = c;
					c = p / r;
					s = bb / r;
					oldgam = gamma;
					alpha = d[ offsetD + (i * strideD) ];
					gamma = (c * ( alpha - sigma )) - (s * oldgam);
					d[ offsetD + (( i + 1 ) * strideD) ] = oldgam + ( alpha - gamma );
					if ( c === 0.0 ) {
						p = oldc * bb;
					} else {
						p = ( gamma * gamma ) / c;
					}
				}

				e[ offsetE + (l * strideE) ] = s * p;
				d[ offsetD + (l * strideD) ] = sigma + gamma;

				// GO TO 50 (continue the while loop)
			}
		} else {
			// QR Iteration (labels 100-140)
			// Look for small superdiagonal element
			while ( true ) {
				for ( m = l; m > lend; m-- ) {
					if ( Math.abs( e[ offsetE + (( m - 1 ) * strideE) ] ) <=
						eps2 * Math.abs( d[ offsetD + (m * strideD) ] * d[ offsetD + (( m - 1 ) * strideD) ] ) ) {
						break;
					}
				}
				// If the loop completes without a break, it exits with m = lend,
				// matching the Fortran `M = LEND` after DO 110. A break (GO TO 120)
				// must keep m as found, including m = lend + 1.

				if ( m > lend ) {
					e[ offsetE + (( m - 1 ) * strideE) ] = 0.0;
				}
				p = d[ offsetD + (l * strideD) ];

				// Eigenvalue found (label 140)
				if ( m === l ) {
					d[ offsetD + (l * strideD) ] = p;
					l -= 1;
					if ( l >= lend ) {
						continue; // GO TO 100
					}
					break; // GO TO 150
				}

				// If remaining matrix is 2-by-2, use dlae2
				if ( m === l - 1 ) {
					rte = Math.sqrt( e[ offsetE + (( l - 1 ) * strideE) ] );
					dlae2( d[ offsetD + (l * strideD) ], rte, d[ offsetD + (( l - 1 ) * strideD) ], rt1, rt2 );
					d[ offsetD + (l * strideD) ] = rt1[ 0 ];
					d[ offsetD + (( l - 1 ) * strideD) ] = rt2[ 0 ];
					e[ offsetE + (( l - 1 ) * strideE) ] = 0.0;
					l -= 2;
					if ( l >= lend ) {
						continue; // GO TO 100
					}
					break; // GO TO 150
				}

				if ( jtot === nmaxit ) {
					break; // GO TO 150
				}
				jtot += 1;

				// Form shift
				rte = Math.sqrt( e[ offsetE + (( l - 1 ) * strideE) ] );
				sigma = ( d[ offsetD + (( l - 1 ) * strideD) ] - p ) / ( 2.0 * rte );
				r = dlapy2( sigma, 1.0 );
				sigma = p - ( rte / ( sigma + ( Math.abs( r ) * ( Math.sign( sigma ) || 1.0 ) ) ) );

				c = 1.0;
				s = 0.0;
				gamma = d[ offsetD + (m * strideD) ] - sigma;
				p = gamma * gamma;

				// Inner loop (DO 130): QR sweep from m up to l-1
				for ( i = m; i < l; i++ ) {
					bb = e[ offsetE + (i * strideE) ];
					r = p + bb;
					if ( i !== m ) {
						e[ offsetE + (( i - 1 ) * strideE) ] = s * r;
					}
					oldc = c;
					c = p / r;
					s = bb / r;
					oldgam = gamma;
					alpha = d[ offsetD + (( i + 1 ) * strideD) ];
					gamma = (c * ( alpha - sigma )) - (s * oldgam);
					d[ offsetD + (i * strideD) ] = oldgam + ( alpha - gamma );
					if ( c === 0.0 ) {
						p = oldc * bb;
					} else {
						p = ( gamma * gamma ) / c;
					}
				}

				e[ offsetE + (( l - 1 ) * strideE) ] = s * p;
				d[ offsetD + (l * strideD) ] = sigma + gamma;

				// GO TO 100 (continue the while loop)
			}
		}

		// Label 150: Undo scaling if necessary
		if ( iscale === 1 ) {
			dlascl( 'general', 0, 0, ssfmax, anorm, lendsv - lsv + 1, 1, d, strideD, strideD, offsetD + (lsv * strideD) );
		}
		if ( iscale === 2 ) {
			dlascl( 'general', 0, 0, ssfmin, anorm, lendsv - lsv + 1, 1, d, strideD, strideD, offsetD + (lsv * strideD) );
		}

		// Check for no convergence
		if ( jtot >= nmaxit ) {
			// Count unconverged off-diagonal elements
			for ( i = 0; i < N - 1; i++ ) {
				if ( e[ offsetE + (i * strideE) ] !== 0.0 ) {
					info += 1;
				}
			}
			return info;
		}
		// Otherwise continue outer loop (GO TO 10)
	}

	// Label 170: Sort eigenvalues in increasing order
	dlasrt( 'increasing', N, d, strideD, offsetD );

	return info;
}


// EXPORTS //

export default dsterf;
