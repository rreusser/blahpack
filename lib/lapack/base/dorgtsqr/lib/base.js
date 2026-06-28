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

import dlaset from './../../dlaset/lib/base.js';
import dlamtsqr from './../../dlamtsqr/lib/base.js';


// MAIN //

/**
* Generates an `M`-by-`N` real matrix `Q` with orthonormal columns from a Tall-Skinny QR factorization (`dlatsqr`).
*
* The output `Q` consists of the first `N` columns of the orthogonal matrix produced by `dlatsqr`. The implementation forms `Q` by applying the implicitly-stored `Q` (in `A` and `T`) to the leading `M`-by-`N` columns of the identity matrix using `dlamtsqr`.
*
* ## Notes
*
* -   The lower-trapezoidal portion of `A` (below the main diagonal, with implicit unit diagonal) holds the Householder reflectors produced by `dlatsqr`; the upper triangle is overwritten on exit.
* -   `T` holds the block triangular factors produced by `dlatsqr` and is read-only.
* -   `mb > N` and `nb >= 1` are required (matching the constraints of `dlatsqr`).
* -   `WORK` is used as scratch space and must have length at least `M*N + N*min(nb,N)` doubles (matching the LAPACK `LWORK >= (M+nb)*N` requirement). The first `M*N` entries hold an internal `M`-by-`N` column-major buffer (initially the identity, then `Q`); the remaining `N*min(nb,N)` entries are passed to `dlamtsqr` as its workspace.
*
* @private
* @param {NonNegativeInteger} M - number of rows of `Q` (`M >= 0`)
* @param {NonNegativeInteger} N - number of columns of `Q` (`0 <= N <= M`)
* @param {PositiveInteger} mb - row block size used by `dlatsqr` (`mb > N`)
* @param {PositiveInteger} nb - column block size used by `dlatsqr` (`nb >= 1`)
* @param {Float64Array} A - input/output matrix; on entry contains the reflector vectors below the diagonal, on exit contains `Q`
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} T - block triangular factors from `dlatsqr`
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} WORK - workspace of length at least `M*N + N*min(nb,N)`
* @param {integer} strideWork - element stride for `WORK` (must be `1`)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} status code (`0` = success)
*/
function dorgtsqr( M, N, mb, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork ) {
	var nblocal;
	var ldc;
	var oc;
	var ow;
	var i;
	var j;

	// Quick return if possible.
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	// Block size for the column dimension when calling dlamtsqr.
	nblocal = ( nb < N ) ? nb : N;

	// Partition WORK: the first M*N entries hold an internal column-major M-by-N buffer C (used as identity, then Q1); the remaining entries are dlamtsqr's scratch.
	ldc = M;
	oc = offsetWork;
	ow = offsetWork + ( ldc * N * strideWork );

	// (1a) Initialize C to the M-by-N matrix [I; 0] (ones on the diagonal, zeros elsewhere).
	dlaset( 'all', M, N, 0.0, 1.0, WORK, strideWork, ldc * strideWork, oc );

	// (1b) Apply Q from the left to C: on output, the first M*N entries hold the M-by-N orthonormal Q1.
	dlamtsqr( 'left', 'no-transpose', M, N, N, mb, nblocal, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWork, ldc * strideWork, oc, WORK, strideWork, ow );

	// (2) Copy the result column-by-column from the workspace into the output matrix A.
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ offsetA + ( i * strideA1 ) + ( j * strideA2 ) ] = WORK[ oc + ( ( ( j * ldc ) + i ) * strideWork ) ];
		}
	}
	return 0;
}


// EXPORTS //

export default dorgtsqr;
