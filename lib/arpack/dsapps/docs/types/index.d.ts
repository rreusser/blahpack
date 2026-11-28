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
* Interface describing `dsapps`.
*/
interface Routine {
	/**
	* Applies `np` implicit shifts to the symmetric Arnoldi/Lanczos factorization via bulge chasing.
	*
	* @param n - problem size (dimension of the matrix `A`)
	* @param kev - number of wanted eigenvalues; on exit, the order of the updated factorization
	* @param np - number of implicit shifts to apply
	* @param shift - shifts to apply (length `np`)
	* @param strideShift - stride length for `shift`
	* @param v - Arnoldi vectors in column-major order, `n` by `kev+np`
	* @param ldv - leading dimension of `v`
	* @param h - symmetric tridiagonal matrix in 2-column column-major layout (subdiagonal in column 0, diagonal in column 1)
	* @param ldh - leading dimension of `h`
	* @param resid - residual vector (length `n`); updated in place
	* @param strideResid - stride length for `resid`
	* @param q - workspace to accumulate the rotations in column-major order, `kev+np` by `kev+np`
	* @param ldq - leading dimension of `q`
	* @param workd - workspace array (length >= `2*n`)
	* @param strideWorkd - stride length for `workd`
	*/
	( n: number, kev: number, np: number, shift: Float64Array, strideShift: number, v: Float64Array, ldv: number, h: Float64Array, ldh: number, resid: Float64Array, strideResid: number, q: Float64Array, ldq: number, workd: Float64Array, strideWorkd: number ): void;

	/**
	* Applies `np` implicit shifts to the symmetric Arnoldi/Lanczos factorization via bulge chasing, using alternative indexing semantics.
	*
	* @param n - problem size (dimension of the matrix `A`)
	* @param kev - number of wanted eigenvalues; on exit, the order of the updated factorization
	* @param np - number of implicit shifts to apply
	* @param shift - shifts to apply (length `np`)
	* @param strideShift - stride length for `shift`
	* @param offsetShift - starting index for `shift`
	* @param v - Arnoldi vectors, `n` by `kev+np`
	* @param strideV1 - stride of the first (row) dimension of `v`
	* @param strideV2 - stride of the second (column) dimension of `v`
	* @param offsetV - starting index for `v`
	* @param h - symmetric tridiagonal matrix in 2-column layout (subdiagonal in column 0, diagonal in column 1)
	* @param strideH1 - stride of the first (row) dimension of `h`
	* @param strideH2 - stride of the second (column) dimension of `h`
	* @param offsetH - starting index for `h`
	* @param resid - residual vector (length `n`); updated in place
	* @param strideResid - stride length for `resid`
	* @param offsetResid - starting index for `resid`
	* @param q - workspace to accumulate the rotations, `kev+np` by `kev+np`
	* @param strideQ1 - stride of the first (row) dimension of `q`
	* @param strideQ2 - stride of the second (column) dimension of `q`
	* @param offsetQ - starting index for `q`
	* @param workd - workspace array (length >= `2*n`)
	* @param strideWorkd - stride length for `workd`
	* @param offsetWorkd - starting index for `workd`
	*/
	ndarray( n: number, kev: number, np: number, shift: Float64Array, strideShift: number, offsetShift: number, v: Float64Array, strideV1: number, strideV2: number, offsetV: number, h: Float64Array, strideH1: number, strideH2: number, offsetH: number, resid: Float64Array, strideResid: number, offsetResid: number, q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, workd: Float64Array, strideWorkd: number, offsetWorkd: number ): void;
}

/**
* Applies `np` implicit shifts to the symmetric Arnoldi/Lanczos factorization via bulge chasing.
*/
declare var dsapps: Routine;


// EXPORTS //

export = dsapps;
