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
* Persistent reverse-communication state for `dgetv0`. Pass `{}` on the first
* call and thread the same object through every subsequent call.
*/
type State = Record<string, unknown>;

/**
* Interface describing `dgetv0`.
*/
interface Routine {
	/**
	* Generates the initial residual vector for the symmetric Lanczos/Arnoldi iteration, orthogonal to the current `V` basis, via reverse communication.
	*
	* @param state - persistent reverse-communication state (pass `{}` on first use)
	* @param ido - reverse-communication flag (length-1; in/out)
	* @param bmat - `'I'` (standard) or `'G'` (generalized) eigenproblem
	* @param itry - restart attempt counter (>= 1)
	* @param initv - if `true`, `resid` already holds an initial vector; if `false`, it is randomized
	* @param N - order of the problem
	* @param j - index of the residual vector to be generated
	* @param V - Lanczos/Arnoldi basis (N-by-j, column-major)
	* @param ldv - leading dimension of `V`
	* @param resid - residual vector (length N; in/out)
	* @param rnorm - B-norm of the generated residual (length-1; out)
	* @param ipntr - pointers into `workd` for the operator (0-based; out)
	* @param workd - reverse-communication workspace (length >= 2*N)
	* @returns IERR (0 on success, -1 if refinement failed)
	*/
	( state: State, ido: Int32Array, bmat: string, itry: number, initv: boolean, N: number, j: number, V: Float64Array, ldv: number, resid: Float64Array, rnorm: Float64Array, ipntr: Int32Array, workd: Float64Array ): number;

	/**
	* Generates the initial residual vector for the symmetric Lanczos/Arnoldi iteration, orthogonal to the current `V` basis, via reverse communication, using alternative indexing semantics.
	*
	* @param state - persistent reverse-communication state (pass `{}` on first use)
	* @param ido - reverse-communication flag (length-1; in/out)
	* @param bmat - `'I'` (standard) or `'G'` (generalized) eigenproblem
	* @param itry - restart attempt counter (>= 1)
	* @param initv - if `true`, `resid` already holds an initial vector; if `false`, it is randomized
	* @param N - order of the problem
	* @param j - index of the residual vector to be generated
	* @param V - Lanczos/Arnoldi basis (N-by-j)
	* @param strideV1 - stride of the first (row) dimension of `V`
	* @param strideV2 - stride of the second (column) dimension of `V`
	* @param offsetV - starting index for `V`
	* @param resid - residual vector (length N; in/out)
	* @param strideResid - stride length for `resid`
	* @param offsetResid - starting index for `resid`
	* @param rnorm - B-norm of the generated residual (length-1; out)
	* @param ipntr - pointers into `workd` for the operator (0-based; out)
	* @param strideIpntr - stride length for `ipntr`
	* @param offsetIpntr - starting index for `ipntr`
	* @param workd - reverse-communication workspace (length >= 2*N)
	* @param strideWorkd - stride length for `workd`
	* @param offsetWorkd - starting index for `workd`
	* @returns IERR (0 on success, -1 if refinement failed)
	*/
	ndarray( state: State, ido: Int32Array, bmat: string, itry: number, initv: boolean, N: number, j: number, V: Float64Array, strideV1: number, strideV2: number, offsetV: number, resid: Float64Array, strideResid: number, offsetResid: number, rnorm: Float64Array, ipntr: Int32Array, strideIpntr: number, offsetIpntr: number, workd: Float64Array, strideWorkd: number, offsetWorkd: number ): number;
}

/**
* Generates the initial residual vector for the symmetric Lanczos/Arnoldi iteration via reverse communication.
*/
declare var dgetv0: Routine;


// EXPORTS //

export = dgetv0;
