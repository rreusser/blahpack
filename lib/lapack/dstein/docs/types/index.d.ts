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
* Interface describing `dstein`.
*/
interface Routine {
	/**
	* Computes the eigenvectors of a real symmetric tridiagonal matrix T.
	*
	* @param N - number of columns
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param M - number of rows
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param IBLOCK - `IBLOCK`
	* @param strideIBLOCK - stride of `IBLOCK`
	* @param ISPLIT - `ISPLIT`
	* @param strideISPLIT - stride of `ISPLIT`
	* @param Z - `Z`
	* @param LDZ - leading dimension of `Z`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param IWORK - `IWORK`
	* @param strideIWORK - stride of `IWORK`
	* @param IFAIL - `IFAIL`
	* @param strideIFAIL - stride of `IFAIL`
	* @returns result
	*/
	( N: number, d: Float64Array, strideD: number, e: Float64Array, strideE: number, M: number, w: Float64Array, strideW: number, IBLOCK: Int32Array, strideIBLOCK: number, ISPLIT: Int32Array, strideISPLIT: number, Z: Float64Array, LDZ: number, WORK: Float64Array, strideWORK: number, IWORK: Int32Array, strideIWORK: number, IFAIL: Float64Array, strideIFAIL: number ): Float64Array;

	/**
	* Computes the eigenvectors of a real symmetric tridiagonal matrix T using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param offsetE - starting index for `E`
	* @param M - number of rows
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param offsetW - starting index for `W`
	* @param IBLOCK - `IBLOCK`
	* @param strideIBLOCK - stride of `IBLOCK`
	* @param offsetIBLOCK - starting index for `IBLOCK`
	* @param ISPLIT - `ISPLIT`
	* @param strideISPLIT - stride of `ISPLIT`
	* @param offsetISPLIT - starting index for `ISPLIT`
	* @param Z - `Z`
	* @param strideZ1 - stride of `Z`
	* @param strideZ2 - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param IWORK - `IWORK`
	* @param strideIWORK - stride of `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @param IFAIL - `IFAIL`
	* @param strideIFAIL - stride of `IFAIL`
	* @param offsetIFAIL - starting index for `IFAIL`
	* @returns result
	*/
	ndarray( N: number, d: Float64Array, strideD: number, offsetD: number, e: Float64Array, strideE: number, offsetE: number, M: number, w: Float64Array, strideW: number, offsetW: number, IBLOCK: Int32Array, strideIBLOCK: number, offsetIBLOCK: number, ISPLIT: Int32Array, strideISPLIT: number, offsetISPLIT: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number, IFAIL: Float64Array, strideIFAIL: number, offsetIFAIL: number ): Float64Array;
}

/**
* Computes the eigenvectors of a real symmetric tridiagonal matrix T.
*/
declare var dstein: Routine;


// EXPORTS //

export = dstein;
