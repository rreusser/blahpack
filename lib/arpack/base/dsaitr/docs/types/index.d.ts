/*
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

// TypeScript Version: 4.1

/// <reference types="@stdlib/types"/>

/**
* Persistent reverse-communication state for `dsaitr` (pass `{}` on first use).
*/
type State = Record<string, unknown>;

/**
* Interface describing `dsaitr`.
*/
interface Routine {
	/**
	* Extends a symmetric Lanczos factorization from length `k` to `k+np`, via reverse communication.
	*
	* @param state - persistent reverse-communication state (pass `{}` on first use)
	* @param ido - reverse-communication flag (length-1; in/out)
	* @param bmat - `'standard'` or `'generalized'` eigenproblem
	* @param N - order of the problem
	* @param k - current order of the factorization
	* @param np - number of additional steps
	* @param mode - problem mode
	* @param resid - residual vector (length N; in/out)
	* @param rnorm - B-norm of the residual (length-1; in/out)
	* @param V - Lanczos basis (N-by-(k+np), column-major)
	* @param ldv - leading dimension of `V`
	* @param H - tridiagonal matrix in 2-column layout
	* @param ldh - leading dimension of `H`
	* @param ipntr - operator pointers into `workd` (0-based; out)
	* @param workd - reverse-communication workspace (length >= 3*N)
	* @returns INFO
	*/
	( state: State, ido: Int32Array, bmat: string, N: number, k: number, np: number, mode: number, resid: Float64Array, rnorm: Float64Array, V: Float64Array, ldv: number, H: Float64Array, ldh: number, ipntr: Int32Array, workd: Float64Array ): number;

	/**
	* Extends a symmetric Lanczos factorization, using alternative indexing semantics.
	*
	* @param state - persistent reverse-communication state (pass `{}` on first use)
	* @param ido - reverse-communication flag (length-1; in/out)
	* @param bmat - `'standard'` or `'generalized'` eigenproblem
	* @param N - order of the problem
	* @param k - current order of the factorization
	* @param np - number of additional steps
	* @param mode - problem mode
	* @param resid - residual vector (length N; in/out)
	* @param strideResid - stride length for `resid`
	* @param offsetResid - starting index for `resid`
	* @param rnorm - B-norm of the residual (length-1; in/out)
	* @param V - Lanczos basis (N-by-(k+np))
	* @param strideV1 - stride of the first (row) dimension of `V`
	* @param strideV2 - stride of the second (column) dimension of `V`
	* @param offsetV - starting index for `V`
	* @param H - tridiagonal matrix in 2-column layout
	* @param strideH1 - stride of the first (row) dimension of `H`
	* @param strideH2 - stride of the second (column) dimension of `H`
	* @param offsetH - starting index for `H`
	* @param ipntr - operator pointers into `workd` (0-based; out)
	* @param strideIpntr - stride length for `ipntr`
	* @param offsetIpntr - starting index for `ipntr`
	* @param workd - reverse-communication workspace (length >= 3*N)
	* @param strideWorkd - stride length for `workd`
	* @param offsetWorkd - starting index for `workd`
	* @returns INFO
	*/
	ndarray( state: State, ido: Int32Array, bmat: string, N: number, k: number, np: number, mode: number, resid: Float64Array, strideResid: number, offsetResid: number, rnorm: Float64Array, V: Float64Array, strideV1: number, strideV2: number, offsetV: number, H: Float64Array, strideH1: number, strideH2: number, offsetH: number, ipntr: Int32Array, strideIpntr: number, offsetIpntr: number, workd: Float64Array, strideWorkd: number, offsetWorkd: number ): number;
}

/**
* Extends a symmetric Lanczos factorization via reverse communication.
*/
declare var dsaitr: Routine;


// EXPORTS //

export = dsaitr;
