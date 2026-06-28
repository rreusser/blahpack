/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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

/* eslint-disable max-len, max-params, no-var */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dlanst from '../../dlanst/lib/base.js';
import dlapy2 from '../../dlapy2/lib/base.js';
import dlae2 from '../../dlae2/lib/base.js';
import dlaev2 from '../../dlaev2/lib/base.js';
import dlartg from '../../dlartg/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';
import dlasr from '../../dlasr/lib/base.js';
import dlasrt from '../../dlasrt/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';


// VARIABLES //

var MAXIT = 30;


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a real symmetric.
* tridiagonal matrix using the implicit QL or QR method.
*
* The tridiagonal matrix T is defined by its diagonal D and subdiagonal E.
*
* ## Notes
*
* -   COMPZ = 'N': compute eigenvalues only (Z is not referenced)
*
* -   COMPZ = 'V': compute eigenvalues and eigenvectors of the original
* symmetric matrix. On entry, Z must contain the orthogonal matrix used
* to reduce the original matrix to tridiagonal form.
*
* -   COMPZ = 'I': compute eigenvalues and eigenvectors of the tridiagonal
* matrix. Z is initialized to the identity matrix.
*
* -   On exit, if INFO = 0, D contains the eigenvalues in ascending order
* and Z contains the orthonormal eigenvectors of the matrix.
*
* @private
* @param {string} compz - specifies whether eigenvectors are computed
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements of the tridiagonal matrix (length N)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - subdiagonal elements of the tridiagonal matrix (length N-1)
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} Z - orthogonal matrix Z (N-by-N)
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Float64Array} WORK - workspace array (length >= 2*(N-1))
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} INFO - 0 if successful, >0 if INFO eigenvalues did not converge
*/
function dsteqr( compz, N, d, strideD, offsetD, e, strideE, offsetE, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork ) {
	var nmaxit;
	var ssfmax;
	var ssfmin;
	var safmax;
	var safmin;
	var icompz;
	var lendsv;
	var iscale;
	var anorm;
	var info;
	var jtot;
	var lend;
	var eps2;
	var eps;
	var tst;
	var obj;
	var lsv;
	var rot;
	var mm;
	var l1;
	var ii;
	var l;
	var m;
	var p;
	var g;
	var r;
	var f;
	var b;
	var c;
	var s;
	var i;
	var j;
	var k;

	rot = new Float64Array( 3 );

	// Decode COMPZ
	if ( compz === 'none' ) {
		icompz = 0;
	} else if ( compz === 'update' ) {
		icompz = 1;
	} else if ( compz === 'initialize' ) {
		icompz = 2;
	} else {
		return -1;
	}

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
	eps = dlamch( 'epsilon' );
	eps2 = eps * eps;
	safmin = dlamch( 'safe-minimum' );
	safmax = 1.0 / safmin;
	ssfmax = Math.sqrt( safmax ) / 3.0;
	ssfmin = Math.sqrt( safmin ) / eps2;

	// Initialize Z to the identity matrix if COMPZ = 'I'
	if ( icompz === 2 ) {
		dlaset( 'Full', N, N, 0.0, 1.0, Z, strideZ1, strideZ2, offsetZ );
	}

	nmaxit = N * MAXIT;
	jtot = 0;

	// Determine where the matrix splits and choose QL or QR iteration for

	// Each block.
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
			// QL iteration: look for small subdiagonal element from bottom up
			// (lend > l means we work from top toward bottom)
			// Label 40 loop
			while ( true ) {
				// Find small subdiagonal element (label 40 -> 50 -> 60)
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
					// If loop finished without break, m = lend
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
						continue; // go to 40
					}
					break; // go to 140
				}

				// If m === l + 1, use direct 2x2 eigenvalue computation
				if ( m === l + 1 ) {
					if ( icompz > 0 ) {
						obj = dlaev2( d[ offsetD + (l * strideD) ], e[ offsetE + (l * strideE) ], d[ offsetD + (( l + 1 ) * strideD) ] );
						WORK[ offsetWork + (l * strideWork) ] = obj.cs1;
						WORK[ offsetWork + (( N - 1 + l ) * strideWork) ] = obj.sn1;
						dlasr( 'right', 'variable', 'backward', N, 2, WORK, strideWork, offsetWork + (l * strideWork), WORK, strideWork, offsetWork + (( N - 1 + l ) * strideWork), Z, strideZ1, strideZ2, offsetZ + (l * strideZ2));
						d[ offsetD + (l * strideD) ] = obj.rt1;
						d[ offsetD + (( l + 1 ) * strideD) ] = obj.rt2;
					} else {
						obj = dlae2( d[ offsetD + (l * strideD) ], e[ offsetE + (l * strideE) ], d[ offsetD + (( l + 1 ) * strideD) ] );
						d[ offsetD + (l * strideD) ] = obj.rt1;
						d[ offsetD + (( l + 1 ) * strideD) ] = obj.rt2;
					}
					e[ offsetE + (l * strideE) ] = 0.0;
					l += 2;
					if ( l <= lend ) {
						continue; // go to 40
					}
					break; // go to 140
				}

				if ( jtot === nmaxit ) {
					break; // go to 140
				}
				jtot += 1;

				// Form shift
				g = ( d[ offsetD + (( l + 1 ) * strideD) ] - p ) / ( 2.0 * e[ offsetE + (l * strideE) ] );
				r = dlapy2( g, 1.0 );
				g = d[ offsetD + (m * strideD) ] - p + ( e[ offsetE + (l * strideE) ] / ( g + ( ( Math.abs( g ) * ( Math.sign( g ) || 1.0 ) > 0 ) ? r : -r ) ) ); // SIGN(R, G)

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

					// Save rotations for eigenvector update
					if ( icompz > 0 ) {
						WORK[ offsetWork + (i * strideWork) ] = c;
						WORK[ offsetWork + (( N - 1 + i ) * strideWork) ] = -s;
					}
				}

				// Apply rotations to Z
				if ( icompz > 0 ) {
					mm = m - l + 1;
					dlasr( 'right', 'variable', 'backward', N, mm, WORK, strideWork, offsetWork + (l * strideWork), WORK, strideWork, offsetWork + (( N - 1 + l ) * strideWork), Z, strideZ1, strideZ2, offsetZ + (l * strideZ2));
				}

				d[ offsetD + (l * strideD) ] -= p;
				e[ offsetE + (l * strideE) ] = g;

				// Go to 40 (continue while loop)
			}
		} else {
			// QR iteration: lend < l, work from bottom toward top
			// Label 90 loop
			while ( true ) {
				// Find small subdiagonal element (labels 90 -> 100 -> 110)
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
					// If loop finished without break, m = lend
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
						continue; // go to 90
					}
					break; // go to 140
				}

				// If m === l - 1, use direct 2x2 eigenvalue computation
				if ( m === l - 1 ) {
					if ( icompz > 0 ) {
						obj = dlaev2( d[ offsetD + (( l - 1 ) * strideD) ], e[ offsetE + (( l - 1 ) * strideE) ], d[ offsetD + (l * strideD) ] );
						WORK[ offsetWork + (m * strideWork) ] = obj.cs1;
						WORK[ offsetWork + (( N - 1 + m ) * strideWork) ] = obj.sn1;
						dlasr( 'right', 'variable', 'forward', N, 2, WORK, strideWork, offsetWork + (m * strideWork), WORK, strideWork, offsetWork + (( N - 1 + m ) * strideWork), Z, strideZ1, strideZ2, offsetZ + (( l - 1 ) * strideZ2));
						d[ offsetD + (( l - 1 ) * strideD) ] = obj.rt1;
						d[ offsetD + (l * strideD) ] = obj.rt2;
					} else {
						obj = dlae2( d[ offsetD + (( l - 1 ) * strideD) ], e[ offsetE + (( l - 1 ) * strideE) ], d[ offsetD + (l * strideD) ] );
						d[ offsetD + (( l - 1 ) * strideD) ] = obj.rt1;
						d[ offsetD + (l * strideD) ] = obj.rt2;
					}
					e[ offsetE + (( l - 1 ) * strideE) ] = 0.0;
					l -= 2;
					if ( l >= lend ) {
						continue; // go to 90
					}
					break; // go to 140
				}

				if ( jtot === nmaxit ) {
					break; // go to 140
				}
				jtot += 1;

				// Form shift
				g = ( d[ offsetD + (( l - 1 ) * strideD) ] - p ) / ( 2.0 * e[ offsetE + (( l - 1 ) * strideE) ] );
				r = dlapy2( g, 1.0 );
				g = d[ offsetD + (m * strideD) ] - p + ( e[ offsetE + (( l - 1 ) * strideE) ] / ( g + ( ( Math.abs( g ) * ( Math.sign( g ) || 1.0 ) > 0 ) ? r : -r ) ) ); // SIGN(R, G)

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

					// Save rotations for eigenvector update
					if ( icompz > 0 ) {
						WORK[ offsetWork + (i * strideWork) ] = c;
						WORK[ offsetWork + (( N - 1 + i ) * strideWork) ] = s;
					}
				}

				// Apply rotations to Z
				if ( icompz > 0 ) {
					mm = l - m + 1;
					dlasr( 'right', 'variable', 'forward', N, mm, WORK, strideWork, offsetWork + (m * strideWork), WORK, strideWork, offsetWork + (( N - 1 + m ) * strideWork), Z, strideZ1, strideZ2, offsetZ + (m * strideZ2));
				}

				d[ offsetD + (l * strideD) ] -= p;
				e[ offsetE + (( l - 1 ) * strideE) ] = g;

				// Go to 90 (continue while loop)
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
			break; // go to convergence failure handling
		}

		// Continue outer loop (go to 10)
	}

	// Check for convergence failure: count nonzero off-diagonal elements
	if ( jtot >= nmaxit ) {
		info = 0;
		for ( i = 0; i < N - 1; i++ ) {
			if ( e[ offsetE + (i * strideE) ] !== 0.0 ) {
				info += 1;
			}
		}
		return info;
	}

	// Label 160: Sort eigenvalues (and eigenvectors) in ascending order
	if ( icompz === 0 ) {
		// Eigenvalues only: use dlasrt
		dlasrt( 'increasing', N, d, strideD, offsetD );
	} else {
		// Selection sort: sort eigenvalues and swap corresponding eigenvector columns
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
				dswap( N, Z, strideZ1, offsetZ + (i * strideZ2), Z, strideZ1, offsetZ + (k * strideZ2) );
			}
		}
	}

	return 0;
}


// EXPORTS //

export default dsteqr;
