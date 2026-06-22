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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';
import zlaswp from '../../zlaswp/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

var EPS = dlamch( 'precision' );
var SMLNUM = dlamch( 'safe-minimum' ) / EPS;


// MAIN //

/**
* Solves a system of linear equations `A * X = scale * RHS` with a general.
* N-by-N matrix A using the LU factorization with complete pivoting computed
* by zgetc2.
*
* IPIV and JPIV are 0-based pivot indices from zgetc2.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - LU-factored N-by-N matrix from zgetc2
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} RHS - right-hand side vector (overwritten with solution)
* @param {integer} strideRHS - stride for RHS (in complex elements)
* @param {NonNegativeInteger} offsetRHS - starting index for RHS (in complex elements)
* @param {Int32Array} IPIV - row pivot indices from zgetc2, 0-based
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - starting index for IPIV
* @param {Int32Array} JPIV - column pivot indices from zgetc2, 0-based
* @param {integer} strideJPIV - stride for JPIV
* @param {NonNegativeInteger} offsetJPIV - starting index for JPIV
* @param {Float64Array} scale - output: `scale[0]` receives the scaling factor
*/
function zgesc2( N, A, strideA1, strideA2, offsetA, RHS, strideRHS, offsetRHS, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV, scale ) {
	var tempR;
	var tempI;
	var prodR;
	var prodI;
	var sa1;
	var sa2;
	var Av;
	var Rv;
	var oA;
	var sr;
	var ia;
	var ir;
	var ij;
	var jj;
	var tr;
	var i;
	var j;

	Av = reinterpret( A, 0 );
	Rv = reinterpret( RHS, 0 );
	oA = offsetA * 2;
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sr = strideRHS * 2;

	// Apply row permutations (forward): CALL ZLASWP(1, RHS, LDA, 1, N-1, IPIV, 1)

	// Zlaswp expects complex-element strides; k1=0, k2=N-2 (0-based)
	zlaswp( 1, RHS, strideRHS, strideRHS, offsetRHS, 0, N - 2, IPIV, strideIPIV, offsetIPIV, 1 );

	// Solve L * x = RHS (unit lower triangular forward substitution)
	for ( i = 0; i < N - 1; i += 1 ) {
		ir = ( offsetRHS * 2 ) + ( i * sr );
		for ( j = i + 1; j < N; j += 1 ) {
			// RHS(j) -= A(j,i) * RHS(i)
			ia = oA + ( j * sa1 ) + ( i * sa2 );
			tr = ( offsetRHS * 2 ) + ( j * sr );

			// Temp = A(j,i) * RHS(i), inline complex multiply
			tempR = ( Av[ ia ] * Rv[ ir ] ) - ( Av[ ia + 1 ] * Rv[ ir + 1 ] );
			tempI = ( Av[ ia ] * Rv[ ir + 1 ] ) + ( Av[ ia + 1 ] * Rv[ ir ] );

			// RHS(j) -= temp
			Rv[ tr ] -= tempR;
			Rv[ tr + 1 ] -= tempI;
		}
	}

	// Scale if needed to avoid overflow in back substitution
	scale[ 0 ] = 1.0;

	i = izamax( N, RHS, strideRHS, offsetRHS );
	ir = ( offsetRHS * 2 ) + ( i * sr );
	ia = oA + ( ( N - 1 ) * sa1 ) + ( ( N - 1 ) * sa2 );

	// 2*SMLNUM*|RHS(i)| > |A(N,N)|
	if ( 2.0 * SMLNUM * cmplx.absAt( Rv, ir ) > cmplx.absAt( Av, ia ) ) {
		// TEMP = DCMPLX(0.5, 0) / |RHS(i)|
		tempR = 0.5 / cmplx.absAt( Rv, ir );
		zscal( N, new Complex128( tempR, 0.0 ), RHS, strideRHS, offsetRHS );
		scale[ 0 ] *= tempR;
	}

	// Solve U * x = RHS (upper triangular back substitution)
	// Fortran:
	//   TEMP = DCMPLX(1, 0) / A(I, I)
	//   RHS(I) = RHS(I) * TEMP
	//   DO J = I+1, N
	//     RHS(I) = RHS(I) - RHS(J) * (A(I, J) * TEMP)
	//   END DO
	for ( i = N - 1; i >= 0; i -= 1 ) {
		// TEMP = 1 / A(i,i) — complex division, must use cmplx.divAt
		ia = oA + ( i * sa1 ) + ( i * sa2 );
		ir = ( offsetRHS * 2 ) + ( i * sr );

		// Compute temp = (1+0i) / A(i,i)

		// We use Smith's formula via manual implementation since we need the value as locals
		tempR = Av[ ia ];
		tempI = Av[ ia + 1 ];
		if ( Math.abs( tempI ) <= Math.abs( tempR ) ) {
			tr = tempI / tempR;
			prodR = tempR + ( tempI * tr );
			tempR = 1.0 / prodR;
			tempI = -tr / prodR;
		} else {
			tr = tempR / tempI;
			prodR = tempI + ( tempR * tr );
			tempR = tr / prodR;
			tempI = -1.0 / prodR;
		}

		// RHS(i) *= TEMP
		prodR = ( Rv[ ir ] * tempR ) - ( Rv[ ir + 1 ] * tempI );
		prodI = ( Rv[ ir ] * tempI ) + ( Rv[ ir + 1 ] * tempR );
		Rv[ ir ] = prodR;
		Rv[ ir + 1 ] = prodI;

		for ( j = i + 1; j < N; j += 1 ) {
			// RHS(i) -= RHS(j) * (A(i,j) * TEMP)
			ij = oA + ( i * sa1 ) + ( j * sa2 );
			jj = ( offsetRHS * 2 ) + ( j * sr );

			// Prod = A(i,j) * TEMP
			prodR = ( Av[ ij ] * tempR ) - ( Av[ ij + 1 ] * tempI );
			prodI = ( Av[ ij ] * tempI ) + ( Av[ ij + 1 ] * tempR );

			// RHS(i) -= RHS(j) * prod
			Rv[ ir ] -= ( Rv[ jj ] * prodR ) - ( Rv[ jj + 1 ] * prodI );
			Rv[ ir + 1 ] -= ( Rv[ jj ] * prodI ) + ( Rv[ jj + 1 ] * prodR );
		}
	}

	// Apply column permutations (reverse): CALL ZLASWP(1, RHS, LDA, 1, N-1, JPIV, -1)
	// Zlaswp with incx=-1 applies in reverse order; k1=N-2, k2=0 (0-based)
	zlaswp( 1, RHS, strideRHS, strideRHS, offsetRHS, N - 2, 0, JPIV, strideJPIV, offsetJPIV, -1 );
}


// EXPORTS //

export default zgesc2;
