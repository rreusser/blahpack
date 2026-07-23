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
* Interface describing `dcabs1`.
*/
interface Routine {
	/**
	* Computes the sum of the absolute values of the real and imaginary parts of a double-precision complex number.
	*
	* @param z - `z`
	* @returns result
	*/
	( z: number ): number;

	/**
	* Computes the sum of the absolute values of the real and imaginary parts of a double-precision complex number using alternative indexing semantics.
	*
	* @param z - `z`
	* @returns result
	*/
	ndarray( z: number ): number;
}

/**
* Computes the sum of the absolute values of the real and imaginary parts of a double-precision complex number.
*/
declare var dcabs1: Routine;


// EXPORTS //

export = dcabs1;
