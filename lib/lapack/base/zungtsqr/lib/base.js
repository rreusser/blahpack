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
import zlaset from './../../zlaset/lib/base.js';
import zlamtsqr from './../../zlamtsqr/lib/base.js';


// VARIABLES //

var CZERO = new Complex128( 0.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Generates an `M`-by-`N` complex matrix `Q` with orthonormal columns from a Tall-Skinny QR factorization (the V/T output of `zlatsqr`).
*
* `Q` consists of the first `N` columns of an `M`-by-`M` unitary matrix
*
* ```text
* Q_out = first_N_columns_of( Q(1)*Q(2)*...*Q(k) ),
* ```
*
* where each `Q(i)` is a compact-WY block reflector represented by the lower-trapezoidal columns of `A` and the corresponding triangular block of `T`. On exit, the columns of `A` contain the matrix `Q`.
*
* The implementation forms `Q` by applying `Q` (via `zlamtsqr` with `side='left'`, `trans='no-transpose'`) to the `M`-by-`N` identity matrix held in the workspace, then copies the result back into `A` column-by-column.
*
* `WORK` partitioning (in complex elements):
*
* -   `WORK[0 .. M*N-1]`: the `M`-by-`N` matrix passed to `zlamtsqr` (initialized to identity, overwritten with `Q`).
* -   `WORK[M*N .. M*N + N*nblocal - 1]`: scratch passed to `zlamtsqr` (`nblocal = min(nb, N)`).
*
* Required size: `(M + nb)*N` complex elements (matches Fortran `LWORK >= (M+NB)*N`).
*
* @private
* @param {NonNegativeInteger} M - number of rows of `A` (`M >= 0`)
* @param {NonNegativeInteger} N - number of columns of `A` (`0 <= N <= M`)
* @param {PositiveInteger} mb - row block size used by `zlatsqr` to produce `A` and `T` (`mb > N`; capped at `M` if `mb > M`)
* @param {PositiveInteger} nb - column block size used by `zlatsqr` (`nb >= 1`; effectively capped at `N`)
* @param {Complex128Array} A - input/output matrix, on entry holds the reflector vectors (lower trapezoidal) produced by `zlatsqr`; on exit holds the orthonormal `Q`
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} T - block triangular factors produced by `zlatsqr`
* @param {integer} strideT1 - stride of the first dimension of `T` (in complex elements)
* @param {integer} strideT2 - stride of the second dimension of `T` (in complex elements)
* @param {NonNegativeInteger} offsetT - starting index for `T` (in complex elements)
* @param {Complex128Array} WORK - workspace buffer of length `>= (M + nb)*N` complex elements
* @param {integer} strideWORK - element stride for `WORK` (in complex elements; typically 1)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (in complex elements)
* @returns {integer} status code (0 = success)
*/
function zungtsqr( M, N, mb, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWORK, offsetWORK ) {
	var nblocal;
	var ldc;
	var sa1;
	var sa2;
	var Av;
	var Wv;
	var ia;
	var iw;
	var lc;
	var oA;
	var oW;
	var sw;
	var i;
	var j;

	// Quick return if possible.
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	// Set block size for column blocks (matches Fortran NBLOCAL = MIN(NB, N)).
	nblocal = ( nb < N ) ? nb : N;

	// LDC = M (stride for the workspace matrix C); WORK partitioning is `[C(M,N) | scratch(N*NBLOCAL)]`.
	ldc = M;
	lc = ldc * N;

	// Step 1: form the M-by-N identity in WORK[0..M*N-1] (treated as column-major with stride1=1, stride2=M).
	zlaset( 'full', M, N, CZERO, CONE, WORK, strideWORK, ldc * strideWORK, offsetWORK );

	// Step 2: apply Q from the left (no-transpose) to the identity, producing Q1_in (the first N columns of Q) in WORK[0..M*N-1].
	zlamtsqr('left', 'no-transpose', M, N, N, mb, nblocal, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWORK, ldc * strideWORK, offsetWORK, WORK, strideWORK, offsetWORK + ( lc * strideWORK ), N * nblocal);

	// Step 3: copy WORK(1:M, 1:N) into A(1:M, 1:N) column by column. Both use complex-element strides; reinterpret to Float64 and copy 2 doubles per element to avoid Complex128 allocation per element.
	Av = reinterpret( A, 0 );
	Wv = reinterpret( WORK, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sw = strideWORK * 2;
	oA = offsetA * 2;
	oW = offsetWORK * 2;
	for ( j = 0; j < N; j++ ) {
		ia = oA + ( j * sa2 );
		iw = oW + ( j * ldc * sw );
		for ( i = 0; i < M; i++ ) {
			Av[ ia ] = Wv[ iw ];
			Av[ ia + 1 ] = Wv[ iw + 1 ];
			ia += sa1;
			iw += sw;
		}
	}
	return 0;
}


// EXPORTS //

export default zungtsqr;
