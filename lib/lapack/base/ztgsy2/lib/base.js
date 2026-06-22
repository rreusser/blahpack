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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zaxpy from '../../../../blas/base/zaxpy/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';
import zgetc2 from '../../zgetc2/lib/base.js';
import zgesc2 from '../../zgesc2/lib/base.js';
import zlatdf from '../../zlatdf/lib/base.js';


// VARIABLES //

var LDZ = 2;
var ZERO = 0.0;
var ONE = 1.0;


// MAIN //

/**
* Solves the generalized Sylvester equation for 1x1 or 2x2 subsystems.
*
* If TRANS = 'no-transpose', solves (1):
*
* ```text
* A*R - L*B = scale*C
* D*R - L*E = scale*F
* ```
*
* If TRANS = 'conjugate-transpose', solves (3):
*
* ```text
* A^H*R + D^H*L = scale*C
* -R*B^H - L*E^H = scale*F
* ```
*
* (A,D), (B,E), C, and F are M-by-M, N-by-N, M-by-N, M-by-N matrices.
* (A,D) and (B,E) must be in Schur form (upper triangular for complex).
*
* @private
* @param {string} trans - 'no-transpose' or 'conjugate-transpose'
* @param {integer} ijob - 0: solve only; 2: solve + estimate DIF via zlatdf
* @param {PositiveInteger} M - number of rows in C, F, and order of (A,D)
* @param {PositiveInteger} N - number of columns in C, F, and order of (B,E)
* @param {Complex128Array} A - M-by-M upper triangular matrix
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} B - N-by-N upper triangular matrix
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {Complex128Array} C - M-by-N right-hand side / solution
* @param {integer} strideC1 - stride of the first dimension of C (complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (complex elements)
* @param {NonNegativeInteger} offsetC - starting index for C (complex elements)
* @param {Complex128Array} D - M-by-M upper triangular matrix
* @param {integer} strideD1 - stride of the first dimension of D (complex elements)
* @param {integer} strideD2 - stride of the second dimension of D (complex elements)
* @param {NonNegativeInteger} offsetD - starting index for D (complex elements)
* @param {Complex128Array} E - N-by-N upper triangular matrix
* @param {integer} strideE1 - stride of the first dimension of E (complex elements)
* @param {integer} strideE2 - stride of the second dimension of E (complex elements)
* @param {NonNegativeInteger} offsetE - starting index for E (complex elements)
* @param {Complex128Array} F - M-by-N right-hand side / solution
* @param {integer} strideF1 - stride of the first dimension of F (complex elements)
* @param {integer} strideF2 - stride of the second dimension of F (complex elements)
* @param {NonNegativeInteger} offsetF - starting index for F (complex elements)
* @param {Float64Array} scale - output: scale[0] is the scaling factor
* @param {Float64Array} rdsum - in/out: rdsum[0] (used when ijob > 0)
* @param {Float64Array} rdscal - in/out: rdscal[0] (used when ijob > 0)
* @returns {integer} info - 0 if successful, >0 from zgetc2
*/
function ztgsy2( trans, ijob, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, D, strideD1, strideD2, offsetD, E, strideE1, strideE2, offsetE, F, strideF1, strideF2, offsetF, scale, rdsum, rdscal ) {
	var notran;
	var scaloc;
	var alpha;
	var SCALV;
	var IPIV;
	var JPIV;
	var ierr;
	var info;
	var RHS;
	var res;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sc1;
	var sc2;
	var sd1;
	var sd2;
	var se1;
	var se2;
	var sf1;
	var sf2;
	var Rv;
	var Av;
	var Bv;
	var Cv;
	var Dv;
	var Ev;
	var Fv;
	var oA;
	var oB;
	var oC;
	var oD;
	var oE;
	var oF;
	var ic;
	var jf;
	var Zv;
	var Z;
	var i;
	var j;
	var k;

	info = 0;
	ierr = 0;
	notran = ( trans === 'no-transpose' );

	// Local work arrays (LDZ=2 for complex Schur form: only 1x1 blocks)
	Z = new Complex128Array( LDZ * LDZ );
	RHS = new Complex128Array( LDZ );
	IPIV = new Int32Array( LDZ );
	JPIV = new Int32Array( LDZ );
	SCALV = new Float64Array( 1 );

	// Reinterpret all Complex128Arrays as Float64Array views for element access
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	Cv = reinterpret( C, 0 );
	Dv = reinterpret( D, 0 );
	Ev = reinterpret( E, 0 );
	Fv = reinterpret( F, 0 );
	Rv = reinterpret( RHS, 0 );

	// Convert complex strides/offsets to Float64 strides/offsets
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	sc1 = strideC1 * 2;
	sc2 = strideC2 * 2;
	sd1 = strideD1 * 2;
	sd2 = strideD2 * 2;
	se1 = strideE1 * 2;
	se2 = strideE2 * 2;
	sf1 = strideF1 * 2;
	sf2 = strideF2 * 2;
	oA = offsetA * 2;
	oB = offsetB * 2;
	oC = offsetC * 2;
	oD = offsetD * 2;
	oE = offsetE * 2;
	oF = offsetF * 2;

	// Get Float64 view of Z
	Zv = reinterpret( Z, 0 );

	if ( notran ) {
		// Solve (1): A*R - L*B = scale*C, D*R - L*E = scale*F
		scale[ 0 ] = ONE;
		scaloc = ONE;

		for ( j = 0; j < N; j++ ) {
			for ( i = M - 1; i >= 0; i-- ) {
				// Build 2x2 complex system

				// Z(0,0) = A(i,i)
				ic = oA + ( i * sa1 ) + ( i * sa2 );
				Zv[ 0 ] = Av[ ic ];
				Zv[ 1 ] = Av[ ic + 1 ];

				// Z(1,0) = D(i,i)
				ic = oD + ( i * sd1 ) + ( i * sd2 );
				Zv[ 2 ] = Dv[ ic ];
				Zv[ 3 ] = Dv[ ic + 1 ];

				// Z(0,1) = -B(j,j)
				ic = oB + ( j * sb1 ) + ( j * sb2 );
				Zv[ 4 ] = -Bv[ ic ];
				Zv[ 5 ] = -Bv[ ic + 1 ];

				// Z(1,1) = -E(j,j)
				ic = oE + ( j * se1 ) + ( j * se2 );
				Zv[ 6 ] = -Ev[ ic ];
				Zv[ 7 ] = -Ev[ ic + 1 ];

				// RHS(0) = C(i,j)
				ic = oC + ( i * sc1 ) + ( j * sc2 );
				Rv[ 0 ] = Cv[ ic ];
				Rv[ 1 ] = Cv[ ic + 1 ];

				// RHS(1) = F(i,j)
				jf = oF + ( i * sf1 ) + ( j * sf2 );
				Rv[ 2 ] = Fv[ jf ];
				Rv[ 3 ] = Fv[ jf + 1 ];

				// Factor the 2x2 system
				ierr = zgetc2( LDZ, Z, 1, LDZ, 0, IPIV, 1, 0, JPIV, 1, 0 );
				if ( ierr > 0 ) {
					info = ierr;
				}

				if ( ijob === 0 ) {
					zgesc2( LDZ, Z, 1, LDZ, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, SCALV );
					scaloc = SCALV[ 0 ];
					if ( scaloc !== ONE ) {
						for ( k = 0; k < N; k++ ) {
							zscal( M, new Complex128( scaloc, ZERO ), C, strideC1, offsetC + ( k * strideC2 ) );
							zscal( M, new Complex128( scaloc, ZERO ), F, strideF1, offsetF + ( k * strideF2 ) );
						}
						scale[ 0 ] *= scaloc;
					}
				} else {
					res = zlatdf( ijob, LDZ, Z, 1, LDZ, 0, RHS, 1, 0, rdsum[ 0 ], rdscal[ 0 ], IPIV, 1, 0, JPIV, 1, 0 );
					rdsum[ 0 ] = res.rdsum;
					rdscal[ 0 ] = res.rdscal;
				}

				// C(i,j) = RHS(0)
				ic = oC + ( i * sc1 ) + ( j * sc2 );
				Cv[ ic ] = Rv[ 0 ];
				Cv[ ic + 1 ] = Rv[ 1 ];

				// F(i,j) = RHS(1)
				jf = oF + ( i * sf1 ) + ( j * sf2 );
				Fv[ jf ] = Rv[ 2 ];
				Fv[ jf + 1 ] = Rv[ 3 ];

				// Update remaining rows: C(1:i-1,j) -= RHS(0) * A(1:i-1,i)
				if ( i > 0 ) {
					alpha = new Complex128( -Rv[ 0 ], -Rv[ 1 ] );
					zaxpy( i, alpha, A, strideA1, offsetA + ( i * strideA2 ), C, strideC1, offsetC + ( j * strideC2 ) );
					zaxpy( i, alpha, D, strideD1, offsetD + ( i * strideD2 ), F, strideF1, offsetF + ( j * strideF2 ) );
				}

				// Update remaining columns
				if ( j < N - 1 ) {
					alpha = new Complex128( Rv[ 2 ], Rv[ 3 ] );
					zaxpy( N - j - 1, alpha, B, strideB2, offsetB + ( j * strideB1 ) + ( ( j + 1 ) * strideB2 ), C, strideC2, offsetC + ( i * strideC1 ) + ( ( j + 1 ) * strideC2 ) );
					zaxpy( N - j - 1, alpha, E, strideE2, offsetE + ( j * strideE1 ) + ( ( j + 1 ) * strideE2 ), F, strideF2, offsetF + ( i * strideF1 ) + ( ( j + 1 ) * strideF2 ) );
				}
			}
		}
	} else {
		// Solve (3): conjugate-transposed system
		//   A^H*R + D^H*L = scale*C
		//   -R*B^H - L*E^H = scale*F
		scale[ 0 ] = ONE;
		scaloc = ONE;

		for ( i = 0; i < M; i++ ) {
			for ( j = N - 1; j >= 0; j-- ) {
				// Build 2x2 complex system (conjugate-transposed)

				// Z(0,0) = conj(A(i,i))
				ic = oA + ( i * sa1 ) + ( i * sa2 );
				Zv[ 0 ] = Av[ ic ];
				Zv[ 1 ] = -Av[ ic + 1 ];

				// Z(1,0) = -conj(B(j,j))
				ic = oB + ( j * sb1 ) + ( j * sb2 );
				Zv[ 2 ] = -Bv[ ic ];
				Zv[ 3 ] = Bv[ ic + 1 ];

				// Z(0,1) = conj(D(i,i))
				ic = oD + ( i * sd1 ) + ( i * sd2 );
				Zv[ 4 ] = Dv[ ic ];
				Zv[ 5 ] = -Dv[ ic + 1 ];

				// Z(1,1) = -conj(E(j,j))
				ic = oE + ( j * se1 ) + ( j * se2 );
				Zv[ 6 ] = -Ev[ ic ];
				Zv[ 7 ] = Ev[ ic + 1 ];

				// RHS(0) = C(i,j)
				ic = oC + ( i * sc1 ) + ( j * sc2 );
				Rv[ 0 ] = Cv[ ic ];
				Rv[ 1 ] = Cv[ ic + 1 ];

				// RHS(1) = F(i,j)
				jf = oF + ( i * sf1 ) + ( j * sf2 );
				Rv[ 2 ] = Fv[ jf ];
				Rv[ 3 ] = Fv[ jf + 1 ];

				// Factor the 2x2 system
				ierr = zgetc2( LDZ, Z, 1, LDZ, 0, IPIV, 1, 0, JPIV, 1, 0 );
				if ( ierr > 0 ) {
					info = ierr;
				}

				zgesc2( LDZ, Z, 1, LDZ, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, SCALV );
				scaloc = SCALV[ 0 ];
				if ( scaloc !== ONE ) {
					for ( k = 0; k < N; k++ ) {
						zscal( M, new Complex128( scaloc, ZERO ), C, strideC1, offsetC + ( k * strideC2 ) );
						zscal( M, new Complex128( scaloc, ZERO ), F, strideF1, offsetF + ( k * strideF2 ) );
					}
					scale[ 0 ] *= scaloc;
				}

				// C(i,j) = RHS(0)
				ic = oC + ( i * sc1 ) + ( j * sc2 );
				Cv[ ic ] = Rv[ 0 ];
				Cv[ ic + 1 ] = Rv[ 1 ];

				// F(i,j) = RHS(1)
				jf = oF + ( i * sf1 ) + ( j * sf2 );
				Fv[ jf ] = Rv[ 2 ];
				Fv[ jf + 1 ] = Rv[ 3 ];

				// Update: F(i, 1:j-1) += RHS(0)*conj(B(k,j)) + RHS(1)*conj(E(k,j))
				for ( k = 0; k < j; k++ ) {
					jf = oF + ( i * sf1 ) + ( k * sf2 );

					// conj(B(k,j))
					ic = oB + ( k * sb1 ) + ( j * sb2 );

					// F(i,k) += RHS(0) * conj(B(k,j))
					Fv[ jf ] += ( (Rv[ 0 ] * Bv[ ic ]) + (Rv[ 1 ] * Bv[ ic + 1 ]) );
					Fv[ jf + 1 ] += ( -(Rv[ 0 ] * Bv[ ic + 1 ]) + (Rv[ 1 ] * Bv[ ic ]) );

					// F(i,k) += RHS(1) * conj(E(k,j))
					ic = oE + ( k * se1 ) + ( j * se2 );
					Fv[ jf ] += ( (Rv[ 2 ] * Ev[ ic ]) + (Rv[ 3 ] * Ev[ ic + 1 ]) );
					Fv[ jf + 1 ] += ( -(Rv[ 2 ] * Ev[ ic + 1 ]) + (Rv[ 3 ] * Ev[ ic ]) );
				}

				// Update: C(i+1:M, j) -= conj(A(i,k))*RHS(0) + conj(D(i,k))*RHS(1)
				for ( k = i + 1; k < M; k++ ) {
					ic = oC + ( k * sc1 ) + ( j * sc2 );

					// conj(A(i,k)) * RHS(0)
					jf = oA + ( i * sa1 ) + ( k * sa2 );
					Cv[ ic ] -= ( (Av[ jf ] * Rv[ 0 ]) + (Av[ jf + 1 ] * Rv[ 1 ]) );
					Cv[ ic + 1 ] -= ( -(Av[ jf + 1 ] * Rv[ 0 ]) + (Av[ jf ] * Rv[ 1 ]) );

					// conj(D(i,k)) * RHS(1)
					jf = oD + ( i * sd1 ) + ( k * sd2 );
					Cv[ ic ] -= ( (Dv[ jf ] * Rv[ 2 ]) + (Dv[ jf + 1 ] * Rv[ 3 ]) );
					Cv[ ic + 1 ] -= ( -(Dv[ jf + 1 ] * Rv[ 2 ]) + (Dv[ jf ] * Rv[ 3 ]) );
				}
			}
		}
	}

	return info;
}


// EXPORTS //

export default ztgsy2;
