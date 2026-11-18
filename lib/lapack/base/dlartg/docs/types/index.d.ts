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
* Interface describing `dlartg`.
*/
interface Routine {
	/**
	* Generates a plane rotation with real cosine and real sine.
	*
	* @param f - first component of the vector to be rotated
	* @param g - second component of the vector to be rotated
	* @param out - output array
	* @returns output array
	*
	* @example
	* var Float64Array = require( '@stdlib/array/float64' );
	*
	* var out = new Float64Array( 3 );
	* dlartg( 3.0, 4.0, out );
	* // returns <Float64Array>[ 0.6, 0.8, 5.0 ]
	*/
	( f: number, g: number, out: Float64Array ): Float64Array;

	/**
	* Generates a plane rotation with real cosine and real sine, using alternative indexing semantics.
	*
	* @param f - first component of the vector to be rotated
	* @param g - second component of the vector to be rotated
	* @param out - output array
	* @returns output array
	*
	* @example
	* var Float64Array = require( '@stdlib/array/float64' );
	*
	* var out = new Float64Array( 3 );
	* dlartg.ndarray( 3.0, 4.0, out );
	* // returns <Float64Array>[ 0.6, 0.8, 5.0 ]
	*/
	ndarray( f: number, g: number, out: Float64Array ): Float64Array;
}

/**
* Generates a plane rotation with real cosine and real sine.
*
* @param f - first component of the vector to be rotated
* @param g - second component of the vector to be rotated
* @param out - output array
* @returns output array
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var out = new Float64Array( 3 );
* dlartg( 3.0, 4.0, out );
* // returns <Float64Array>[ 0.6, 0.8, 5.0 ]
*/
declare var dlartg: Routine;


// EXPORTS //

export = dlartg;
