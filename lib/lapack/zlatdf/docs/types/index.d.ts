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

/**
* Interface describing `zlatdf`.
*/
interface Routine {
	/**
	* Computes a contribution to the reciprocal Dif-estimate using the LU factorization computed by zgetc2.
	*
	* @param ijob - `ijob`
	* @param N - number of columns
	* @param Z - `Z`
	* @param LDZ - leading dimension of `Z`
	* @param RHS - `RHS`
	* @param strideRHS - stride of `RHS`
	* @param rdsum - `rdsum`
	* @param rdscal - `rdscal`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param JPIV - `JPIV`
	* @param strideJPIV - stride of `JPIV`
	* @returns result
	*/
	( ijob: number, N: number, Z: Float64Array, LDZ: number, RHS: Float64Array, strideRHS: number, rdsum: number, rdscal: number, IPIV: Int32Array, strideIPIV: number, JPIV: Int32Array, strideJPIV: number ): Float64Array;

	/**
	* Computes a contribution to the reciprocal Dif-estimate using the LU factorization computed by zgetc2 using alternative indexing semantics.
	*
	* @param ijob - `ijob`
	* @param N - number of columns
	* @param Z - `Z`
	* @param strideZ1 - stride of `Z`
	* @param strideZ2 - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param RHS - `RHS`
	* @param strideRHS - stride of `RHS`
	* @param offsetRHS - starting index for `RHS`
	* @param rdsum - `rdsum`
	* @param rdscal - `rdscal`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param JPIV - `JPIV`
	* @param strideJPIV - stride of `JPIV`
	* @param offsetJPIV - starting index for `JPIV`
	* @returns result
	*/
	ndarray( ijob: number, N: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number, RHS: Float64Array, strideRHS: number, offsetRHS: number, rdsum: number, rdscal: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, JPIV: Int32Array, strideJPIV: number, offsetJPIV: number ): Float64Array;
}

/**
* Computes a contribution to the reciprocal Dif-estimate using the LU factorization computed by zgetc2.
*/
declare var zlatdf: Routine;


// EXPORTS //

export = zlatdf;
