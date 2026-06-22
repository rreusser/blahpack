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
* Computes the factorization of a complex symmetric matrix using Aasen's algorithm (blocked).
*
* @module @stdlib/lapack/base/zsytrf_aa
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Int32Array = require( '@stdlib/array/int32' );
* var zsytrfAa = require( './../lib' );
*
* var A = new Complex128Array( 16 );
* A.set( [ 4, 0 ], 0 );
* A.set( [ 2, 0 ], 1 );
* A.set( [ 1, 0 ], 2 );
* A.set( [ 5, 0 ], 5 );
* A.set( [ 2, 0 ], 6 );
* A.set( [ 6, 0 ], 10 );
* A.set( [ 8, 0 ], 15 );
* var IPIV = new Int32Array( 4 );
*
* var info = zsytrfAa( 'column-major', 'lower', 4, A, 4, IPIV );
* // info => 0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;
