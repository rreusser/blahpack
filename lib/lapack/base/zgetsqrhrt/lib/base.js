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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import zlatsqr from './../../zlatsqr/lib/base.js';
import zungtsqrRow from './../../zungtsqr_row/lib/base.js';
import zunhrCol from './../../zunhr_col/lib/base.js';


// MAIN //

/**
* Computes a column-blocked QR factorization of a complex `M`-by-`N` matrix `A` using TSQR followed by Householder reconstruction.
*
* ## Notes
*
* -   Computes `A = Q * R` where the output `Q` and `R` factors are stored in the same format as `zgeqrt` (`Q` in blocked compact `WY`-representation).
* -   Internally performs an `mb1`-row, `nb1`-column blocked TSQR factorization (`zlatsqr`), reconstructs the orthonormal columns of `Q` (`zungtsqr_row`), and recovers the Householder vectors and block reflector factor `T` (`zunhr_col`). The R-factor from TSQR is then sign-corrected to match the Householder QR.
* -   Requires `M >= N`, `mb1 > N`, `nb1 >= 1`, `nb2 >= 1`. Leading dimensions of `T` must satisfy `LDT >= max(1, min(nb2, N))`.
* -   Workspace arrays are allocated internally; no external `WORK` is required.
*
* @private
* @param {NonNegativeInteger} M - number of rows of the matrix `A` (`M >= N`)
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {PositiveInteger} mb1 - row block size for the internal TSQR (`mb1 > N`)
* @param {PositiveInteger} nb1 - column block size for the internal TSQR (`nb1 >= 1`)
* @param {PositiveInteger} nb2 - block size for the output blocked QR (`nb2 >= 1`)
* @param {Complex128Array} A - input/output matrix (column-major). On exit, the upper-triangular part contains `R` and the strictly lower part contains the Householder vectors `V` (compact `WY` representation).
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} T - output upper-triangular block reflector factors, stored as a sequence of `min(nb2,N)`-by-`min(nb2,N)` blocks of leading dimension `min(nb2,N)`
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @returns {integer} status code (`0` = success)
*/
function zgetsqrhrt( M, N, mb1, nb1, nb2, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT ) {
	var numBlocks;
	var nb1local;
	var nb2local;
	var Rwork;
	var Twork;
	var WORK;
	var ldwt;
	var lwt;
	var lw1;
	var lw2;
	var Av;
	var Rv;
	var ar;
	var ai;
	var oA;
	var oR;
	var D;
	var i;
	var j;

	// Quick return if possible.
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	nb1local = ( nb1 < N ) ? nb1 : N;
	nb2local = ( nb2 < N ) ? nb2 : N;

	// NUM_ALL_ROW_BLOCKS = max(1, ceil((M-N)/(mb1-N))). Safe because the caller guarantees mb1 > N.
	if ( M > N ) {
		numBlocks = Math.ceil( ( M - N ) / ( mb1 - N ) );
		if ( numBlocks < 1 ) {
			numBlocks = 1;
		}
	} else {
		numBlocks = 1;
	}

	// Workspace partitioning matches the Fortran reference:
	//   Twork = nb1local-by-(numBlocks*N) tile of T-blocks for zlatsqr (leading dim ldwt = nb1local).
	//   WORK  = max(lw1, lw2) scratch (used by zlatsqr first, then by zungtsqr_row).
	//   Rwork = N-by-N scratch holding R_tsqr column-by-column.
	//   D     = real diagonal-sign vector for zunhr_col (length N).
	ldwt = nb1local;
	lwt = numBlocks * N * nb1local;
	lw1 = nb1local * N;
	lw2 = nb1local * Math.max( nb1local, N - nb1local );

	Twork = new Complex128Array( lwt );
	WORK = new Complex128Array( ( lw1 > lw2 ) ? lw1 : lw2 );
	Rwork = new Complex128Array( N * N );
	D = new Float64Array( N );

	// (1) Perform TSQR-factorization of the M-by-N matrix A.
	zlatsqr( M, N, mb1, nb1local, A, strideA1, strideA2, offsetA, Twork, 1, ldwt, 0, WORK, 1, 0 );

	// (2) Copy R_tsqr (upper-triangular part of A) into the square N-by-N matrix Rwork column-by-column.
	for ( j = 0; j < N; j++ ) {
		// Zcopy of length j+1 from A(:, j) -> Rwork(:, j).
		zcopy( j + 1, A, strideA1, offsetA + ( j * strideA2 ), Rwork, 1, j * N );
	}

	// (3) Generate the M-by-N matrix Q with orthonormal columns from the result stored below the diagonal in A (in place).
	zungtsqrRow( M, N, mb1, nb1local, A, strideA1, strideA2, offsetA, Twork, 1, ldwt, 0, WORK, 1, 0 );

	// (4) Reconstruct Householder vectors from the matrix Q (stored in A) in place; produces V (in A), the block reflector T, and the diagonal sign vector D.
	zunhrCol( M, N, nb2local, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, D, 1, 0 );

	// (5) and (6): Combined loop. Copy R_tsqr from Rwork back into the upper-triangular part of A while applying the diagonal sign correction R_hr = S * R_tsqr.

	// D[i] is +/- 1; when D[i] === -1, negate row i of R during the copy.
	Av = reinterpret( A, 0 );
	Rv = reinterpret( Rwork, 0 );
	for ( i = 0; i < N; i++ ) {
		if ( D[ i ] === -1.0 ) {
			// Row i needs negation: A(i, j) = -R_tsqr(i, j) for j = i..N-1.
			for ( j = i; j < N; j++ ) {
				oA = 2 * ( offsetA + ( i * strideA1 ) + ( j * strideA2 ) );
				oR = 2 * ( ( j * N ) + i );
				ar = Rv[ oR ];
				ai = Rv[ oR + 1 ];
				Av[ oA ] = -ar;
				Av[ oA + 1 ] = -ai;
			}
		} else {
			// D[i] === +1: copy R_tsqr row i into A row i unchanged. Length = N - i. Source stride is N (across columns of Rwork), dest stride is strideA2 (across columns of A).
			zcopy( N - i, Rwork, N, ( i * N ) + i, A, strideA2, offsetA + ( i * strideA1 ) + ( i * strideA2 ) );
		}
	}

	return 0;
}


// EXPORTS //

export default zgetsqrhrt;
