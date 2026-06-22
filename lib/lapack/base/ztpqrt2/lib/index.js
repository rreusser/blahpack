/**
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

/**
* Computes a QR factorization of a complex triangular-pentagonal matrix using the compact WY representation for `Q`.
*
* @module @stdlib/lapack/base/ztpqrt2
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var ztpqrt2 = require( '@stdlib/lapack/base/ztpqrt2' );
*
* var A = new Complex128Array( [ 2.0, 0.1, 0.0, 0.0, 0.5, -0.2, 3.0, 0.3 ] );
* var B = new Complex128Array( [ 1.0, 0.4, 0.3, -0.1, 0.5, 0.2, 1.1, 0.3 ] );
* var T = new Complex128Array( 4 );
*
* ztpqrt2( 'column-major', 2, 2, 0, A, 2, B, 2, T, 2 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "ztpqrt2.ndarray" }
