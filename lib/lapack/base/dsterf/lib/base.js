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

/* eslint-disable max-len, max-params, no-constant-condition, no-continue */

// MODULES //

import dlamch from '../../dlamch/lib/base.js';
import dlanst from '../../dlanst/lib/base.js';
import dlapy2 from '../../dlapy2/lib/base.js';
import dlae2 from '../../dlae2/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
import dlasrt from '../../dlasrt/lib/base.js';


// VARIABLES //

var MAXIT = 30;


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
	var ssfmax;
	var ssfmin;
	var safmin;
	var safmax;
	var lendsv;
	var nmaxit;
	var oldgam;
	var iscale;
	var anorm;
	var sigma;
	var alpha;
	var gamma;
	var oldc;
	var jtot;
	var lend;
	var info;
	var eps2;
	var eps;
	var rte;
	var lsv;
	var rt;
	var bb;
	var l1;
	var l;
	var m;
	var p;
	var r;
	var s;
	var c;
	var i;

	info = 0;

	// Quick return if possible
	if ( N <= 1 ) {
		return info;
	}

	// Determine the unit roundoff for this environment
	eps = dlamch( 'epsilon' );
	eps2 = eps * eps;
	safmin = dlamch( 'safe-minimum' );
	safmax = 1.0 / safmin;
	ssfmax = Math.sqrt( safmax ) / 3.0;
	ssfmin = Math.sqrt( safmin ) / eps2;

	// Compute the eigenvalues of the tridiagonal matrix
	nmaxit = N * MAXIT;
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
		// If loop didn't break, m = N - 1, but the Fortran sets M = N (1-based),
		// Which is m = N - 1 (0-based). The for-loop already leaves m = N-1 if
		// No break happened. But if N-1 was the last iteration index and the
		// Condition was met, it broke at N-1. If it wasn't met, the loop exits
		// With m = N-1 which was the last value tested. If the loop body never
		// matched, Fortran sets M=N. In 0-based terms:
		if ( m === N - 1 ) {
			// Check: did the loop reach the last index and NOT break?
			// In Fortran, when DO loop completes without GO TO 30,
			// M = N. But our for-loop leaves m = N-1 regardless.
			// We need m = N-1 for a block extending to end. That's correct
			// Since 0-based m = N-1 corresponds to 1-based M = N.
		}

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
			dlascl( 'general', 0, 0, anorm, ssfmax, lend - l + 1, 1, d, 1, strideD, offsetD + (l * strideD) );
			dlascl( 'general', 0, 0, anorm, ssfmax, lend - l, 1, e, 1, strideE, offsetE + (l * strideE) );
		} else if ( anorm < ssfmin ) {
			iscale = 2;
			dlascl( 'general', 0, 0, anorm, ssfmin, lend - l + 1, 1, d, 1, strideD, offsetD + (l * strideD) );
			dlascl( 'general', 0, 0, anorm, ssfmin, lend - l, 1, e, 1, strideE, offsetE + (l * strideE) );
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
					// If loop completed without break, m = lend (Fortran: M = LEND)
					if ( m === lend ) {
						// Didn't find small element; m stays at lend
					}
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
					rt = dlae2( d[ offsetD + (l * strideD) ], rte, d[ offsetD + (( l + 1 ) * strideD) ] );
					d[ offsetD + (l * strideD) ] = rt.rt1;
					d[ offsetD + (( l + 1 ) * strideD) ] = rt.rt2;
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
				// If loop completed without break, m = lend+1 then it goes to lend
				// But actually: for (m = l; m > lend; m--) exits at m = lend+1
				// If no break. But Fortran sets M = LEND when loop completes.
				// Since our for-loop goes m > lend, it exits with m = lend + 1.
				// But Fortran: DO 110 M = L, LEND + 1, -1 ... M = LEND
				// When the loop completes without GO TO 120, Fortran sets M = LEND.
				if ( m === lend + 1 ) {
					// Loop completed without finding small element;
					// Fortran falls through to M = LEND
					m = lend;
				}

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
					rt = dlae2( d[ offsetD + (l * strideD) ], rte, d[ offsetD + (( l - 1 ) * strideD) ] );
					d[ offsetD + (l * strideD) ] = rt.rt1;
					d[ offsetD + (( l - 1 ) * strideD) ] = rt.rt2;
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
			dlascl( 'general', 0, 0, ssfmax, anorm, lendsv - lsv + 1, 1, d, 1, strideD, offsetD + (lsv * strideD) );
		}
		if ( iscale === 2 ) {
			dlascl( 'general', 0, 0, ssfmin, anorm, lendsv - lsv + 1, 1, d, 1, strideD, offsetD + (lsv * strideD) );
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
