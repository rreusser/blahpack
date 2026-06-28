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

/* eslint-disable max-len, max-params */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';


// MAIN //

/**
* Solves a complex Hermitian positive definite tridiagonal system of the form.
* A _ X = B using the L_D_L^H or U^H_D*U factorization of A computed by zpttrf.
*
* D is a diagonal matrix (real) specified in the vector D, U (or L) is a unit
* bidiagonal matrix whose superdiagonal (subdiagonal) is specified in the
* complex vector E, and X and B are N by NRHS complex matrices.
*
* @private
* @param {integer} iuplo - 0 for L*D*L^H factorization, 1 for U^H*D*U factorization
* @param {NonNegativeInteger} N - order of the tridiagonal matrix A (N >= 0)
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Float64Array} d - diagonal elements of D (real), length N
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Complex128Array} e - off-diagonal elements of L or U, length N-1
* @param {integer} strideE - stride length for `e` (in complex elements)
* @param {NonNegativeInteger} offsetE - starting index for `e` (in complex elements)
* @param {Complex128Array} B - right hand side matrix (N x NRHS), overwritten with solution X
* @param {integer} strideB1 - stride of the first dimension of `B` (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
* @returns {Complex128Array} B - the solution matrix X
*/
function zptts2( iuplo, N, nrhs, d, strideD, offsetD, e, strideE, offsetE, B, strideB1, strideB2, offsetB ) {
	var sB1;
	var sB2;
	var sE;
	var ev;
	var bv;
	var ib;
	var ie;
	var id;
	var er;
	var ei;
	var br;
	var bi;
	var di;
	var j;
	var i;

	// Quick return if possible
	if ( N <= 1 ) {
		if ( N === 1 ) {
			// Scale row 0 of B by 1/D[0]: B[0,j] /= D[0] for all j
			zdscal( nrhs, 1.0 / d[ offsetD ], B, strideB2, offsetB );
		}
		return B;
	}

	// Get Float64 views of the Complex128Arrays
	ev = reinterpret( e, 0 );
	bv = reinterpret( B, 0 );

	// Convert complex-element strides/offsets to Float64 strides/offsets
	sB1 = strideB1 * 2;
	sB2 = strideB2 * 2;
	sE = strideE * 2;

	if ( iuplo === 1 ) {
		// Solve A * X = B using the factorization A = U^H * D * U,
		// Overwriting each right hand side vector with its solution.
		for ( j = 0; j < nrhs; j++ ) {
			ib = ( offsetB * 2 ) + ( j * sB2 );

			// Solve U^H * x = b (forward substitution)

			// B(i,j) = B(i,j) - B(i-1,j) * conj(E(i-1))
			ie = offsetE * 2;
			for ( i = 1; i < N; i++ ) {
				// conj(E(i-1)): (er, -ei)
				er = ev[ ie ];
				ei = -ev[ ie + 1 ]; // conjugate

				// B(i-1,j)
				br = bv[ ib + ( ( i - 1 ) * sB1 ) ];
				bi = bv[ ib + ( ( i - 1 ) * sB1 ) + 1 ];

				// B(i,j) -= B(i-1,j) * conj(E(i-1))

				// (a+bi)(c+di) = (ac-bd) + (ad+bc)i
				bv[ ib + ( i * sB1 ) ] -= ( br * er ) - ( bi * ei );
				bv[ ib + ( i * sB1 ) + 1 ] -= ( br * ei ) + ( bi * er );

				ie += sE;
			}

			// Solve D * U * x = b (backward substitution)
			// First: B(N-1,j) /= D(N-1)
			id = offsetD + ( ( N - 1 ) * strideD );
			di = d[ id ];
			bv[ ib + ( ( N - 1 ) * sB1 ) ] /= di;
			bv[ ib + ( ( N - 1 ) * sB1 ) + 1 ] /= di;

			// B(i,j) = B(i,j) / D(i) - B(i+1,j) * E(i)
			ie = ( offsetE * 2 ) + ( ( N - 2 ) * sE );
			id -= strideD;
			for ( i = N - 2; i >= 0; i-- ) {
				di = d[ id ];

				// E(i)
				er = ev[ ie ];
				ei = ev[ ie + 1 ];

				// B(i+1,j)
				br = bv[ ib + ( ( i + 1 ) * sB1 ) ];
				bi = bv[ ib + ( ( i + 1 ) * sB1 ) + 1 ];

				// B(i,j) = B(i,j) / D(i) - B(i+1,j) * E(i)
				bv[ ib + ( i * sB1 ) ] = ( bv[ ib + ( i * sB1 ) ] / di ) - ( ( br * er ) - ( bi * ei ) );
				bv[ ib + ( i * sB1 ) + 1 ] = ( bv[ ib + ( i * sB1 ) + 1 ] / di ) - ( ( br * ei ) + ( bi * er ) );

				ie -= sE;
				id -= strideD;
			}
		}
	} else {
		// Solve A * X = B using the factorization A = L * D * L^H,
		// Overwriting each right hand side vector with its solution.
		for ( j = 0; j < nrhs; j++ ) {
			ib = ( offsetB * 2 ) + ( j * sB2 );

			// Solve L * x = b (forward substitution)

			// B(i,j) = B(i,j) - B(i-1,j) * E(i-1)
			ie = offsetE * 2;
			for ( i = 1; i < N; i++ ) {
				// E(i-1) (no conjugate for lower forward sub)
				er = ev[ ie ];
				ei = ev[ ie + 1 ];

				// B(i-1,j)
				br = bv[ ib + ( ( i - 1 ) * sB1 ) ];
				bi = bv[ ib + ( ( i - 1 ) * sB1 ) + 1 ];

				// B(i,j) -= B(i-1,j) * E(i-1)
				bv[ ib + ( i * sB1 ) ] -= ( br * er ) - ( bi * ei );
				bv[ ib + ( i * sB1 ) + 1 ] -= ( br * ei ) + ( bi * er );

				ie += sE;
			}

			// Solve D * L^H * x = b (backward substitution)
			// First: B(N-1,j) /= D(N-1)
			id = offsetD + ( ( N - 1 ) * strideD );
			di = d[ id ];
			bv[ ib + ( ( N - 1 ) * sB1 ) ] /= di;
			bv[ ib + ( ( N - 1 ) * sB1 ) + 1 ] /= di;

			// B(i,j) = B(i,j) / D(i) - B(i+1,j) * conj(E(i))
			ie = ( offsetE * 2 ) + ( ( N - 2 ) * sE );
			id -= strideD;
			for ( i = N - 2; i >= 0; i-- ) {
				di = d[ id ];

				// conj(E(i)): (er, -ei)
				er = ev[ ie ];
				ei = -ev[ ie + 1 ]; // conjugate

				// B(i+1,j)
				br = bv[ ib + ( ( i + 1 ) * sB1 ) ];
				bi = bv[ ib + ( ( i + 1 ) * sB1 ) + 1 ];

				// B(i,j) = B(i,j) / D(i) - B(i+1,j) * conj(E(i))
				bv[ ib + ( i * sB1 ) ] = ( bv[ ib + ( i * sB1 ) ] / di ) - ( ( br * er ) - ( bi * ei ) );
				bv[ ib + ( i * sB1 ) + 1 ] = ( bv[ ib + ( i * sB1 ) + 1 ] / di ) - ( ( br * ei ) + ( bi * er ) );

				ie -= sE;
				id -= strideD;
			}
		}
	}

	return B;
}


// EXPORTS //

export default zptts2;
