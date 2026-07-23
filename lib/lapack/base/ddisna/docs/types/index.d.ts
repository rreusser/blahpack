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
* Interface describing `ddisna`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param job - `job`
	* @param M - number of rows
	* @param N - number of columns
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param SEP - `SEP`
	* @param strideSEP - stride of `SEP`
	* @returns result
	*/
	( job: string, M: number, N: number, d: Float64Array, strideD: number, SEP: Float64Array, strideSEP: number ): number;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param job - `job`
	* @param M - number of rows
	* @param N - number of columns
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param SEP - `SEP`
	* @param strideSEP - stride of `SEP`
	* @param offsetSEP - starting index for `SEP`
	* @returns result
	*/
	ndarray( job: string, M: number, N: number, d: Float64Array, strideD: number, offsetD: number, SEP: Float64Array, strideSEP: number, offsetSEP: number ): number;
}

/**
* @license MIT.
*/
declare var ddisna: Routine;


// EXPORTS //

export = ddisna;
