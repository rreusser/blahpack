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
* Interface describing `dlasq5`.
*/
interface Routine {
	/**
	* Computes one dqds transform in ping-pong form with a shift.
	*
	* @param i0 - `i0`
	* @param n0 - `n0`
	* @param z - `z`
	* @param stride - stride of ``
	* @param pp - `pp`
	* @param tau - `tau`
	* @param sigma - `sigma`
	* @param ieee - `ieee`
	* @param eps - `eps`
	* @returns result
	*/
	( i0: number, n0: number, z: number, stride: number, pp: number, tau: number, sigma: number, ieee: number, eps: number ): Float64Array;

	/**
	* Computes one dqds transform in ping-pong form with a shift using alternative indexing semantics.
	*
	* @param i0 - `i0`
	* @param n0 - `n0`
	* @param z - `z`
	* @param stride - stride of ``
	* @param offset - starting index for ``
	* @param pp - `pp`
	* @param tau - `tau`
	* @param sigma - `sigma`
	* @param ieee - `ieee`
	* @param eps - `eps`
	* @returns result
	*/
	ndarray( i0: number, n0: number, z: number, stride: number, offset: number, pp: number, tau: number, sigma: number, ieee: number, eps: number ): Float64Array;
}

/**
* Computes one dqds transform in ping-pong form with a shift.
*/
declare var dlasq5: Routine;


// EXPORTS //

export = dlasq5;
