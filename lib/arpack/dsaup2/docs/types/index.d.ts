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
* Persistent reverse-communication state for `dsaup2` (pass `{}` on first use).
*/
type State = Record<string, unknown>;

/**
* Interface describing `dsaup2`.
*/
interface Routine {
	/**
	* Intermediate driver for the Implicitly Restarted Lanczos iteration, via reverse communication.
	*
	* @param state - persistent reverse-communication state (pass `{}` on first use)
	* @param ido - reverse-communication flag (length-1; in/out)
	* @param bmat - `'standard'` or `'generalized'` eigenproblem
	* @param N - order of the problem
	* @param which - which eigenvalues to compute
	* @param nev - number of eigenvalues to compute (length-1; in/out)
	* @param np - number of implicit shifts (length-1; in/out)
	* @param tol - relative accuracy for Ritz value convergence
	* @param resid - residual vector (length N; in/out)
	* @param mode - problem mode
	* @param iupd - restart strategy flag
	* @param ishift - 0 user shifts (reverse communication), 1 exact shifts
	* @param mxiter - max (in) / actual (out) iterations (length-1; in/out)
	* @param V - Lanczos basis (column-major)
	* @param ldv - leading dimension of `V`
	* @param H - tridiagonal matrix in 2-column layout
	* @param ldh - leading dimension of `H`
	* @param ritz - Ritz values (out)
	* @param bounds - Ritz estimates (out)
	* @param Q - rotation accumulation matrix (column-major)
	* @param ldq - leading dimension of `Q`
	* @param workl - workspace array (length >= 3*(nev+np))
	* @param ipntr - operator pointers into `workd` (0-based; out)
	* @param workd - reverse-communication workspace (length >= 3*N)
	* @param infoIn - nonzero on the first call to signal a user-supplied initial residual
	* @returns INFO
	*/
	( state: State, ido: Int32Array, bmat: string, N: number, which: string, nev: Int32Array, np: Int32Array, tol: number, resid: Float64Array, mode: number, iupd: number, ishift: number, mxiter: Int32Array, V: Float64Array, ldv: number, H: Float64Array, ldh: number, ritz: Float64Array, bounds: Float64Array, Q: Float64Array, ldq: number, workl: Float64Array, ipntr: Int32Array, workd: Float64Array, infoIn: number ): number;

	/**
	* Intermediate driver for the Implicitly Restarted Lanczos iteration, using alternative indexing semantics.
	*
	* @param state - persistent reverse-communication state (pass `{}` on first use)
	* @param ido - reverse-communication flag (length-1; in/out)
	* @param bmat - `'standard'` or `'generalized'` eigenproblem
	* @param N - order of the problem
	* @param which - which eigenvalues to compute
	* @param nev - number of eigenvalues to compute (length-1; in/out)
	* @param np - number of implicit shifts (length-1; in/out)
	* @param tol - relative accuracy for Ritz value convergence
	* @param resid - residual vector (length N; in/out)
	* @param strideResid - stride length for `resid`
	* @param offsetResid - starting index for `resid`
	* @param mode - problem mode
	* @param iupd - restart strategy flag
	* @param ishift - 0 user shifts (reverse communication), 1 exact shifts
	* @param mxiter - max (in) / actual (out) iterations (length-1; in/out)
	* @param V - Lanczos basis
	* @param strideV1 - stride of the first (row) dimension of `V`
	* @param strideV2 - stride of the second (column) dimension of `V`
	* @param offsetV - starting index for `V`
	* @param H - tridiagonal matrix in 2-column layout
	* @param strideH1 - stride of the first (row) dimension of `H`
	* @param strideH2 - stride of the second (column) dimension of `H`
	* @param offsetH - starting index for `H`
	* @param ritz - Ritz values (out)
	* @param strideRitz - stride length for `ritz`
	* @param offsetRitz - starting index for `ritz`
	* @param bounds - Ritz estimates (out)
	* @param strideBounds - stride length for `bounds`
	* @param offsetBounds - starting index for `bounds`
	* @param Q - rotation accumulation matrix
	* @param strideQ1 - stride of the first (row) dimension of `Q`
	* @param strideQ2 - stride of the second (column) dimension of `Q`
	* @param offsetQ - starting index for `Q`
	* @param workl - workspace array (length >= 3*(nev+np))
	* @param strideWorkl - stride length for `workl`
	* @param offsetWorkl - starting index for `workl`
	* @param ipntr - operator pointers into `workd` (0-based; out)
	* @param strideIpntr - stride length for `ipntr`
	* @param offsetIpntr - starting index for `ipntr`
	* @param workd - reverse-communication workspace (length >= 3*N)
	* @param strideWorkd - stride length for `workd`
	* @param offsetWorkd - starting index for `workd`
	* @param infoIn - nonzero on the first call to signal a user-supplied initial residual
	* @returns INFO
	*/
	ndarray( state: State, ido: Int32Array, bmat: string, N: number, which: string, nev: Int32Array, np: Int32Array, tol: number, resid: Float64Array, strideResid: number, offsetResid: number, mode: number, iupd: number, ishift: number, mxiter: Int32Array, V: Float64Array, strideV1: number, strideV2: number, offsetV: number, H: Float64Array, strideH1: number, strideH2: number, offsetH: number, ritz: Float64Array, strideRitz: number, offsetRitz: number, bounds: Float64Array, strideBounds: number, offsetBounds: number, Q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, workl: Float64Array, strideWorkl: number, offsetWorkl: number, ipntr: Int32Array, strideIpntr: number, offsetIpntr: number, workd: Float64Array, strideWorkd: number, offsetWorkd: number, infoIn: number ): number;
}

/**
* Intermediate driver for the Implicitly Restarted Lanczos iteration, via reverse communication.
*/
declare var dsaup2: Routine;


// EXPORTS //

export = dsaup2;
