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
* Interface describing `dlabad`.
*/
interface Routine {
	/**
	* Adjusts the underflow and overflow thresholds if the exponent range is very large (no-op on IEEE-754 machines).
	*
	* @param small - `small`
	* @param large - `large`
	* @returns result
	*/
	( small: number, large: number ): void;

	/**
	* Adjusts the underflow and overflow thresholds if the exponent range is very large (no-op on IEEE-754 machines) using alternative indexing semantics.
	*
	* @param small - `small`
	* @param large - `large`
	* @returns result
	*/
	ndarray( small: number, large: number ): void;
}

/**
* Adjusts the underflow and overflow thresholds if the exponent range is very large (no-op on IEEE-754 machines).
*/
declare var dlabad: Routine;


// EXPORTS //

export = dlabad;
