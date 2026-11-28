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
* Interface describing `dlartgs`.
*/
interface Routine {
	/**
	* Generates a plane rotation designed to introduce a bulge in implicit QR iteration for the bidiagonal SVD problem.
	*
	* @param x - (1,1) entry of an upper bidiagonal matrix
	* @param y - (1,2) entry of an upper bidiagonal matrix
	* @param sigma - shift
	* @param out - output array
	* @returns output array
	*
	* @example
	* var Float64Array = require( '@stdlib/array/float64' );
	*
	* var out = new Float64Array( 2 );
	* dlartgs( 3.0, 4.0, 1.5, out );
	* // returns <Float64Array>[ ~0.4903, ~0.8716 ]
	*/
	( x: number, y: number, sigma: number, out: Float64Array ): Float64Array;

	/**
	* Generates a plane rotation designed to introduce a bulge in implicit QR iteration for the bidiagonal SVD problem, using alternative indexing semantics.
	*
	* @param x - (1,1) entry of an upper bidiagonal matrix
	* @param y - (1,2) entry of an upper bidiagonal matrix
	* @param sigma - shift
	* @param out - output array
	* @returns output array
	*
	* @example
	* var Float64Array = require( '@stdlib/array/float64' );
	*
	* var out = new Float64Array( 2 );
	* dlartgs.strided( 3.0, 4.0, 1.5, out );
	* // returns <Float64Array>[ ~0.4903, ~0.8716 ]
	*/
	strided( x: number, y: number, sigma: number, out: Float64Array ): Float64Array;
}

/**
* Generates a plane rotation designed to introduce a bulge in implicit QR iteration for the bidiagonal SVD problem.
*
* @param x - (1,1) entry of an upper bidiagonal matrix
* @param y - (1,2) entry of an upper bidiagonal matrix
* @param sigma - shift
* @param out - output array
* @returns output array
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var out = new Float64Array( 2 );
* dlartgs( 3.0, 4.0, 1.5, out );
* // returns <Float64Array>[ ~0.4903, ~0.8716 ]
*/
declare var dlartgs: Routine;


// EXPORTS //

export = dlartgs;
