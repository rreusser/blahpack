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
* Interface describing `dlarfg`.
*/
interface Routine {
	/**
	* Generates a real elementary reflector H of order N, such that.
	*
	* @param N - number of columns
	* @param alpha - scalar constant
	* @param offsetAlpha - starting index for `Alpha`
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param tau - `tau`
	* @param offsetTau - starting index for `Tau`
	* @returns result
	*/
	( N: number, alpha: number, offsetAlpha: number, x: Float64Array, strideX: number, tau: number, offsetTau: number ): Float64Array;

	/**
	* Generates a real elementary reflector H of order N, such that using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param alpha - scalar constant
	* @param offsetAlpha - starting index for `Alpha`
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param offsetX - starting index for `X`
	* @param tau - `tau`
	* @param offsetTau - starting index for `Tau`
	* @returns result
	*/
	ndarray( N: number, alpha: number, offsetAlpha: number, x: Float64Array, strideX: number, offsetX: number, tau: number, offsetTau: number ): Float64Array;
}

/**
* Generates a real elementary reflector H of order N, such that.
*/
declare var dlarfg: Routine;


// EXPORTS //

export = dlarfg;
