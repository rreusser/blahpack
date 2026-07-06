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
* Interface describing `dsband`.
*/
interface Routine {
	/**
	* Computes converged approximations to eigenvalues of a banded symmetric generalized eigenproblem, and optionally the eigenvectors.
	*
	* @param rvec - whether to compute Ritz vectors
	* @param howmny - `'all'` or `'select'`
	* @param select - selection array (length ncv)
	* @param d - Ritz values (length nev; out)
	* @param Z - Ritz vectors (column-major; out)
	* @param ldz - leading dimension of `Z`
	* @param sigma - the shift
	* @param N - order of the problem
	* @param AB - matrix A in band storage
	* @param MB - matrix M in band storage
	* @param lda - leading dimension of `AB`, `MB`, `RFAC`
	* @param RFAC - band LU workspace/output
	* @param kl - number of subdiagonals
	* @param ku - number of superdiagonals
	* @param which - which eigenvalues to compute
	* @param bmat - `'standard'` or `'generalized'` eigenproblem
	* @param nev - number of eigenvalues to compute
	* @param tol - relative accuracy for Ritz value convergence
	* @param resid - residual vector (length N; in/out)
	* @param ncv - number of Lanczos vectors
	* @param V - Lanczos basis (column-major; out)
	* @param ldv - leading dimension of `V`
	* @param iparam - input/output parameters (length 11; in/out)
	* @param workd - reverse-communication workspace (length >= 3*N)
	* @param workl - private workspace (length >= ncv^2 + 8*ncv)
	* @param lworkl - length of `workl`
	* @param iwork - integer pivot workspace (length >= N)
	* @param infoIn - nonzero to signal a user-supplied initial residual
	* @returns INFO
	*/
	( rvec: boolean, howmny: string, select: Int32Array, d: Float64Array, Z: Float64Array, ldz: number, sigma: number, N: number, AB: Float64Array, MB: Float64Array, lda: number, RFAC: Float64Array, kl: number, ku: number, which: string, bmat: string, nev: number, tol: number, resid: Float64Array, ncv: number, V: Float64Array, ldv: number, iparam: Int32Array, workd: Float64Array, workl: Float64Array, lworkl: number, iwork: Int32Array, infoIn: number ): number;

	/**
	* Computes converged approximations to eigenvalues of a banded symmetric generalized eigenproblem, using alternative indexing semantics.
	*
	* @param rvec - whether to compute Ritz vectors
	* @param howmny - `'all'` or `'select'`
	* @param select - selection array (length ncv)
	* @param strideSelect - stride length for `select`
	* @param offsetSelect - starting index for `select`
	* @param d - Ritz values (length nev; out)
	* @param strideD - stride length for `d`
	* @param offsetD - starting index for `d`
	* @param Z - Ritz vectors (column-major; out)
	* @param strideZ1 - stride of the first dimension of `Z`
	* @param strideZ2 - stride of the second dimension of `Z`
	* @param offsetZ - starting index for `Z`
	* @param sigma - the shift
	* @param N - order of the problem
	* @param AB - matrix A in band storage
	* @param strideAB1 - stride of the first dimension of `AB`
	* @param strideAB2 - stride of the second dimension of `AB`
	* @param offsetAB - starting index for `AB`
	* @param MB - matrix M in band storage
	* @param strideMB1 - stride of the first dimension of `MB`
	* @param strideMB2 - stride of the second dimension of `MB`
	* @param offsetMB - starting index for `MB`
	* @param RFAC - band LU workspace/output
	* @param strideRFAC1 - stride of the first dimension of `RFAC`
	* @param strideRFAC2 - stride of the second dimension of `RFAC`
	* @param offsetRFAC - starting index for `RFAC`
	* @param kl - number of subdiagonals
	* @param ku - number of superdiagonals
	* @param which - which eigenvalues to compute
	* @param bmat - `'standard'` or `'generalized'` eigenproblem
	* @param nev - number of eigenvalues to compute
	* @param tol - relative accuracy for Ritz value convergence
	* @param resid - residual vector (length N; in/out)
	* @param strideResid - stride length for `resid`
	* @param offsetResid - starting index for `resid`
	* @param ncv - number of Lanczos vectors
	* @param V - Lanczos basis (column-major; out)
	* @param strideV1 - stride of the first dimension of `V`
	* @param strideV2 - stride of the second dimension of `V`
	* @param offsetV - starting index for `V`
	* @param iparam - input/output parameters (length 11; in/out)
	* @param strideIparam - stride length for `iparam`
	* @param offsetIparam - starting index for `iparam`
	* @param workd - reverse-communication workspace (length >= 3*N)
	* @param strideWorkd - stride length for `workd`
	* @param offsetWorkd - starting index for `workd`
	* @param workl - private workspace (length >= ncv^2 + 8*ncv)
	* @param strideWorkl - stride length for `workl`
	* @param offsetWorkl - starting index for `workl`
	* @param lworkl - length of `workl`
	* @param iwork - integer pivot workspace (length >= N)
	* @param strideIwork - stride length for `iwork`
	* @param offsetIwork - starting index for `iwork`
	* @param infoIn - nonzero to signal a user-supplied initial residual
	* @returns INFO
	*/
	ndarray( rvec: boolean, howmny: string, select: Int32Array, strideSelect: number, offsetSelect: number, d: Float64Array, strideD: number, offsetD: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number, sigma: number, N: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, MB: Float64Array, strideMB1: number, strideMB2: number, offsetMB: number, RFAC: Float64Array, strideRFAC1: number, strideRFAC2: number, offsetRFAC: number, kl: number, ku: number, which: string, bmat: string, nev: number, tol: number, resid: Float64Array, strideResid: number, offsetResid: number, ncv: number, V: Float64Array, strideV1: number, strideV2: number, offsetV: number, iparam: Int32Array, strideIparam: number, offsetIparam: number, workd: Float64Array, strideWorkd: number, offsetWorkd: number, workl: Float64Array, strideWorkl: number, offsetWorkl: number, lworkl: number, iwork: Int32Array, strideIwork: number, offsetIwork: number, infoIn: number ): number;
}

/**
* Computes converged approximations to eigenvalues of a banded symmetric generalized eigenproblem.
*/
declare var dsband: Routine;


// EXPORTS //

export = dsband;
