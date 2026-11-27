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
* Persistent reverse-communication state for `dsaupd` (pass `{}` on first use).
*/
type State = Record<string, unknown>;

/**
* Interface describing `dsaupd`.
*/
interface Routine {
	/**
	* Reverse communication interface for the Implicitly Restarted Lanczos iteration.
	*
	* @param state - persistent reverse-communication state (pass `{}` on first use)
	* @param ido - reverse-communication flag (length-1; in/out)
	* @param bmat - `'standard'` or `'generalized'` eigenproblem
	* @param N - order of the problem
	* @param which - which eigenvalues to compute
	* @param nev - number of eigenvalues to compute
	* @param tol - relative accuracy for Ritz value convergence
	* @param resid - residual vector (length N; in/out)
	* @param ncv - number of Lanczos vectors (columns of `V`)
	* @param V - Lanczos basis (column-major; out)
	* @param ldv - leading dimension of `V`
	* @param iparam - input/output parameters (length 11; in/out)
	* @param ipntr - workspace pointers (length 11; out)
	* @param workd - reverse-communication workspace (length >= 3*N)
	* @param workl - private workspace (length >= ncv^2 + 8*ncv)
	* @param lworkl - length of `workl`
	* @param infoIn - nonzero on the first call to signal a user-supplied initial residual
	* @returns INFO
	*/
	( state: State, ido: Int32Array, bmat: string, N: number, which: string, nev: number, tol: number, resid: Float64Array, ncv: number, V: Float64Array, ldv: number, iparam: Int32Array, ipntr: Int32Array, workd: Float64Array, workl: Float64Array, lworkl: number, infoIn: number ): number;

	/**
	* Reverse communication interface for the Implicitly Restarted Lanczos iteration, using alternative indexing semantics.
	*
	* @param state - persistent reverse-communication state (pass `{}` on first use)
	* @param ido - reverse-communication flag (length-1; in/out)
	* @param bmat - `'standard'` or `'generalized'` eigenproblem
	* @param N - order of the problem
	* @param which - which eigenvalues to compute
	* @param nev - number of eigenvalues to compute
	* @param tol - relative accuracy for Ritz value convergence
	* @param resid - residual vector (length N; in/out)
	* @param strideResid - stride length for `resid`
	* @param offsetResid - starting index for `resid`
	* @param ncv - number of Lanczos vectors (columns of `V`)
	* @param V - Lanczos basis (column-major; out)
	* @param strideV1 - stride of the first (row) dimension of `V`
	* @param strideV2 - stride of the second (column) dimension of `V`
	* @param offsetV - starting index for `V`
	* @param iparam - input/output parameters (length 11; in/out)
	* @param strideIparam - stride length for `iparam`
	* @param offsetIparam - starting index for `iparam`
	* @param ipntr - workspace pointers (length 11; out)
	* @param strideIpntr - stride length for `ipntr`
	* @param offsetIpntr - starting index for `ipntr`
	* @param workd - reverse-communication workspace (length >= 3*N)
	* @param strideWorkd - stride length for `workd`
	* @param offsetWorkd - starting index for `workd`
	* @param workl - private workspace (length >= ncv^2 + 8*ncv)
	* @param strideWorkl - stride length for `workl`
	* @param offsetWorkl - starting index for `workl`
	* @param lworkl - length of `workl`
	* @param infoIn - nonzero on the first call to signal a user-supplied initial residual
	* @returns INFO
	*/
	ndarray( state: State, ido: Int32Array, bmat: string, N: number, which: string, nev: number, tol: number, resid: Float64Array, strideResid: number, offsetResid: number, ncv: number, V: Float64Array, strideV1: number, strideV2: number, offsetV: number, iparam: Int32Array, strideIparam: number, offsetIparam: number, ipntr: Int32Array, strideIpntr: number, offsetIpntr: number, workd: Float64Array, strideWorkd: number, offsetWorkd: number, workl: Float64Array, strideWorkl: number, offsetWorkl: number, lworkl: number, infoIn: number ): number;
}

/**
* Reverse communication interface for the Implicitly Restarted Lanczos iteration.
*/
declare var dsaupd: Routine;


// EXPORTS //

export = dsaupd;
