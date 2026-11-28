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
* Interface describing `dlarra`.
*/
interface Routine {
	/**
	* Computes the splitting points with threshold based on the representation.
	*
	* @param N - number of columns
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param E2 - `E2`
	* @param strideE2 - stride of `E`
	* @param spltol - `spltol`
	* @param tnrm - `tnrm`
	* @param nsplit - `nsplit`
	* @param ISPLIT - `ISPLIT`
	* @param strideISPLIT - stride of `ISPLIT`
	* @returns result
	*/
	( N: number, d: Float64Array, strideD: number, e: Float64Array, strideE: number, E2: number, strideE2: number, spltol: number, tnrm: number, nsplit: number, ISPLIT: Int32Array, strideISPLIT: number ): Float64Array;

	/**
	* Computes the splitting points with threshold based on the representation using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param offsetE - starting index for `E`
	* @param E2 - `E2`
	* @param strideE2 - stride of `E`
	* @param offsetE2 - starting index for `E2`
	* @param spltol - `spltol`
	* @param tnrm - `tnrm`
	* @param nsplit - `nsplit`
	* @param ISPLIT - `ISPLIT`
	* @param strideISPLIT - stride of `ISPLIT`
	* @param offsetISPLIT - starting index for `ISPLIT`
	* @returns result
	*/
	ndarray( N: number, d: Float64Array, strideD: number, offsetD: number, e: Float64Array, strideE: number, offsetE: number, E2: number, strideE2: number, offsetE2: number, spltol: number, tnrm: number, nsplit: number, ISPLIT: Int32Array, strideISPLIT: number, offsetISPLIT: number ): Float64Array;
}

/**
* Computes the splitting points with threshold based on the representation.
*/
declare var dlarra: Routine;


// EXPORTS //

export = dlarra;
