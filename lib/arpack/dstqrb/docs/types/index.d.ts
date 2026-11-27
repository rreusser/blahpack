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
* Interface describing `dstqrb`.
*/
interface Routine {
	/**
	* Computes all eigenvalues and the last components of the eigenvectors of a symmetric tridiagonal matrix using the implicit QL or QR method.
	*
	* @param N - order of the matrix
	* @param d - diagonal elements of the tridiagonal matrix (length N)
	* @param strideD - stride length for `d`
	* @param e - subdiagonal elements of the tridiagonal matrix (length N-1)
	* @param strideE - stride length for `e`
	* @param Z - on exit, the last row of the orthonormal eigenvector matrix (length N)
	* @param strideZ - stride length for `Z`
	* @param WORK - workspace array (length >= 2*(N-1))
	* @param strideWork - stride length for `WORK`
	* @returns INFO (0 if successful, >0 if INFO eigenvalues did not converge)
	*/
	( N: number, d: Float64Array, strideD: number, e: Float64Array, strideE: number, Z: Float64Array, strideZ: number, WORK: Float64Array, strideWork: number ): number;

	/**
	* Computes all eigenvalues and the last components of the eigenvectors of a symmetric tridiagonal matrix using the implicit QL or QR method, using alternative indexing semantics.
	*
	* @param N - order of the matrix
	* @param d - diagonal elements of the tridiagonal matrix (length N)
	* @param strideD - stride length for `d`
	* @param offsetD - starting index for `d`
	* @param e - subdiagonal elements of the tridiagonal matrix (length N-1)
	* @param strideE - stride length for `e`
	* @param offsetE - starting index for `e`
	* @param Z - on exit, the last row of the orthonormal eigenvector matrix (length N)
	* @param strideZ - stride length for `Z`
	* @param offsetZ - starting index for `Z`
	* @param WORK - workspace array (length >= 2*(N-1))
	* @param strideWork - stride length for `WORK`
	* @param offsetWork - starting index for `WORK`
	* @returns INFO (0 if successful, >0 if INFO eigenvalues did not converge)
	*/
	ndarray( N: number, d: Float64Array, strideD: number, offsetD: number, e: Float64Array, strideE: number, offsetE: number, Z: Float64Array, strideZ: number, offsetZ: number, WORK: Float64Array, strideWork: number, offsetWork: number ): number;
}

/**
* Computes all eigenvalues and the last components of the eigenvectors of a symmetric tridiagonal matrix using the implicit QL or QR method.
*/
declare var dstqrb: Routine;


// EXPORTS //

export = dstqrb;
