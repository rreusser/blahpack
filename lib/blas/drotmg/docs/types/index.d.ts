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
* Interface describing `drotmg`.
*/
interface Routine {
	/**
	* Constructs a modified Givens plane rotation.
	*
	* @param D - `D`
	* @param x1 - `x1`
	* @param dy1 - `dy1`
	* @param param - `param`
	* @returns result
	*/
	( D: Float64Array, x1: number, dy1: number, param: Float64Array ): Float64Array;

	/**
	* Constructs a modified Givens plane rotation using alternative indexing semantics.
	*
	* @param D - `D`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param x1 - `x1`
	* @param strideX1 - stride of `X`
	* @param offsetX1 - starting index for `X1`
	* @param dy1 - `dy1`
	* @param param - `param`
	* @param strideParam - stride of `Param`
	* @param offsetParam - starting index for `Param`
	* @returns result
	*/
	ndarray( D: Float64Array, strideD: number, offsetD: number, x1: number, strideX1: number, offsetX1: number, dy1: number, param: Float64Array, strideParam: number, offsetParam: number ): Float64Array;
}

/**
* Constructs a modified Givens plane rotation.
*/
declare var drotmg: Routine;


// EXPORTS //

export = drotmg;
