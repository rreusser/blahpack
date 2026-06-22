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

/* eslint-disable max-len, max-params, max-statements, camelcase */

// MODULES //

import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import dlatsqr from './../../dlatsqr/lib/base.js';
import dorgtsqr_row from './../../dorgtsqr_row/lib/base.js';
import dorhr_col from './../../dorhr_col/lib/base.js';


// MAIN //

/**
* Computes a column-blocked QR factorization of a real `M`-by-`N` matrix `A` (with `M >= N`) via TSQR followed by Householder reconstruction.
*
* ## Notes
*
* -   The routine internally calls `dlatsqr` to compute a TSQR factorization with row block size `mb1` and column block size `nb1`, then uses `dorgtsqr_row` to reconstruct `Q1`, then `dorhr_col` to convert the orthonormal `Q1` into a sequence of standard Householder reflectors of column-block width `nb2`.
* -   On exit, the upper triangle of `A` contains the `N`-by-`N` factor `R` of the QR factorization `A = Q * R`; the strict lower trapezoid holds the Householder vectors `V` (compact-WY representation of `Q`), in the same layout as `dgeqrt`. `T` is the `nb2`-by-`N` matrix of upper triangular block reflectors.
* -   `WORK` is partitioned into three contiguous column-major segments: (a) the TSQR `T` array of length `LWT`, (b) an `N`-by-`N` scratch matrix temporarily storing the TSQR `R` factor, and (c) workspace for `dorgtsqr_row` (size `nb1local * max(nb1local, N - nb1local)`) which is also reused for the diagonal sign vector `D` (size `N`) of `dorhr_col`.
* -   Required total `WORK` length: `LWT + N*N + max( nb1local * max(nb1local, N - nb1local), N )`, where `nb1local = min(nb1, N)`, `num_all_row_blocks = max(1, ceil((M-N)/(mb1-N)))`, and `LWT = num_all_row_blocks * N * nb1local`.
* -   `mb1 > N` is required (TSQR row blocks must be strictly larger than the column count). `nb1 >= 1` and `nb2 >= 1`.
*
* @private
* @param {NonNegativeInteger} M - number of rows of the matrix `A` (`M >= N`)
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {PositiveInteger} mb1 - TSQR row block size (`mb1 > N`)
* @param {PositiveInteger} nb1 - TSQR column block size (`nb1 >= 1`)
* @param {PositiveInteger} nb2 - HRT (output) block size (`nb2 >= 1`)
* @param {Float64Array} A - input/output matrix; on entry the `M`-by-`N` matrix to factor, on exit the upper triangle holds `R` and the strict lower trapezoid holds the Householder vectors `V`
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} T - output `nb2`-by-`N` matrix of upper triangular block reflectors (compact-WY form)
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} WORK - workspace array (see Notes for layout and required length)
* @param {integer} strideWORK - stride length for `WORK` (must be `1`; `WORK` is treated as a contiguous column-major scratch buffer)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @returns {integer} status code (`0` = success)
*/
function dgetsqrhrt( M, N, mb1, nb1, nb2, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWORK, offsetWORK ) {
	var numAllRowBlocks;
	var nb1local;
	var nb2local;
	var ldwt;
	var oWR;
	var oWD;
	var lwt;
	var sgn;
	var i;
	var j;

	// Quick return if possible.
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	// Compute internal block sizes (clamp to N).
	nb1local = ( nb1 < N ) ? nb1 : N;
	nb2local = ( nb2 < N ) ? nb2 : N;

	// Length of the TSQR T array stored at the head of WORK.
	numAllRowBlocks = Math.max( 1, Math.ceil( ( M - N ) / ( mb1 - N ) ) );
	lwt = numAllRowBlocks * N * nb1local;
	ldwt = nb1local;

	// Offset (within WORK) of the temporary N-by-N R buffer.
	oWR = offsetWORK + ( lwt * strideWORK );

	// Offset (within WORK) of the dorgtsqr_row workspace / dorhr_col diagonal sign vector D.
	oWD = oWR + ( N * N * strideWORK );

	// (1) TSQR factorization of the M-by-N matrix A. The TSQR T array lives at WORK[offsetWORK..offsetWORK+lwt-1] (logically ldwt-by-(N*numAllRowBlocks), column-major); the dlatsqr work scratch is the LW1 segment immediately after.
	dlatsqr( M, N, mb1, nb1local, A, strideA1, strideA2, offsetA, WORK, strideWORK, ldwt * strideWORK, offsetWORK, WORK, strideWORK, oWR );

	// (2) Copy R_tsqr (upper triangle of A) into the N-by-N scratch matrix at WORK[oWR..oWR+N*N-1] column-by-column. Only the first j entries of each column j are upper-triangular; the rest are below the diagonal and irrelevant.

	// Fortran: DO J=1,N; CALL DCOPY(J, A(1,J), 1, WORK(LWT+N*(J-1)+1), 1).
	for ( j = 0; j < N; j += 1 ) {
		dcopy( j + 1, A, strideA1, offsetA + ( j * strideA2 ), WORK, strideWORK, oWR + ( j * N * strideWORK ) );
	}

	// (3) Reconstruct the M-by-N orthonormal Q1 from the TSQR output, in place in A. The dorgtsqr_row workspace (size LW2 = nb1local * max(nb1local, N-nb1local)) lives at WORK[oWD..].
	dorgtsqr_row( M, N, mb1, nb1local, A, strideA1, strideA2, offsetA, WORK, strideWORK, ldwt * strideWORK, offsetWORK, WORK, strideWORK, oWD );

	// (4) Reconstruct the standard Householder vectors V (in A) and block reflector T from Q1. The diagonal sign vector D is written into WORK[oWD..oWD+N-1] (this aliases the dorgtsqr_row workspace, which is no longer needed).
	dorhr_col( M, N, nb2local, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWORK, oWD );

	// (5)+(6) Copy R_tsqr from WORK[oWR..] back into the upper triangle of A, applying the sign flip from D as we go: rows where D[i] == -1 are negated. This realizes R_hr = S * R_tsqr.

	// Fortran: DO I=1,N; if D(I)==-1 then A(I,J)=-WORK(LWT+N*(J-1)+I) for J=I,N, else dcopy(N-I+1, WORK(LWT+N*(I-1)+I), N, A(I,I), LDA).
	for ( i = 0; i < N; i += 1 ) {
		if ( WORK[ oWD + ( i * strideWORK ) ] === -1.0 ) {
			sgn = -1.0;
		} else {
			sgn = 1.0;
		}
		// Walk row i of the scratch R from column i to column N-1 (in WORK these are at oWR + j*N + i, with stride N between successive columns) and write into A(i, i:N-1).
		for ( j = i; j < N; j += 1 ) {
			A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = sgn * WORK[ oWR + ( j * N * strideWORK ) + ( i * strideWORK ) ];
		}
	}
	return 0;
}


// EXPORTS //

export default dgetsqrhrt;
