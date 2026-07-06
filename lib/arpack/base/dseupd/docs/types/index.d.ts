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
* Interface describing `dseupd`.
*/
interface Routine {
	/**
	* Returns the converged Ritz values and (optionally) Ritz vectors for a symmetric eigenproblem from an ARPACK Lanczos factorization.
	*
	* @param rvec - if `true`, compute Ritz vectors; if `false`, compute Ritz values only
	* @param howmny - `'all'`, `'partial'`, or `'select'` (only `'all'` is implemented)
	* @param select - logical work array of length `ncv`
	* @param strideSelect - stride length for `select`
	* @param d - output array for the Ritz values (length `nev`)
	* @param strideD - stride length for `d`
	* @param z - output matrix of Ritz vectors (N-by-nev when `howmny='all'`)
	* @param ldz - leading dimension of `z`
	* @param sigma - shift used when the mode is 3, 4, or 5
	* @param bmat - `'standard'` for a standard problem, `'generalized'` for a generalized problem
	* @param N - dimension of the eigenproblem
	* @param which - eigenvalue selection: `'LM'`, `'SM'`, `'LA'`, `'SA'`, or `'BE'`
	* @param nev - number of eigenvalues requested
	* @param tol - relative accuracy tolerance used by `dsaupd`
	* @param resid - final residual vector (length N)
	* @param strideResid - stride length for `resid`
	* @param ncv - number of Lanczos basis vectors
	* @param v - Lanczos basis matrix (N-by-ncv); overwritten on exit
	* @param ldv - leading dimension of `v`
	* @param iparam - ARPACK parameter array
	* @param strideIparam - stride length for `iparam`
	* @param ipntr - ARPACK pointer array into `workl`
	* @param strideIpntr - stride length for `ipntr`
	* @param workd - work array of length `2*N`
	* @param strideWorkd - stride length for `workd`
	* @param workl - private work array set by `dsaupd` (length `lworkl`); modified on exit
	* @param strideWorkl - stride length for `workl`
	* @param lworkl - length of `workl`
	* @returns info (0 on success; a negative error code otherwise)
	*/
	( rvec: boolean, howmny: string, select: Array<boolean> | Uint8Array, strideSelect: number, d: Float64Array, strideD: number, z: Float64Array, ldz: number, sigma: number, bmat: string, N: number, which: string, nev: number, tol: number, resid: Float64Array, strideResid: number, ncv: number, v: Float64Array, ldv: number, iparam: Array<number> | Int32Array, strideIparam: number, ipntr: Array<number> | Int32Array, strideIpntr: number, workd: Float64Array, strideWorkd: number, workl: Float64Array, strideWorkl: number, lworkl: number ): number;

	/**
	* Returns the converged Ritz values and (optionally) Ritz vectors for a symmetric eigenproblem from an ARPACK Lanczos factorization, using alternative indexing semantics.
	*
	* @param rvec - if `true`, compute Ritz vectors; if `false`, compute Ritz values only
	* @param howmny - `'all'`, `'partial'`, or `'select'` (only `'all'` is implemented)
	* @param select - logical work array of length `ncv`
	* @param strideSelect - stride length for `select`
	* @param offsetSelect - starting index for `select`
	* @param d - output array for the Ritz values (length `nev`)
	* @param strideD - stride length for `d`
	* @param offsetD - starting index for `d`
	* @param z - output matrix of Ritz vectors (N-by-nev when `howmny='all'`)
	* @param strideZ1 - stride of the first (row) dimension of `z`
	* @param strideZ2 - stride of the second (column) dimension of `z`
	* @param offsetZ - starting index for `z`
	* @param sigma - shift used when the mode is 3, 4, or 5
	* @param bmat - `'standard'` for a standard problem, `'generalized'` for a generalized problem
	* @param N - dimension of the eigenproblem
	* @param which - eigenvalue selection: `'LM'`, `'SM'`, `'LA'`, `'SA'`, or `'BE'`
	* @param nev - number of eigenvalues requested
	* @param tol - relative accuracy tolerance used by `dsaupd`
	* @param resid - final residual vector (length N)
	* @param strideResid - stride length for `resid`
	* @param offsetResid - starting index for `resid`
	* @param ncv - number of Lanczos basis vectors
	* @param v - Lanczos basis matrix (N-by-ncv); overwritten on exit
	* @param strideV1 - stride of the first (row) dimension of `v`
	* @param strideV2 - stride of the second (column) dimension of `v`
	* @param offsetV - starting index for `v`
	* @param iparam - ARPACK parameter array
	* @param strideIparam - stride length for `iparam`
	* @param offsetIparam - starting index for `iparam`
	* @param ipntr - ARPACK pointer array into `workl`
	* @param strideIpntr - stride length for `ipntr`
	* @param offsetIpntr - starting index for `ipntr`
	* @param workd - work array of length `2*N`
	* @param strideWorkd - stride length for `workd`
	* @param offsetWorkd - starting index for `workd`
	* @param workl - private work array set by `dsaupd` (length `lworkl`); modified on exit
	* @param strideWorkl - stride length for `workl`
	* @param offsetWorkl - starting index for `workl`
	* @param lworkl - length of `workl`
	* @returns info (0 on success; a negative error code otherwise)
	*/
	ndarray( rvec: boolean, howmny: string, select: Array<boolean> | Uint8Array, strideSelect: number, offsetSelect: number, d: Float64Array, strideD: number, offsetD: number, z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number, sigma: number, bmat: string, N: number, which: string, nev: number, tol: number, resid: Float64Array, strideResid: number, offsetResid: number, ncv: number, v: Float64Array, strideV1: number, strideV2: number, offsetV: number, iparam: Array<number> | Int32Array, strideIparam: number, offsetIparam: number, ipntr: Array<number> | Int32Array, strideIpntr: number, offsetIpntr: number, workd: Float64Array, strideWorkd: number, offsetWorkd: number, workl: Float64Array, strideWorkl: number, offsetWorkl: number, lworkl: number ): number;
}

/**
* Returns the converged Ritz values and (optionally) Ritz vectors for a symmetric eigenproblem from an ARPACK Lanczos factorization.
*/
declare var dseupd: Routine;


// EXPORTS //

export = dseupd;
