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
* Interface describing `dseigt`.
*/
interface Routine {
	/**
	* Computes the eigenvalues of the current symmetric tridiagonal matrix `H` and the corresponding Ritz estimates.
	*
	* @param rnorm - residual norm of the Lanczos/Arnoldi factorization
	* @param N - order of the matrix `H`
	* @param H - symmetric tridiagonal matrix in 2-column layout (subdiagonal in column 0, diagonal in column 1)
	* @param ldh - leading dimension of `H`
	* @param eig - output array for the eigenvalues (length N)
	* @param strideEig - stride length for `eig`
	* @param bounds - output array for the Ritz estimates (length N)
	* @param strideBounds - stride length for `bounds`
	* @param workl - workspace array (length >= 3*N)
	* @param strideWorkl - stride length for `workl`
	* @returns IERR (0 if successful, otherwise the `dstqrb` error code)
	*/
	( rnorm: number, N: number, H: Float64Array, ldh: number, eig: Float64Array, strideEig: number, bounds: Float64Array, strideBounds: number, workl: Float64Array, strideWorkl: number ): number;

	/**
	* Computes the eigenvalues of the current symmetric tridiagonal matrix `H` and the corresponding Ritz estimates, using alternative indexing semantics.
	*
	* @param rnorm - residual norm of the Lanczos/Arnoldi factorization
	* @param N - order of the matrix `H`
	* @param H - symmetric tridiagonal matrix in 2-column layout (subdiagonal in column 0, diagonal in column 1)
	* @param strideH1 - stride of the first (row) dimension of `H`
	* @param strideH2 - stride of the second (column) dimension of `H`
	* @param offsetH - starting index for `H`
	* @param eig - output array for the eigenvalues (length N)
	* @param strideEig - stride length for `eig`
	* @param offsetEig - starting index for `eig`
	* @param bounds - output array for the Ritz estimates (length N)
	* @param strideBounds - stride length for `bounds`
	* @param offsetBounds - starting index for `bounds`
	* @param workl - workspace array (length >= 3*N)
	* @param strideWorkl - stride length for `workl`
	* @param offsetWorkl - starting index for `workl`
	* @returns IERR (0 if successful, otherwise the `dstqrb` error code)
	*/
	ndarray( rnorm: number, N: number, H: Float64Array, strideH1: number, strideH2: number, offsetH: number, eig: Float64Array, strideEig: number, offsetEig: number, bounds: Float64Array, strideBounds: number, offsetBounds: number, workl: Float64Array, strideWorkl: number, offsetWorkl: number ): number;
}

/**
* Computes the eigenvalues of the current symmetric tridiagonal matrix and the corresponding Ritz estimates for the symmetric Lanczos/Arnoldi iteration.
*/
declare var dseigt: Routine;


// EXPORTS //

export = dseigt;
