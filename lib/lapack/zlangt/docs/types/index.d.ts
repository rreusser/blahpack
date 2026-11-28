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
* Interface describing `zlangt`.
*/
interface Routine {
	/**
	* Returns the norm of a complex general tridiagonal matrix A.
	*
	* @param norm - `norm`
	* @param N - number of columns
	* @param DL - `DL`
	* @param strideDL - stride of `DL`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param DU - `DU`
	* @param strideDU - stride of `DU`
	* @returns result
	*/
	( norm: string, N: number, DL: Float64Array, strideDL: number, d: Float64Array, strideD: number, DU: Float64Array, strideDU: number ): Float64Array;

	/**
	* Returns the norm of a complex general tridiagonal matrix A using alternative indexing semantics.
	*
	* @param norm - `norm`
	* @param N - number of columns
	* @param DL - `DL`
	* @param strideDL - stride of `DL`
	* @param offsetDL - starting index for `DL`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param DU - `DU`
	* @param strideDU - stride of `DU`
	* @param offsetDU - starting index for `DU`
	* @returns result
	*/
	ndarray( norm: string, N: number, DL: Float64Array, strideDL: number, offsetDL: number, d: Float64Array, strideD: number, offsetD: number, DU: Float64Array, strideDU: number, offsetDU: number ): Float64Array;
}

/**
* Returns the norm of a complex general tridiagonal matrix A.
*/
declare var zlangt: Routine;


// EXPORTS //

export = zlangt;
