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
* Applies a complex elementary reflector defined by RZ factorization.
*
* @module @stdlib/lapack/base/zlarz
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zlarz = require( '@stdlib/lapack/base/zlarz' );
*
* var v = new Complex128Array( [ 0.5, 0.2, -0.3, 0.4 ] );
* var tau = new Complex128Array( [ 1.2, -0.4 ] );
* var C = new Complex128Array( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0, 4.0, 0.5, -1.0, 2.0, 0.5, 0.5, 1.5, -0.5, -2.0, 1.0, 0.0, 1.0, 1.0, 1.0, -0.5, 0.0, 2.0, -2.0 ] );
* var WORK = new Complex128Array( 3 );
*
* zlarz( 'column-major', 'left', 4, 3, 2, v, 1, tau, 0, C, 4, WORK, 1 );
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zlarz = require( '@stdlib/lapack/base/zlarz' );
*
* var v = new Complex128Array( [ 0.5, 0.2, -0.3, 0.4 ] );
* var tau = new Complex128Array( [ 1.2, -0.4 ] );
* var C = new Complex128Array( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0, 4.0, 0.5, -1.0, 2.0, 0.5, 0.5, 1.5, -0.5, -2.0, 1.0, 0.0, 1.0, 1.0, 1.0, -0.5, 0.0, 2.0, -2.0 ] );
* var WORK = new Complex128Array( 3 );
*
* zlarz.ndarray( 'left', 4, 3, 2, v, 1, 0, tau, 0, C, 1, 4, 0, WORK, 1, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlarz.ndarray" }
