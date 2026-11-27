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
* Interface describing `dlamrg`.
*/
interface Routine {
	/**
	* Merges two sorted integer sublists into a single sorted list.
	*
	* @param n1 - `n1`
	* @param n2 - `n2`
	* @param a - `a`
	* @param strideA - stride of `A`
	* @param dtrd1 - `dtrd1`
	* @param dtrd2 - `dtrd2`
	* @param INDEX - `INDEX`
	* @param strideINDEX - stride of `INDEX`
	* @returns result
	*/
	( n1: number, n2: number, a: Float64Array, strideA: number, dtrd1: number, dtrd2: number, INDEX: Float64Array, strideINDEX: number ): Float64Array;

	/**
	* Merges two sorted integer sublists into a single sorted list using alternative indexing semantics.
	*
	* @param n1 - `n1`
	* @param n2 - `n2`
	* @param a - `a`
	* @param strideA - stride of `A`
	* @param offsetA - starting index for `A`
	* @param dtrd1 - `dtrd1`
	* @param dtrd2 - `dtrd2`
	* @param INDEX - `INDEX`
	* @param strideINDEX - stride of `INDEX`
	* @param offsetINDEX - starting index for `INDEX`
	* @returns result
	*/
	ndarray( n1: number, n2: number, a: Float64Array, strideA: number, offsetA: number, dtrd1: number, dtrd2: number, INDEX: Float64Array, strideINDEX: number, offsetINDEX: number ): Float64Array;
}

/**
* Merges two sorted integer sublists into a single sorted list.
*/
declare var dlamrg: Routine;


// EXPORTS //

export = dlamrg;
