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

/* eslint-disable max-len, max-params, no-var, camelcase */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import ztrsm from '../../../../blas/base/ztrsm/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );
var CNEGONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Computes the modified LU factorization without pivoting of a complex general M-by-N matrix `A` (recursive kernel).
*
* The factorization has the form `A - S = L*U`, where `S` is a diagonal sign
* matrix with diagonal `D(i) = -sign(Re(A(i,i)))` (value after `i-1` steps of
* Gaussian elimination), `L` is lower triangular with unit diagonal, and `U`
* is upper triangular. Because `|D(i,i)| = 1` by construction, the diagonal
* pivot is at least one in magnitude so no pivoting is required for stability.
*
* This is an auxiliary routine used by `zunhr_col` for Householder
* reconstruction. It is the recursive kernel called by the blocked driver
* `zlaunhr_col_getrfnp`, but is self-sufficient and may be called directly.
*
* @private
* @param {NonNegativeInteger} M - number of rows of matrix `A`
* @param {NonNegativeInteger} N - number of columns of matrix `A`
* @param {Complex128Array} A - input/output complex matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (complex elements)
* @param {Complex128Array} D - output diagonal sign array (length `min(M,N)`); entries are `(+/-1, 0)`
* @param {integer} strideD - stride length for `D` (complex elements)
* @param {NonNegativeInteger} offsetD - starting index for `D` (complex elements)
* @returns {integer} status code (0 = success)
*/
function zlaunhr_col_getrfnp2( M, N, A, strideA1, strideA2, offsetA, D, strideD, offsetD ) {
	var scratch;
	var minMN;
	var sfmin;
	var pivR;
	var pivI;
	var invR;
	var invI;
	var absR;
	var sgn;
	var sa1;
	var sa2;
	var Av;
	var Dv;
	var oA;
	var oD;
	var n1;
	var n2;
	var ia;
	var ib;
	var i;

	if ( M === 0 || N === 0 ) {
		return 0;
	}

	sa1 = strideA1;
	sa2 = strideA2;

	Av = reinterpret( A, 0 );
	Dv = reinterpret( D, 0 );
	oA = offsetA * 2;
	oD = offsetD * 2;

	if ( M === 1 ) {
		// One row case (recursion termination).
		// D(0) = -sign(Re(A(0,0)));  A(0,0) -= D(0)
		absR = Av[ oA ];

		// Fortran DSIGN(1, x): returns +1 if x >= 0 (including -0), -1 if x < 0.
		sgn = ( absR < 0.0 ) ? -1.0 : 1.0;
		Dv[ oD ] = -sgn;
		Dv[ oD + 1 ] = 0.0;
		Av[ oA ] = absR + sgn; // A(0,0) - D(0) = A(0,0) + sign(Re)
		return 0;
	}
	if ( N === 1 ) {
		// One column case (recursion termination).
		absR = Av[ oA ];
		sgn = ( absR < 0.0 ) ? -1.0 : 1.0;
		Dv[ oD ] = -sgn;
		Dv[ oD + 1 ] = 0.0;
		Av[ oA ] = absR + sgn;

		// Construct subdiagonal elements of L by scaling column by 1/A(0,0).
		sfmin = dlamch( 'safe-minimum' );
		pivR = Av[ oA ];
		pivI = Av[ oA + 1 ];

		// CABS1 = |Re| + |Im|
		if ( Math.abs( pivR ) + Math.abs( pivI ) >= sfmin ) {
			// Compute 1/pivot via robust divAt, then scale with zscal.
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
			// Pivot near underflow: divide element-by-element with robust divAt.
			for ( i = 1; i < M; i++ ) {
				ib = oA + ( ( i * sa1 ) * 2 );
				cmplx.divAt( Av, ib, Av, ib, Av, oA );
			}
		}
		return 0;
	}

	// General case: recursive split.
	minMN = ( M < N ) ? M : N;
	n1 = ( minMN / 2 ) | 0;
	n2 = N - n1;

	// Factor B11 (n1 x n1).
	zlaunhr_col_getrfnp2( n1, n1, A, sa1, sa2, offsetA, D, strideD, offsetD );

	// Solve for B21:  B21 := B21 * U11^{-1}  (right / upper / no-transpose / non-unit).
	ztrsm( 'right', 'upper', 'no-transpose', 'non-unit', M - n1, n1, CONE, A, sa1, sa2, offsetA, A, sa1, sa2, offsetA + ( n1 * sa1 ) );

	// Solve for B12:  B12 := L11^{-1} * B12  (left / lower / no-transpose / unit).
	ztrsm( 'left', 'lower', 'no-transpose', 'unit', n1, n2, CONE, A, sa1, sa2, offsetA, A, sa1, sa2, offsetA + ( n1 * sa2 ) );

	// Update B22 := B22 - B21 * B12 (Schur complement).
	ia = offsetA + ( n1 * sa1 ); // A(n1, 0)
	ib = offsetA + ( n1 * sa2 ); // A(0, n1)
	zgemm( 'no-transpose', 'no-transpose', M - n1, n2, n1, CNEGONE, A, sa1, sa2, ia, A, sa1, sa2, ib, CONE, A, sa1, sa2, offsetA + ( n1 * sa1 ) + ( n1 * sa2 ) );

	// Factor B22 (M-n1 x n2).
	zlaunhr_col_getrfnp2( M - n1, n2, A, sa1, sa2, offsetA + ( n1 * sa1 ) + ( n1 * sa2 ), D, strideD, offsetD + ( n1 * strideD ) );

	return 0;
}


// EXPORTS //

export default zlaunhr_col_getrfnp2;
