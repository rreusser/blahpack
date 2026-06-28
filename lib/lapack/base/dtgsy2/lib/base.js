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

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MODULES //

import daxpy from '../../../../blas/base/daxpy/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dgemm from '../../../../blas/base/dgemm/lib/base.js';
import dgemv from '../../../../blas/base/dgemv/lib/base.js';
import dger from '../../../../blas/base/dger/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dgetc2 from '../../dgetc2/lib/base.js';
import dgesc2 from '../../dgesc2/lib/base.js';
import dlatdf from '../../dlatdf/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';


// VARIABLES //

var LDZ = 8;
var ZERO = 0.0;
var ONE = 1.0;


// MAIN //

/**
* Solves the generalized Sylvester equation (unblocked):.
*
*   A_R - L_B = scale_C        (1)
_   D_R - L_E = scale_F
*
* using Level 1 and 2 BLAS calls.
*
* If TRANS = 'transpose', solves the transposed system:
*   A^T_R + D^T_L = scale_C    (3)
_   -R_B^T - L_E^T = scale_F
*
* (A,D), (B,E), C, and F are M-by-M, N-by-N, M-by-N, M-by-N matrices.
* (A,D) and (B,E) must be in real Schur form (quasi-triangular).
*
* @private
* @param {string} trans - 'no-transpose' or 'transpose'
* @param {integer} ijob - 0: solve only; 1/2: solve + estimate DIF
* @param {PositiveInteger} M - number of rows in C, F, and order of (A,D)
* @param {PositiveInteger} N - number of columns in C, F, and order of (B,E)
* @param {Float64Array} A - M-by-M upper quasi-triangular matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - N-by-N upper quasi-triangular matrix
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} C - M-by-N right-hand side / solution
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} D - M-by-M upper triangular matrix
* @param {integer} strideD1 - stride of the first dimension of D
* @param {integer} strideD2 - stride of the second dimension of D
* @param {NonNegativeInteger} offsetD - starting index for D
* @param {Float64Array} E - N-by-N upper triangular matrix
* @param {integer} strideE1 - stride of the first dimension of E
* @param {integer} strideE2 - stride of the second dimension of E
* @param {NonNegativeInteger} offsetE - starting index for E
* @param {Float64Array} F - M-by-N right-hand side / solution
* @param {integer} strideF1 - stride of the first dimension of F
* @param {integer} strideF2 - stride of the second dimension of F
* @param {NonNegativeInteger} offsetF - starting index for F
* @param {Float64Array} scale - output: scale[0] is the scaling factor
* @param {Float64Array} rdsum - in/out: rdsum[0] (used when ijob > 0)
* @param {Float64Array} rdscal - in/out: rdscal[0] (used when ijob > 0)
* @param {Int32Array} IWORK - workspace of length M+N+6
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @param {Int32Array} pq - output: pq[0] = P*Q
* @returns {integer} info - 0 if successful, >0 from dgetc2
*/
function dtgsy2( trans, ijob, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, D, strideD1, strideD2, offsetD, E, strideE1, strideE2, offsetE, F, strideF1, strideF2, offsetF, scale, rdsum, rdscal, IWORK, strideIWork, offsetIWork, pq ) {
	var notran;
	var scaloc;
	var alpha;
	var SCALV;
	var IPIV;
	var JPIV;
	var ierr;
	var info;
	var isp1;
	var jsp1;
	var zdim;
	var RHS;
	var res;
	var is;
	var ie;
	var js;
	var je;
	var mb;
	var nb;
	var ii;
	var jj;
	var kk;
	var Z;
	var p;
	var q;
	var i;
	var j;
	var k;

	info = 0;
	notran = ( trans === 'no-transpose' );

	// Local work arrays
	Z = new Float64Array( LDZ * LDZ );
	RHS = new Float64Array( LDZ );
	IPIV = new Int32Array( LDZ );
	JPIV = new Int32Array( LDZ );
	SCALV = new Float64Array( 1 );

	// Determine block structure of A
	pq[ 0 ] = 0;
	p = 0;
	i = 0;
	while ( i < M ) {
		IWORK[ offsetIWork + ( p * strideIWork ) ] = i;
		p += 1;
		if ( i === M - 1 ) {
			break;
		}
		if ( A[ offsetA + ( ( i + 1 ) * strideA1 ) + ( i * strideA2 ) ] !== ZERO ) {
			i += 2;
		} else {
			i += 1;
		}
	}
	IWORK[ offsetIWork + ( p * strideIWork ) ] = M;

	// Determine block structure of B
	q = p;
	j = 0;
	while ( j < N ) {
		q += 1;
		IWORK[ offsetIWork + ( q * strideIWork ) ] = j;
		if ( j === N - 1 ) {
			break;
		}
		if ( B[ offsetB + ( ( j + 1 ) * strideB1 ) + ( j * strideB2 ) ] !== ZERO ) {
			j += 2;
		} else {
			j += 1;
		}
	}
	IWORK[ offsetIWork + ( ( q + 1 ) * strideIWork ) ] = N;
	pq[ 0 ] = p * ( q - p );

	if ( notran ) {
		// Solve (1): A*R - L*B = scale*C, D*R - L*E = scale*F
		scale[ 0 ] = ONE;
		scaloc = ONE;

		// Loop over column blocks of (B,E)
		for ( j = p + 1; j <= q; j++ ) {
			js = IWORK[ offsetIWork + ( j * strideIWork ) ];
			jsp1 = js + 1;
			je = IWORK[ offsetIWork + ( ( j + 1 ) * strideIWork ) ] - 1;
			nb = je - js + 1;

			// Loop over row blocks of (A,D) in reverse
			for ( i = p - 1; i >= 0; i-- ) {
				is = IWORK[ offsetIWork + ( i * strideIWork ) ];
				isp1 = is + 1;
				ie = IWORK[ offsetIWork + ( ( i + 1 ) * strideIWork ) ] - 1;
				mb = ie - is + 1;
				zdim = mb * nb * 2;

				if ( mb === 1 && nb === 1 ) {
					// Build 2x2 system
					Z[ 0 ] = A[ offsetA + ( is * strideA1 ) + ( is * strideA2 ) ];
					Z[ 1 ] = D[ offsetD + ( is * strideD1 ) + ( is * strideD2 ) ];
					Z[ LDZ ] = -B[ offsetB + ( js * strideB1 ) + ( js * strideB2 ) ];
					Z[ LDZ + 1 ] = -E[ offsetE + ( js * strideE1 ) + ( js * strideE2 ) ];

					RHS[ 0 ] = C[ offsetC + ( is * strideC1 ) + ( js * strideC2 ) ];
					RHS[ 1 ] = F[ offsetF + ( is * strideF1 ) + ( js * strideF2 ) ];

					ierr = dgetc2( zdim, Z, 1, LDZ, 0, IPIV, 1, 0, JPIV, 1, 0 );
					if ( ierr > 0 ) {
						info = ierr;
					}

					if ( ijob === 0 ) {
						dgesc2( zdim, Z, 1, LDZ, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, SCALV );
						scaloc = SCALV[ 0 ];
						if ( scaloc !== ONE ) {
							for ( k = 0; k < N; k++ ) {
								dscal( M, scaloc, C, strideC1, offsetC + ( k * strideC2 ) );
								dscal( M, scaloc, F, strideF1, offsetF + ( k * strideF2 ) );
							}
							scale[ 0 ] *= scaloc;
						}
					} else {
						res = dlatdf( ijob, zdim, Z, 1, LDZ, 0, RHS, 1, 0, rdsum[ 0 ], rdscal[ 0 ], IPIV, 1, 0, JPIV, 1, 0 );
						rdsum[ 0 ] = res.rdsum;
						rdscal[ 0 ] = res.rdscal;
					}

					C[ offsetC + ( is * strideC1 ) + ( js * strideC2 ) ] = RHS[ 0 ];
					F[ offsetF + ( is * strideF1 ) + ( js * strideF2 ) ] = RHS[ 1 ];

					// Update remaining rows
					if ( i > 0 ) {
						alpha = -RHS[ 0 ];
						daxpy( is, alpha, A, strideA1, offsetA + ( is * strideA2 ), C, strideC1, offsetC + ( js * strideC2 ) );
						daxpy( is, alpha, D, strideD1, offsetD + ( is * strideD2 ), F, strideF1, offsetF + ( js * strideF2 ) );
					}
					// Update remaining columns
					if ( j < q ) {
						daxpy( N - je - 1, RHS[ 1 ], B, strideB2, offsetB + ( js * strideB1 ) + ( ( je + 1 ) * strideB2 ), C, strideC2, offsetC + ( is * strideC1 ) + ( ( je + 1 ) * strideC2 ) );
						daxpy( N - je - 1, RHS[ 1 ], E, strideE2, offsetE + ( js * strideE1 ) + ( ( je + 1 ) * strideE2 ), F, strideF2, offsetF + ( is * strideF1 ) + ( ( je + 1 ) * strideF2 ) );
					}
				} else if ( mb === 1 && nb === 2 ) {
					// Build 4x4 system
					Z[ 0 ] = A[ offsetA + ( is * strideA1 ) + ( is * strideA2 ) ];
					Z[ 1 ] = ZERO;
					Z[ 2 ] = D[ offsetD + ( is * strideD1 ) + ( is * strideD2 ) ];
					Z[ 3 ] = ZERO;

					Z[ LDZ ] = ZERO;
					Z[ LDZ + 1 ] = A[ offsetA + ( is * strideA1 ) + ( is * strideA2 ) ];
					Z[ LDZ + 2 ] = ZERO;
					Z[ LDZ + 3 ] = D[ offsetD + ( is * strideD1 ) + ( is * strideD2 ) ];

					Z[ 2 * LDZ ] = -B[ offsetB + ( js * strideB1 ) + ( js * strideB2 ) ];
					Z[ 2 * LDZ + 1 ] = -B[ offsetB + ( js * strideB1 ) + ( jsp1 * strideB2 ) ];
					Z[ 2 * LDZ + 2 ] = -E[ offsetE + ( js * strideE1 ) + ( js * strideE2 ) ];
					Z[ 2 * LDZ + 3 ] = -E[ offsetE + ( js * strideE1 ) + ( jsp1 * strideE2 ) ];

					Z[ 3 * LDZ ] = -B[ offsetB + ( jsp1 * strideB1 ) + ( js * strideB2 ) ];
					Z[ 3 * LDZ + 1 ] = -B[ offsetB + ( jsp1 * strideB1 ) + ( jsp1 * strideB2 ) ];
					Z[ 3 * LDZ + 2 ] = ZERO;
					Z[ 3 * LDZ + 3 ] = -E[ offsetE + ( jsp1 * strideE1 ) + ( jsp1 * strideE2 ) ];

					RHS[ 0 ] = C[ offsetC + ( is * strideC1 ) + ( js * strideC2 ) ];
					RHS[ 1 ] = C[ offsetC + ( is * strideC1 ) + ( jsp1 * strideC2 ) ];
					RHS[ 2 ] = F[ offsetF + ( is * strideF1 ) + ( js * strideF2 ) ];
					RHS[ 3 ] = F[ offsetF + ( is * strideF1 ) + ( jsp1 * strideF2 ) ];

					ierr = dgetc2( zdim, Z, 1, LDZ, 0, IPIV, 1, 0, JPIV, 1, 0 );
					if ( ierr > 0 ) {
						info = ierr;
					}

					if ( ijob === 0 ) {
						dgesc2( zdim, Z, 1, LDZ, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, SCALV );
						scaloc = SCALV[ 0 ];
						if ( scaloc !== ONE ) {
							for ( k = 0; k < N; k++ ) {
								dscal( M, scaloc, C, strideC1, offsetC + ( k * strideC2 ) );
								dscal( M, scaloc, F, strideF1, offsetF + ( k * strideF2 ) );
							}
							scale[ 0 ] *= scaloc;
						}
					} else {
						res = dlatdf( ijob, zdim, Z, 1, LDZ, 0, RHS, 1, 0, rdsum[ 0 ], rdscal[ 0 ], IPIV, 1, 0, JPIV, 1, 0 );
						rdsum[ 0 ] = res.rdsum;
						rdscal[ 0 ] = res.rdscal;
					}

					C[ offsetC + ( is * strideC1 ) + ( js * strideC2 ) ] = RHS[ 0 ];
					C[ offsetC + ( is * strideC1 ) + ( jsp1 * strideC2 ) ] = RHS[ 1 ];
					F[ offsetF + ( is * strideF1 ) + ( js * strideF2 ) ] = RHS[ 2 ];
					F[ offsetF + ( is * strideF1 ) + ( jsp1 * strideF2 ) ] = RHS[ 3 ];

					if ( i > 0 ) {
						dger( is, nb, -ONE, A, strideA1, offsetA + ( is * strideA2 ), RHS, 1, 0, C, strideC1, strideC2, offsetC + ( js * strideC2 ) );
						dger( is, nb, -ONE, D, strideD1, offsetD + ( is * strideD2 ), RHS, 1, 0, F, strideF1, strideF2, offsetF + ( js * strideF2 ) );
					}
					if ( j < q ) {
						daxpy( N - je - 1, RHS[ 2 ], B, strideB2, offsetB + ( js * strideB1 ) + ( ( je + 1 ) * strideB2 ), C, strideC2, offsetC + ( is * strideC1 ) + ( ( je + 1 ) * strideC2 ) );
						daxpy( N - je - 1, RHS[ 2 ], E, strideE2, offsetE + ( js * strideE1 ) + ( ( je + 1 ) * strideE2 ), F, strideF2, offsetF + ( is * strideF1 ) + ( ( je + 1 ) * strideF2 ) );
						daxpy( N - je - 1, RHS[ 3 ], B, strideB2, offsetB + ( jsp1 * strideB1 ) + ( ( je + 1 ) * strideB2 ), C, strideC2, offsetC + ( is * strideC1 ) + ( ( je + 1 ) * strideC2 ) );
						daxpy( N - je - 1, RHS[ 3 ], E, strideE2, offsetE + ( jsp1 * strideE1 ) + ( ( je + 1 ) * strideE2 ), F, strideF2, offsetF + ( is * strideF1 ) + ( ( je + 1 ) * strideF2 ) );
					}
				} else if ( mb === 2 && nb === 1 ) {
					// Build 4x4 system
					Z[ 0 ] = A[ offsetA + ( is * strideA1 ) + ( is * strideA2 ) ];
					Z[ 1 ] = A[ offsetA + ( isp1 * strideA1 ) + ( is * strideA2 ) ];
					Z[ 2 ] = D[ offsetD + ( is * strideD1 ) + ( is * strideD2 ) ];
					Z[ 3 ] = ZERO;

					Z[ LDZ ] = A[ offsetA + ( is * strideA1 ) + ( isp1 * strideA2 ) ];
					Z[ LDZ + 1 ] = A[ offsetA + ( isp1 * strideA1 ) + ( isp1 * strideA2 ) ];
					Z[ LDZ + 2 ] = D[ offsetD + ( is * strideD1 ) + ( isp1 * strideD2 ) ];
					Z[ LDZ + 3 ] = D[ offsetD + ( isp1 * strideD1 ) + ( isp1 * strideD2 ) ];

					Z[ 2 * LDZ ] = -B[ offsetB + ( js * strideB1 ) + ( js * strideB2 ) ];
					Z[ 2 * LDZ + 1 ] = ZERO;
					Z[ 2 * LDZ + 2 ] = -E[ offsetE + ( js * strideE1 ) + ( js * strideE2 ) ];
					Z[ 2 * LDZ + 3 ] = ZERO;

					Z[ 3 * LDZ ] = ZERO;
					Z[ 3 * LDZ + 1 ] = -B[ offsetB + ( js * strideB1 ) + ( js * strideB2 ) ];
					Z[ 3 * LDZ + 2 ] = ZERO;
					Z[ 3 * LDZ + 3 ] = -E[ offsetE + ( js * strideE1 ) + ( js * strideE2 ) ];

					RHS[ 0 ] = C[ offsetC + ( is * strideC1 ) + ( js * strideC2 ) ];
					RHS[ 1 ] = C[ offsetC + ( isp1 * strideC1 ) + ( js * strideC2 ) ];
					RHS[ 2 ] = F[ offsetF + ( is * strideF1 ) + ( js * strideF2 ) ];
					RHS[ 3 ] = F[ offsetF + ( isp1 * strideF1 ) + ( js * strideF2 ) ];

					ierr = dgetc2( zdim, Z, 1, LDZ, 0, IPIV, 1, 0, JPIV, 1, 0 );
					if ( ierr > 0 ) {
						info = ierr;
					}

					if ( ijob === 0 ) {
						dgesc2( zdim, Z, 1, LDZ, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, SCALV );
						scaloc = SCALV[ 0 ];
						if ( scaloc !== ONE ) {
							for ( k = 0; k < N; k++ ) {
								dscal( M, scaloc, C, strideC1, offsetC + ( k * strideC2 ) );
								dscal( M, scaloc, F, strideF1, offsetF + ( k * strideF2 ) );
							}
							scale[ 0 ] *= scaloc;
						}
					} else {
						res = dlatdf( ijob, zdim, Z, 1, LDZ, 0, RHS, 1, 0, rdsum[ 0 ], rdscal[ 0 ], IPIV, 1, 0, JPIV, 1, 0 );
						rdsum[ 0 ] = res.rdsum;
						rdscal[ 0 ] = res.rdscal;
					}

					C[ offsetC + ( is * strideC1 ) + ( js * strideC2 ) ] = RHS[ 0 ];
					C[ offsetC + ( isp1 * strideC1 ) + ( js * strideC2 ) ] = RHS[ 1 ];
					F[ offsetF + ( is * strideF1 ) + ( js * strideF2 ) ] = RHS[ 2 ];
					F[ offsetF + ( isp1 * strideF1 ) + ( js * strideF2 ) ] = RHS[ 3 ];

					if ( i > 0 ) {
						dgemv( 'no-transpose', is, mb, -ONE, A, strideA1, strideA2, offsetA + ( is * strideA2 ), RHS, 1, 0, ONE, C, strideC1, offsetC + ( js * strideC2 ) );
						dgemv( 'no-transpose', is, mb, -ONE, D, strideD1, strideD2, offsetD + ( is * strideD2 ), RHS, 1, 0, ONE, F, strideF1, offsetF + ( js * strideF2 ) );
					}
					if ( j < q ) {
						dger( mb, N - je - 1, ONE, RHS, 1, 2, B, strideB2, offsetB + ( js * strideB1 ) + ( ( je + 1 ) * strideB2 ), C, strideC1, strideC2, offsetC + ( is * strideC1 ) + ( ( je + 1 ) * strideC2 ) );
						dger( mb, N - je - 1, ONE, RHS, 1, 2, E, strideE2, offsetE + ( js * strideE1 ) + ( ( je + 1 ) * strideE2 ), F, strideF1, strideF2, offsetF + ( is * strideF1 ) + ( ( je + 1 ) * strideF2 ) );
					}
				} else if ( mb === 2 && nb === 2 ) {
					// Build 8x8 system
					dlaset( 'full', LDZ, LDZ, ZERO, ZERO, Z, 1, LDZ, 0 );

					Z[ 0 ] = A[ offsetA + ( is * strideA1 ) + ( is * strideA2 ) ];
					Z[ 1 ] = A[ offsetA + ( isp1 * strideA1 ) + ( is * strideA2 ) ];
					Z[ 4 ] = D[ offsetD + ( is * strideD1 ) + ( is * strideD2 ) ];

					Z[ LDZ ] = A[ offsetA + ( is * strideA1 ) + ( isp1 * strideA2 ) ];
					Z[ LDZ + 1 ] = A[ offsetA + ( isp1 * strideA1 ) + ( isp1 * strideA2 ) ];
					Z[ LDZ + 4 ] = D[ offsetD + ( is * strideD1 ) + ( isp1 * strideD2 ) ];
					Z[ LDZ + 5 ] = D[ offsetD + ( isp1 * strideD1 ) + ( isp1 * strideD2 ) ];

					Z[ 2 * LDZ + 2 ] = A[ offsetA + ( is * strideA1 ) + ( is * strideA2 ) ];
					Z[ 2 * LDZ + 3 ] = A[ offsetA + ( isp1 * strideA1 ) + ( is * strideA2 ) ];
					Z[ 2 * LDZ + 6 ] = D[ offsetD + ( is * strideD1 ) + ( is * strideD2 ) ];

					Z[ 3 * LDZ + 2 ] = A[ offsetA + ( is * strideA1 ) + ( isp1 * strideA2 ) ];
					Z[ 3 * LDZ + 3 ] = A[ offsetA + ( isp1 * strideA1 ) + ( isp1 * strideA2 ) ];
					Z[ 3 * LDZ + 6 ] = D[ offsetD + ( is * strideD1 ) + ( isp1 * strideD2 ) ];
					Z[ 3 * LDZ + 7 ] = D[ offsetD + ( isp1 * strideD1 ) + ( isp1 * strideD2 ) ];

					Z[ 4 * LDZ ] = -B[ offsetB + ( js * strideB1 ) + ( js * strideB2 ) ];
					Z[ 4 * LDZ + 2 ] = -B[ offsetB + ( js * strideB1 ) + ( jsp1 * strideB2 ) ];
					Z[ 4 * LDZ + 4 ] = -E[ offsetE + ( js * strideE1 ) + ( js * strideE2 ) ];
					Z[ 4 * LDZ + 6 ] = -E[ offsetE + ( js * strideE1 ) + ( jsp1 * strideE2 ) ];

					Z[ 5 * LDZ + 1 ] = -B[ offsetB + ( js * strideB1 ) + ( js * strideB2 ) ];
					Z[ 5 * LDZ + 3 ] = -B[ offsetB + ( js * strideB1 ) + ( jsp1 * strideB2 ) ];
					Z[ 5 * LDZ + 5 ] = -E[ offsetE + ( js * strideE1 ) + ( js * strideE2 ) ];
					Z[ 5 * LDZ + 7 ] = -E[ offsetE + ( js * strideE1 ) + ( jsp1 * strideE2 ) ];

					Z[ 6 * LDZ ] = -B[ offsetB + ( jsp1 * strideB1 ) + ( js * strideB2 ) ];
					Z[ 6 * LDZ + 2 ] = -B[ offsetB + ( jsp1 * strideB1 ) + ( jsp1 * strideB2 ) ];
					Z[ 6 * LDZ + 6 ] = -E[ offsetE + ( jsp1 * strideE1 ) + ( jsp1 * strideE2 ) ];

					Z[ 7 * LDZ + 1 ] = -B[ offsetB + ( jsp1 * strideB1 ) + ( js * strideB2 ) ];
					Z[ 7 * LDZ + 3 ] = -B[ offsetB + ( jsp1 * strideB1 ) + ( jsp1 * strideB2 ) ];
					Z[ 7 * LDZ + 7 ] = -E[ offsetE + ( jsp1 * strideE1 ) + ( jsp1 * strideE2 ) ];

					// Copy C and F into RHS
					kk = 0;
					ii = mb * nb;
					for ( jj = 0; jj < nb; jj++ ) {
						dcopy( mb, C, strideC1, offsetC + ( is * strideC1 ) + ( ( js + jj ) * strideC2 ), RHS, 1, kk );
						dcopy( mb, F, strideF1, offsetF + ( is * strideF1 ) + ( ( js + jj ) * strideF2 ), RHS, 1, ii );
						kk += mb;
						ii += mb;
					}

					ierr = dgetc2( zdim, Z, 1, LDZ, 0, IPIV, 1, 0, JPIV, 1, 0 );
					if ( ierr > 0 ) {
						info = ierr;
					}

					if ( ijob === 0 ) {
						dgesc2( zdim, Z, 1, LDZ, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, SCALV );
						scaloc = SCALV[ 0 ];
						if ( scaloc !== ONE ) {
							for ( k = 0; k < N; k++ ) {
								dscal( M, scaloc, C, strideC1, offsetC + ( k * strideC2 ) );
								dscal( M, scaloc, F, strideF1, offsetF + ( k * strideF2 ) );
							}
							scale[ 0 ] *= scaloc;
						}
					} else {
						res = dlatdf( ijob, zdim, Z, 1, LDZ, 0, RHS, 1, 0, rdsum[ 0 ], rdscal[ 0 ], IPIV, 1, 0, JPIV, 1, 0 );
						rdsum[ 0 ] = res.rdsum;
						rdscal[ 0 ] = res.rdscal;
					}

					// Copy solution back
					kk = 0;
					ii = mb * nb;
					for ( jj = 0; jj < nb; jj++ ) {
						dcopy( mb, RHS, 1, kk, C, strideC1, offsetC + ( is * strideC1 ) + ( ( js + jj ) * strideC2 ) );
						dcopy( mb, RHS, 1, ii, F, strideF1, offsetF + ( is * strideF1 ) + ( ( js + jj ) * strideF2 ) );
						kk += mb;
						ii += mb;
					}

					if ( i > 0 ) {
						dgemm( 'no-transpose', 'no-transpose', is, nb, mb, -ONE, A, strideA1, strideA2, offsetA + ( is * strideA2 ), RHS, 1, mb, 0, ONE, C, strideC1, strideC2, offsetC + ( js * strideC2 ) );
						dgemm( 'no-transpose', 'no-transpose', is, nb, mb, -ONE, D, strideD1, strideD2, offsetD + ( is * strideD2 ), RHS, 1, mb, 0, ONE, F, strideF1, strideF2, offsetF + ( js * strideF2 ) );
					}
					if ( j < q ) {
						kk = mb * nb;
						dgemm( 'no-transpose', 'no-transpose', mb, N - je - 1, nb, ONE, RHS, 1, mb, kk, B, strideB1, strideB2, offsetB + ( js * strideB1 ) + ( ( je + 1 ) * strideB2 ), ONE, C, strideC1, strideC2, offsetC + ( is * strideC1 ) + ( ( je + 1 ) * strideC2 ) );
						dgemm( 'no-transpose', 'no-transpose', mb, N - je - 1, nb, ONE, RHS, 1, mb, kk, E, strideE1, strideE2, offsetE + ( js * strideE1 ) + ( ( je + 1 ) * strideE2 ), ONE, F, strideF1, strideF2, offsetF + ( is * strideF1 ) + ( ( je + 1 ) * strideF2 ) );
					}
				}
			}
		}
	} else {
		// Solve (3): transposed system
		scale[ 0 ] = ONE;
		scaloc = ONE;

		for ( i = 0; i < p; i++ ) {
			is = IWORK[ offsetIWork + ( i * strideIWork ) ];
			isp1 = is + 1;
			ie = IWORK[ offsetIWork + ( ( i + 1 ) * strideIWork ) ] - 1;
			mb = ie - is + 1;

			for ( j = q; j >= p + 1; j-- ) {
				js = IWORK[ offsetIWork + ( j * strideIWork ) ];
				jsp1 = js + 1;
				je = IWORK[ offsetIWork + ( ( j + 1 ) * strideIWork ) ] - 1;
				nb = je - js + 1;
				zdim = mb * nb * 2;

				if ( mb === 1 && nb === 1 ) {
					// Build 2x2 system (transposed)
					Z[ 0 ] = A[ offsetA + ( is * strideA1 ) + ( is * strideA2 ) ];
					Z[ 1 ] = -B[ offsetB + ( js * strideB1 ) + ( js * strideB2 ) ];
					Z[ LDZ ] = D[ offsetD + ( is * strideD1 ) + ( is * strideD2 ) ];
					Z[ LDZ + 1 ] = -E[ offsetE + ( js * strideE1 ) + ( js * strideE2 ) ];

					RHS[ 0 ] = C[ offsetC + ( is * strideC1 ) + ( js * strideC2 ) ];
					RHS[ 1 ] = F[ offsetF + ( is * strideF1 ) + ( js * strideF2 ) ];

					ierr = dgetc2( zdim, Z, 1, LDZ, 0, IPIV, 1, 0, JPIV, 1, 0 );
					if ( ierr > 0 ) {
						info = ierr;
					}

					dgesc2( zdim, Z, 1, LDZ, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, SCALV );
					scaloc = SCALV[ 0 ];
					if ( scaloc !== ONE ) {
						for ( k = 0; k < N; k++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + ( k * strideC2 ) );
							dscal( M, scaloc, F, strideF1, offsetF + ( k * strideF2 ) );
						}
						scale[ 0 ] *= scaloc;
					}

					C[ offsetC + ( is * strideC1 ) + ( js * strideC2 ) ] = RHS[ 0 ];
					F[ offsetF + ( is * strideF1 ) + ( js * strideF2 ) ] = RHS[ 1 ];

					if ( j > p + 1 ) {
						alpha = RHS[ 0 ];
						daxpy( js, alpha, B, strideB1, offsetB + ( js * strideB2 ), F, strideF2, offsetF + ( is * strideF1 ) );
						alpha = RHS[ 1 ];
						daxpy( js, alpha, E, strideE1, offsetE + ( js * strideE2 ), F, strideF2, offsetF + ( is * strideF1 ) );
					}
					if ( i < p - 1 ) {
						alpha = -RHS[ 0 ];
						daxpy( M - ie - 1, alpha, A, strideA2, offsetA + ( is * strideA1 ) + ( ( ie + 1 ) * strideA2 ), C, strideC1, offsetC + ( ( ie + 1 ) * strideC1 ) + ( js * strideC2 ) );
						alpha = -RHS[ 1 ];
						daxpy( M - ie - 1, alpha, D, strideD2, offsetD + ( is * strideD1 ) + ( ( ie + 1 ) * strideD2 ), C, strideC1, offsetC + ( ( ie + 1 ) * strideC1 ) + ( js * strideC2 ) );
					}
				} else if ( mb === 1 && nb === 2 ) {
					// Build 4x4 system (transposed)
					Z[ 0 ] = A[ offsetA + ( is * strideA1 ) + ( is * strideA2 ) ];
					Z[ 1 ] = ZERO;
					Z[ 2 ] = -B[ offsetB + ( js * strideB1 ) + ( js * strideB2 ) ];
					Z[ 3 ] = -B[ offsetB + ( jsp1 * strideB1 ) + ( js * strideB2 ) ];

					Z[ LDZ ] = ZERO;
					Z[ LDZ + 1 ] = A[ offsetA + ( is * strideA1 ) + ( is * strideA2 ) ];
					Z[ LDZ + 2 ] = -B[ offsetB + ( js * strideB1 ) + ( jsp1 * strideB2 ) ];
					Z[ LDZ + 3 ] = -B[ offsetB + ( jsp1 * strideB1 ) + ( jsp1 * strideB2 ) ];

					Z[ 2 * LDZ ] = D[ offsetD + ( is * strideD1 ) + ( is * strideD2 ) ];
					Z[ 2 * LDZ + 1 ] = ZERO;
					Z[ 2 * LDZ + 2 ] = -E[ offsetE + ( js * strideE1 ) + ( js * strideE2 ) ];
					Z[ 2 * LDZ + 3 ] = ZERO;

					Z[ 3 * LDZ ] = ZERO;
					Z[ 3 * LDZ + 1 ] = D[ offsetD + ( is * strideD1 ) + ( is * strideD2 ) ];
					Z[ 3 * LDZ + 2 ] = -E[ offsetE + ( js * strideE1 ) + ( jsp1 * strideE2 ) ];
					Z[ 3 * LDZ + 3 ] = -E[ offsetE + ( jsp1 * strideE1 ) + ( jsp1 * strideE2 ) ];

					RHS[ 0 ] = C[ offsetC + ( is * strideC1 ) + ( js * strideC2 ) ];
					RHS[ 1 ] = C[ offsetC + ( is * strideC1 ) + ( jsp1 * strideC2 ) ];
					RHS[ 2 ] = F[ offsetF + ( is * strideF1 ) + ( js * strideF2 ) ];
					RHS[ 3 ] = F[ offsetF + ( is * strideF1 ) + ( jsp1 * strideF2 ) ];

					ierr = dgetc2( zdim, Z, 1, LDZ, 0, IPIV, 1, 0, JPIV, 1, 0 );
					if ( ierr > 0 ) {
						info = ierr;
					}

					dgesc2( zdim, Z, 1, LDZ, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, SCALV );
					scaloc = SCALV[ 0 ];
					if ( scaloc !== ONE ) {
						for ( k = 0; k < N; k++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + ( k * strideC2 ) );
							dscal( M, scaloc, F, strideF1, offsetF + ( k * strideF2 ) );
						}
						scale[ 0 ] *= scaloc;
					}

					C[ offsetC + ( is * strideC1 ) + ( js * strideC2 ) ] = RHS[ 0 ];
					C[ offsetC + ( is * strideC1 ) + ( jsp1 * strideC2 ) ] = RHS[ 1 ];
					F[ offsetF + ( is * strideF1 ) + ( js * strideF2 ) ] = RHS[ 2 ];
					F[ offsetF + ( is * strideF1 ) + ( jsp1 * strideF2 ) ] = RHS[ 3 ];

					if ( j > p + 1 ) {
						daxpy( js, RHS[ 0 ], B, strideB1, offsetB + ( js * strideB2 ), F, strideF2, offsetF + ( is * strideF1 ) );
						daxpy( js, RHS[ 1 ], B, strideB1, offsetB + ( jsp1 * strideB2 ), F, strideF2, offsetF + ( is * strideF1 ) );
						daxpy( js, RHS[ 2 ], E, strideE1, offsetE + ( js * strideE2 ), F, strideF2, offsetF + ( is * strideF1 ) );
						daxpy( js, RHS[ 3 ], E, strideE1, offsetE + ( jsp1 * strideE2 ), F, strideF2, offsetF + ( is * strideF1 ) );
					}
					if ( i < p - 1 ) {
						dger( M - ie - 1, nb, -ONE, A, strideA2, offsetA + ( is * strideA1 ) + ( ( ie + 1 ) * strideA2 ), RHS, 1, 0, C, strideC1, strideC2, offsetC + ( ( ie + 1 ) * strideC1 ) + ( js * strideC2 ) );
						dger( M - ie - 1, nb, -ONE, D, strideD2, offsetD + ( is * strideD1 ) + ( ( ie + 1 ) * strideD2 ), RHS, 1, 2, C, strideC1, strideC2, offsetC + ( ( ie + 1 ) * strideC1 ) + ( js * strideC2 ) );
					}
				} else if ( mb === 2 && nb === 1 ) {
					// Build 4x4 system (transposed)
					Z[ 0 ] = A[ offsetA + ( is * strideA1 ) + ( is * strideA2 ) ];
					Z[ 1 ] = A[ offsetA + ( is * strideA1 ) + ( isp1 * strideA2 ) ];
					Z[ 2 ] = -B[ offsetB + ( js * strideB1 ) + ( js * strideB2 ) ];
					Z[ 3 ] = ZERO;

					Z[ LDZ ] = A[ offsetA + ( isp1 * strideA1 ) + ( is * strideA2 ) ];
					Z[ LDZ + 1 ] = A[ offsetA + ( isp1 * strideA1 ) + ( isp1 * strideA2 ) ];
					Z[ LDZ + 2 ] = ZERO;
					Z[ LDZ + 3 ] = -B[ offsetB + ( js * strideB1 ) + ( js * strideB2 ) ];

					Z[ 2 * LDZ ] = D[ offsetD + ( is * strideD1 ) + ( is * strideD2 ) ];
					Z[ 2 * LDZ + 1 ] = D[ offsetD + ( is * strideD1 ) + ( isp1 * strideD2 ) ];
					Z[ 2 * LDZ + 2 ] = -E[ offsetE + ( js * strideE1 ) + ( js * strideE2 ) ];
					Z[ 2 * LDZ + 3 ] = ZERO;

					Z[ 3 * LDZ ] = ZERO;
					Z[ 3 * LDZ + 1 ] = D[ offsetD + ( isp1 * strideD1 ) + ( isp1 * strideD2 ) ];
					Z[ 3 * LDZ + 2 ] = ZERO;
					Z[ 3 * LDZ + 3 ] = -E[ offsetE + ( js * strideE1 ) + ( js * strideE2 ) ];

					RHS[ 0 ] = C[ offsetC + ( is * strideC1 ) + ( js * strideC2 ) ];
					RHS[ 1 ] = C[ offsetC + ( isp1 * strideC1 ) + ( js * strideC2 ) ];
					RHS[ 2 ] = F[ offsetF + ( is * strideF1 ) + ( js * strideF2 ) ];
					RHS[ 3 ] = F[ offsetF + ( isp1 * strideF1 ) + ( js * strideF2 ) ];

					ierr = dgetc2( zdim, Z, 1, LDZ, 0, IPIV, 1, 0, JPIV, 1, 0 );
					if ( ierr > 0 ) {
						info = ierr;
					}

					dgesc2( zdim, Z, 1, LDZ, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, SCALV );
					scaloc = SCALV[ 0 ];
					if ( scaloc !== ONE ) {
						for ( k = 0; k < N; k++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + ( k * strideC2 ) );
							dscal( M, scaloc, F, strideF1, offsetF + ( k * strideF2 ) );
						}
						scale[ 0 ] *= scaloc;
					}

					C[ offsetC + ( is * strideC1 ) + ( js * strideC2 ) ] = RHS[ 0 ];
					C[ offsetC + ( isp1 * strideC1 ) + ( js * strideC2 ) ] = RHS[ 1 ];
					F[ offsetF + ( is * strideF1 ) + ( js * strideF2 ) ] = RHS[ 2 ];
					F[ offsetF + ( isp1 * strideF1 ) + ( js * strideF2 ) ] = RHS[ 3 ];

					if ( j > p + 1 ) {
						dger( mb, js, ONE, RHS, 1, 0, B, strideB1, offsetB + ( js * strideB2 ), F, strideF1, strideF2, offsetF + ( is * strideF1 ) );
						dger( mb, js, ONE, RHS, 1, 2, E, strideE1, offsetE + ( js * strideE2 ), F, strideF1, strideF2, offsetF + ( is * strideF1 ) );
					}
					if ( i < p - 1 ) {
						dgemv( 'transpose', mb, M - ie - 1, -ONE, A, strideA1, strideA2, offsetA + ( is * strideA1 ) + ( ( ie + 1 ) * strideA2 ), RHS, 1, 0, ONE, C, strideC1, offsetC + ( ( ie + 1 ) * strideC1 ) + ( js * strideC2 ) );
						dgemv( 'transpose', mb, M - ie - 1, -ONE, D, strideD1, strideD2, offsetD + ( is * strideD1 ) + ( ( ie + 1 ) * strideD2 ), RHS, 1, 2, ONE, C, strideC1, offsetC + ( ( ie + 1 ) * strideC1 ) + ( js * strideC2 ) );
					}
				} else if ( mb === 2 && nb === 2 ) {
					// Build 8x8 system (transposed)
					dlaset( 'full', LDZ, LDZ, ZERO, ZERO, Z, 1, LDZ, 0 );

					Z[ 0 ] = A[ offsetA + ( is * strideA1 ) + ( is * strideA2 ) ];
					Z[ 1 ] = A[ offsetA + ( is * strideA1 ) + ( isp1 * strideA2 ) ];
					Z[ 4 ] = -B[ offsetB + ( js * strideB1 ) + ( js * strideB2 ) ];
					Z[ 6 ] = -B[ offsetB + ( jsp1 * strideB1 ) + ( js * strideB2 ) ];

					Z[ LDZ ] = A[ offsetA + ( isp1 * strideA1 ) + ( is * strideA2 ) ];
					Z[ LDZ + 1 ] = A[ offsetA + ( isp1 * strideA1 ) + ( isp1 * strideA2 ) ];
					Z[ LDZ + 5 ] = -B[ offsetB + ( js * strideB1 ) + ( js * strideB2 ) ];
					Z[ LDZ + 7 ] = -B[ offsetB + ( jsp1 * strideB1 ) + ( js * strideB2 ) ];

					Z[ 2 * LDZ + 2 ] = A[ offsetA + ( is * strideA1 ) + ( is * strideA2 ) ];
					Z[ 2 * LDZ + 3 ] = A[ offsetA + ( is * strideA1 ) + ( isp1 * strideA2 ) ];
					Z[ 2 * LDZ + 4 ] = -B[ offsetB + ( js * strideB1 ) + ( jsp1 * strideB2 ) ];
					Z[ 2 * LDZ + 6 ] = -B[ offsetB + ( jsp1 * strideB1 ) + ( jsp1 * strideB2 ) ];

					Z[ 3 * LDZ + 2 ] = A[ offsetA + ( isp1 * strideA1 ) + ( is * strideA2 ) ];
					Z[ 3 * LDZ + 3 ] = A[ offsetA + ( isp1 * strideA1 ) + ( isp1 * strideA2 ) ];
					Z[ 3 * LDZ + 5 ] = -B[ offsetB + ( js * strideB1 ) + ( jsp1 * strideB2 ) ];
					Z[ 3 * LDZ + 7 ] = -B[ offsetB + ( jsp1 * strideB1 ) + ( jsp1 * strideB2 ) ];

					Z[ 4 * LDZ ] = D[ offsetD + ( is * strideD1 ) + ( is * strideD2 ) ];
					Z[ 4 * LDZ + 1 ] = D[ offsetD + ( is * strideD1 ) + ( isp1 * strideD2 ) ];
					Z[ 4 * LDZ + 4 ] = -E[ offsetE + ( js * strideE1 ) + ( js * strideE2 ) ];

					Z[ 5 * LDZ + 1 ] = D[ offsetD + ( isp1 * strideD1 ) + ( isp1 * strideD2 ) ];
					Z[ 5 * LDZ + 5 ] = -E[ offsetE + ( js * strideE1 ) + ( js * strideE2 ) ];

					Z[ 6 * LDZ + 2 ] = D[ offsetD + ( is * strideD1 ) + ( is * strideD2 ) ];
					Z[ 6 * LDZ + 3 ] = D[ offsetD + ( is * strideD1 ) + ( isp1 * strideD2 ) ];
					Z[ 6 * LDZ + 4 ] = -E[ offsetE + ( js * strideE1 ) + ( jsp1 * strideE2 ) ];
					Z[ 6 * LDZ + 6 ] = -E[ offsetE + ( jsp1 * strideE1 ) + ( jsp1 * strideE2 ) ];

					Z[ 7 * LDZ + 3 ] = D[ offsetD + ( isp1 * strideD1 ) + ( isp1 * strideD2 ) ];
					Z[ 7 * LDZ + 5 ] = -E[ offsetE + ( js * strideE1 ) + ( jsp1 * strideE2 ) ];
					Z[ 7 * LDZ + 7 ] = -E[ offsetE + ( jsp1 * strideE1 ) + ( jsp1 * strideE2 ) ];

					// Copy C and F into RHS
					kk = 0;
					ii = mb * nb;
					for ( jj = 0; jj < nb; jj++ ) {
						dcopy( mb, C, strideC1, offsetC + ( is * strideC1 ) + ( ( js + jj ) * strideC2 ), RHS, 1, kk );
						dcopy( mb, F, strideF1, offsetF + ( is * strideF1 ) + ( ( js + jj ) * strideF2 ), RHS, 1, ii );
						kk += mb;
						ii += mb;
					}

					ierr = dgetc2( zdim, Z, 1, LDZ, 0, IPIV, 1, 0, JPIV, 1, 0 );
					if ( ierr > 0 ) {
						info = ierr;
					}

					dgesc2( zdim, Z, 1, LDZ, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, SCALV );
					scaloc = SCALV[ 0 ];
					if ( scaloc !== ONE ) {
						for ( k = 0; k < N; k++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + ( k * strideC2 ) );
							dscal( M, scaloc, F, strideF1, offsetF + ( k * strideF2 ) );
						}
						scale[ 0 ] *= scaloc;
					}

					// Copy solution back
					kk = 0;
					ii = mb * nb;
					for ( jj = 0; jj < nb; jj++ ) {
						dcopy( mb, RHS, 1, kk, C, strideC1, offsetC + ( is * strideC1 ) + ( ( js + jj ) * strideC2 ) );
						dcopy( mb, RHS, 1, ii, F, strideF1, offsetF + ( is * strideF1 ) + ( ( js + jj ) * strideF2 ) );
						kk += mb;
						ii += mb;
					}

					if ( j > p + 1 ) {
						dgemm( 'no-transpose', 'transpose', mb, js, nb, ONE, C, strideC1, strideC2, offsetC + ( is * strideC1 ) + ( js * strideC2 ), B, strideB1, strideB2, offsetB + ( js * strideB2 ), ONE, F, strideF1, strideF2, offsetF + ( is * strideF1 ) );
						dgemm( 'no-transpose', 'transpose', mb, js, nb, ONE, F, strideF1, strideF2, offsetF + ( is * strideF1 ) + ( js * strideF2 ), E, strideE1, strideE2, offsetE + ( js * strideE2 ), ONE, F, strideF1, strideF2, offsetF + ( is * strideF1 ) );
					}
					if ( i < p - 1 ) {
						dgemm( 'transpose', 'no-transpose', M - ie - 1, nb, mb, -ONE, A, strideA1, strideA2, offsetA + ( is * strideA1 ) + ( ( ie + 1 ) * strideA2 ), C, strideC1, strideC2, offsetC + ( is * strideC1 ) + ( js * strideC2 ), ONE, C, strideC1, strideC2, offsetC + ( ( ie + 1 ) * strideC1 ) + ( js * strideC2 ) );
						dgemm( 'transpose', 'no-transpose', M - ie - 1, nb, mb, -ONE, D, strideD1, strideD2, offsetD + ( is * strideD1 ) + ( ( ie + 1 ) * strideD2 ), F, strideF1, strideF2, offsetF + ( is * strideF1 ) + ( js * strideF2 ), ONE, C, strideC1, strideC2, offsetC + ( ( ie + 1 ) * strideC1 ) + ( js * strideC2 ) );
					}
				}
			}
		}
	}

	return info;
}


// EXPORTS //

export default dtgsy2;
