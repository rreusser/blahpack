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
* Interface describing `dlarrk`.
*/
interface Routine {
	/**
	* Computes one eigenvalue of a symmetric tridiagonal matrix to suitable accuracy
	*
	* @param N - number of columns
	* @param iw - iw
	* @param gl - gl
	* @param gu - gu
	* @param d - input array
	* @param strideD - stride length for `d`
	* @param E2 - output array
	* @param strideE2 - stride length for `E2`
	* @param pivmin - pivmin
	* @param reltol - reltol
	* @param w - w
	* @param werr - werr
	* @returns result
	*/
	( N: number, iw: number, gl: number, gu: number, d: Float64Array, strideD: number, E2: Float64Array, strideE2: number, pivmin: number, reltol: number, w: number, werr: number ): Float64Array;

	/**
	* Computes one eigenvalue of a symmetric tridiagonal matrix to suitable accuracy, using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param iw - iw
	* @param gl - gl
	* @param gu - gu
	* @param d - input array
	* @param strideD - stride length for `d`
	* @param offsetD - starting index for `D`
	* @param E2 - output array
	* @param strideE2 - stride of `E`
	* @param offsetE2 - starting index for `E2`
	* @param pivmin - pivmin
	* @param reltol - reltol
	* @param w - w
	* @param werr - werr
	* @returns result
	*/
	ndarray( N: number, iw: number, gl: number, gu: number, d: Float64Array, strideD: number, offsetD: number, E2: Float64Array, strideE2: number, offsetE2: number, pivmin: number, reltol: number, w: number, werr: number ): Float64Array;
}

/**
* Computes one eigenvalue of a symmetric tridiagonal matrix to suitable accuracy
*/
declare var dlarrk: Routine;


// EXPORTS //

export = dlarrk;
