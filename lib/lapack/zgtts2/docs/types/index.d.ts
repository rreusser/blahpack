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
* Interface describing `zgtts2`.
*/
interface Routine {
	/**
	* Solves one of the systems of equations A_X = B, A^T_X = B, or A^H*X = B.
	*
	* @param itrans - `itrans`
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param DL - `DL`
	* @param strideDL - stride of `DL`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param DU - `DU`
	* @param strideDU - stride of `DU`
	* @param DU2 - `DU2`
	* @param strideDU2 - stride of `DU`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @returns result
	*/
	( itrans: number, N: number, nrhs: number, DL: Float64Array, strideDL: number, d: Float64Array, strideD: number, DU: Float64Array, strideDU: number, DU2: number, strideDU2: number, IPIV: Int32Array, strideIPIV: number, B: Float64Array, LDB: number ): Float64Array;

	/**
	* Solves one of the systems of equations A_X = B, A^T_X = B, or A^H*X = B using alternative indexing semantics.
	*
	* @param itrans - `itrans`
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param DL - `DL`
	* @param strideDL - stride of `DL`
	* @param offsetDL - starting index for `DL`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param DU - `DU`
	* @param strideDU - stride of `DU`
	* @param offsetDU - starting index for `DU`
	* @param DU2 - `DU2`
	* @param strideDU2 - stride of `DU`
	* @param offsetDU2 - starting index for `DU2`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @returns result
	*/
	ndarray( itrans: number, N: number, nrhs: number, DL: Float64Array, strideDL: number, offsetDL: number, d: Float64Array, strideD: number, offsetD: number, DU: Float64Array, strideDU: number, offsetDU: number, DU2: number, strideDU2: number, offsetDU2: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number ): Float64Array;
}

/**
* Solves one of the systems of equations A_X = B, A^T_X = B, or A^H*X = B.
*/
declare var zgtts2: Routine;


// EXPORTS //

export = zgtts2;
