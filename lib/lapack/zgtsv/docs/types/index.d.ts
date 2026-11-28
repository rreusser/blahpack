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
* Interface describing `zgtsv`.
*/
interface Routine {
	/**
	* Solves a complex general tridiagonal system of linear equations A * X = B.
	*
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param DL - `DL`
	* @param strideDL - stride of `DL`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param DU - `DU`
	* @param strideDU - stride of `DU`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @returns result
	*/
	( N: number, nrhs: number, DL: Float64Array, strideDL: number, d: Float64Array, strideD: number, DU: Float64Array, strideDU: number, B: Float64Array, LDB: number ): Float64Array;

	/**
	* Solves a complex general tridiagonal system of linear equations A * X = B using alternative indexing semantics.
	*
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
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @returns result
	*/
	ndarray( N: number, nrhs: number, DL: Float64Array, strideDL: number, offsetDL: number, d: Float64Array, strideD: number, offsetD: number, DU: Float64Array, strideDU: number, offsetDU: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number ): Float64Array;
}

/**
* Solves a complex general tridiagonal system of linear equations A * X = B.
*/
declare var zgtsv: Routine;


// EXPORTS //

export = zgtsv;
