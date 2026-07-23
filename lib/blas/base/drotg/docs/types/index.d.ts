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
* Interface describing `drotg`.
*/
interface Routine {
	/**
	* Constructs a Givens plane rotation.
	*
	* @param ab - `ab`
	* @param strideAB - stride of `AB`
	* @param cs - `cs`
	* @param strideCS - stride of `CS`
	* @returns result
	*/
	( ab: Float64Array, strideAB: number, cs: Float64Array, strideCS: number ): void;

	/**
	* Constructs a Givens plane rotation using alternative indexing semantics.
	*
	* @param ab - `ab`
	* @param strideAB - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @param cs - `cs`
	* @param strideCS - stride of `CS`
	* @param offsetCS - starting index for `CS`
	* @returns result
	*/
	ndarray( ab: Float64Array, strideAB: number, offsetAB: number, cs: Float64Array, strideCS: number, offsetCS: number ): void;
}

/**
* Constructs a Givens plane rotation.
*/
declare var drotg: Routine;


// EXPORTS //

export = drotg;
