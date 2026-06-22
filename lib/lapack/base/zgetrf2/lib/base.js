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

/* eslint-disable max-len, max-params, no-var */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import izamax from '../../../../blas/base/izamax/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import ztrsm from '../../../../blas/base/ztrsm/lib/base.js';
import zlaswp from '../../zlaswp/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );
var CNEGONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Computes an LU factorization of a general complex M-by-N matrix A using.
* partial pivoting with row interchanges (recursive algorithm).
*
* The factorization has the form `A = P*L*U` where P is a permutation
* matrix, L is lower triangular with unit diagonal elements (lower
* trapezoidal if M > N), and U is upper triangular (upper trapezoidal if
* M < N).
*
* IPIV stores 0-based pivot indices: row i was interchanged with row `IPIV[i]`.
*
* @private
* @param {NonNegativeInteger} M - number of rows of matrix A
* @param {NonNegativeInteger} N - number of columns of matrix A
* @param {Complex128Array} A - input/output complex matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (complex elements)
* @param {Int32Array} IPIV - pivot index output array, length min(M,N) (0-based)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @returns {integer} info - 0 if successful, k if U(k-1,k-1) is exactly zero (1-based singularity index)
*/
function zgetrf2( M, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV ) {
	var scratch;
	var sfmin;
	var iinfo;
	var minMN;
	var info;
	var pivR;
	var pivI;
	var invR;
	var invI;
	var tmpR;
	var tmpI;
	var sa1;
	var sa2;
	var Av;
	var oA;
	var n1;
	var n2;
	var ip;
	var ia;
	var ib;
	var i;

	sa1 = strideA1;
	sa2 = strideA2;

	info = 0;

	if ( M === 0 || N === 0 ) {
		return 0;
	}

	minMN = Math.min( M, N );

	// Get Float64Array view for element access
	Av = reinterpret( A, 0 );
	oA = offsetA * 2;

	if ( M === 1 ) {
		// 1x? row -- pivot index is self (0-based)
		IPIV[ offsetIPIV ] = 0;

		// Check if A(0,0) is zero
		if ( Av[ oA ] === 0.0 && Av[ oA + 1 ] === 0.0 ) {
			info = 1;
		}
	} else if ( N === 1 ) {
		// ?x1 column -- find pivot, swap, scale
		sfmin = dlamch( 'safe-minimum' );

		// Izamax returns 0-based index
		ip = izamax( M, A, sa1, offsetA );
		IPIV[ offsetIPIV ] = ip;

		// Check if A(ip, 0) is zero
		ia = oA + ((ip * sa1) * 2);
		if ( Av[ ia ] !== 0.0 || Av[ ia + 1 ] !== 0.0 ) {
			// Swap rows 0 and ip (swap complex elements = swap pairs of doubles)
			if ( ip !== 0 ) {
				tmpR = Av[ oA ];
				tmpI = Av[ oA + 1 ];
				Av[ oA ] = Av[ ia ];
				Av[ oA + 1 ] = Av[ ia + 1 ];
				Av[ ia ] = tmpR;
				Av[ ia + 1 ] = tmpI;
			}

			// Compute elements 1:M-1 of the column
			// Scale below the pivot: A(i,0) = A(i,0) / A(0,0) for i=1..M-1
			pivR = Av[ oA ];
			pivI = Av[ oA + 1 ];

			if ( Math.sqrt( (pivR * pivR) + (pivI * pivI) ) >= sfmin ) {
				// Use zscal with 1/A(0,0)
				// Compute 1/pivot using cmplx.divAt for stability
				scratch = new Float64Array( 6 );
				scratch[ 0 ] = 1.0;
				scratch[ 1 ] = 0.0;
				scratch[ 2 ] = pivR;
				scratch[ 3 ] = pivI;
				cmplx.divAt( scratch, 4, scratch, 0, scratch, 2 );
				invR = scratch[ 4 ];
				invI = scratch[ 5 ];
				zscal( M - 1, new Complex128( invR, invI ), A, sa1, offsetA + sa1 );
			} else {
				// Element-wise division for numerical safety with tiny pivot
				for ( i = 1; i < M; i++ ) {
					ib = oA + ((i * sa1) * 2);
					cmplx.divAt( Av, ib, Av, ib, Av, oA );
				}
			}
		} else {
			info = 1;
		}
	} else {
		// General case: recursive split
		n1 = Math.floor( minMN / 2 );
		n2 = N - n1;

		//        [  A11 | A12  ]

		//    A = [ -----|----- ]

		//        [  A21 | A22  ]

		// Where A11 is n1 columns, A22 is n2 columns

		// Factor [A11; A21] (M x n1)
		iinfo = zgetrf2( M, n1, A, sa1, sa2, offsetA, IPIV, strideIPIV, offsetIPIV );

		if ( info === 0 && iinfo > 0 ) {
			info = iinfo;
		}

		// Apply row interchanges to [A12; A22]
		// Reads IPIV at positions 0..n1-1 (offsetIPIV)
		zlaswp( n2, A, sa1, sa2, offsetA + (n1 * sa2), 0, n1 - 1, IPIV, strideIPIV, offsetIPIV, 1 );

		// Solve A11 * A12_new = A12 (triangular solve)

		// A11 is lower triangular with unit diagonal, n1 x n1
		ztrsm( 'left', 'lower', 'no-transpose', 'unit', n1, n2, CONE, A, sa1, sa2, offsetA, A, sa1, sa2, offsetA + (n1 * sa2));

		// Update A22 = A22 - A21 * A12_new
		zgemm( 'no-transpose', 'no-transpose', M - n1, n2, n1, CNEGONE, A, sa1, sa2, offsetA + (n1 * sa1), A, sa1, sa2, offsetA + (n1 * sa2), CONE, A, sa1, sa2, offsetA + (n1 * sa1) + (n1 * sa2));

		// Factor A22 (M-n1 x n2)
		iinfo = zgetrf2( M - n1, n2, A, sa1, sa2, offsetA + (n1 * sa1) + (n1 * sa2), IPIV, strideIPIV, offsetIPIV + (n1 * strideIPIV));

		if ( info === 0 && iinfo > 0 ) {
			info = iinfo + n1;
		}

		// Adjust IPIV for the second half: add n1 to each pivot index
		for ( i = n1; i < minMN; i++ ) {
			IPIV[ offsetIPIV + (i * strideIPIV) ] += n1;
		}

		// Apply the second set of row interchanges to A11 columns
		// Reads IPIV at positions n1..minMN-1 (offset by n1 from start)
		zlaswp( n1, A, sa1, sa2, offsetA, n1, minMN - 1, IPIV, strideIPIV, offsetIPIV + (n1 * strideIPIV), 1);
	}

	return info;
}


// EXPORTS //

export default zgetrf2;
