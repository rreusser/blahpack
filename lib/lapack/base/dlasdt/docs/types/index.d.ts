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
* Interface describing `dlasdt`.
*/
interface Routine {
	/**
	* Create a tree of subproblems for bidiagonal divide and conquer.
	*
	* @param N - number of columns
	* @param lvl - `lvl`
	* @param nd - `nd`
	* @param INODE - `INODE`
	* @param strideINODE - stride of `INODE`
	* @param NDIML - `NDIML`
	* @param strideNDIML - stride of `NDIML`
	* @param NDIMR - `NDIMR`
	* @param strideNDIMR - stride of `NDIMR`
	* @param msub - `msub`
	* @returns result
	*/
	( N: number, lvl: number, nd: number, INODE: Float64Array, strideINODE: number, NDIML: Float64Array, strideNDIML: number, NDIMR: Float64Array, strideNDIMR: number, msub: number ): void;

	/**
	* Create a tree of subproblems for bidiagonal divide and conquer using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param lvl - `lvl`
	* @param nd - `nd`
	* @param INODE - `INODE`
	* @param strideINODE - stride of `INODE`
	* @param offsetINODE - starting index for `INODE`
	* @param NDIML - `NDIML`
	* @param strideNDIML - stride of `NDIML`
	* @param offsetNDIML - starting index for `NDIML`
	* @param NDIMR - `NDIMR`
	* @param strideNDIMR - stride of `NDIMR`
	* @param offsetNDIMR - starting index for `NDIMR`
	* @param msub - `msub`
	* @returns result
	*/
	ndarray( N: number, lvl: number, nd: number, INODE: Float64Array, strideINODE: number, offsetINODE: number, NDIML: Float64Array, strideNDIML: number, offsetNDIML: number, NDIMR: Float64Array, strideNDIMR: number, offsetNDIMR: number, msub: number ): void;
}

/**
* Create a tree of subproblems for bidiagonal divide and conquer.
*/
declare var dlasdt: Routine;


// EXPORTS //

export = dlasdt;
