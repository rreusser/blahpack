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
* Interface describing `dlasv2`.
*/
interface Routine {
	/**
	* Returns |a| with the sign of b (Fortran SIGN intrinsic).
	*
	* @param f - `f`
	* @param g - `g`
	* @param h - `h`
	* @returns result
	*/
	( f: number, g: number, h: number ): void;

	/**
	* Returns |a| with the sign of b (Fortran SIGN intrinsic) using alternative indexing semantics.
	*
	* @param f - `f`
	* @param g - `g`
	* @param h - `h`
	* @returns result
	*/
	ndarray( f: number, g: number, h: number ): void;
}

/**
* Returns |a| with the sign of b (Fortran SIGN intrinsic).
*/
declare var dlasv2: Routine;


// EXPORTS //

export = dlasv2;
