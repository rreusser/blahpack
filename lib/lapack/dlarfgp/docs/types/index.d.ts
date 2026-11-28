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

/// <reference types="@stdlib/types"/>



/**
* Interface describing `dlarfgp`.
*/
interface Routine {
	/**
	* Generates an elementary reflector with non-negative beta
	*
	* @param N - number of columns
	* @param alpha - scalar constant
	* @param x - input array
	* @param stride - stride length for `x`
	* @param tau - tau
	* @returns result
	*/
	( N: number, alpha: number, x: Float64Array, stride: number, tau: number ): Float64Array;

	/**
	* Generates an elementary reflector with non-negative beta, using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param alpha - scalar constant
	* @param x - input array
	* @param stride - stride length for `x`
	* @param offset - starting index for ``
	* @param tau - tau
	* @returns result
	*/
	ndarray( N: number, alpha: number, x: Float64Array, stride: number, offset: number, tau: number ): Float64Array;
}

/**
* Generates an elementary reflector with non-negative beta
*/
declare var dlarfgp: Routine;


// EXPORTS //

export = dlarfgp;
