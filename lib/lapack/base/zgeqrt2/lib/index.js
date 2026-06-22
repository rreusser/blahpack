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
* Compute a QR factorization of a complex M-by-N matrix using the compact WY representation of Q.
*
* @module @stdlib/lapack/base/zgeqrt2
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zgeqrt2 = require( '@stdlib/lapack/base/zgeqrt2' );
*
* var A = new Complex128Array( [ 2.0, 0.5, 1.0, -0.3, 3.0, 0.2, 1.0, -0.4, 1.0, -0.2, 4.0, 0.4, 2.0, 0.1, 3.0, -0.2, 3.0, 0.1, 2.0, -0.1, 5.0, 0.3, 1.0, 0.5 ] );
* var T = new Complex128Array( 9 );
*
* zgeqrt2( 'column-major', 4, 3, A, 4, T, 3 );
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zgeqrt2 = require( '@stdlib/lapack/base/zgeqrt2' );
*
* var A = new Complex128Array( [ 2.0, 0.5, 1.0, -0.3, 3.0, 0.2, 1.0, -0.4, 1.0, -0.2, 4.0, 0.4, 2.0, 0.1, 3.0, -0.2, 3.0, 0.1, 2.0, -0.1, 5.0, 0.3, 1.0, 0.5 ] );
* var T = new Complex128Array( 9 );
*
* zgeqrt2.ndarray( 4, 3, A, 1, 4, 0, T, 1, 3, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zgeqrt2.ndarray" }
