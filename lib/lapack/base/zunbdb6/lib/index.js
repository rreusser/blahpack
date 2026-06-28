/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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
* Orthogonalize a complex column vector against the columns of a complex orthonormal-column matrix.
*
* @module @stdlib/lapack/base/zunbdb6
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zunbdb6 = require( '@stdlib/lapack/base/zunbdb6' );
*
* var Q1 = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
* var Q2 = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ] );
* var X1 = new Complex128Array( [ 3.0, 4.0, 1.0, 2.0 ] );
* var X2 = new Complex128Array( [ 5.0, 6.0, 7.0, 8.0 ] );
* var WORK = new Complex128Array( 2 );
*
* zunbdb6( 'column-major', 2, 2, 2, X1, 1, X2, 1, Q1, 2, Q2, 2, WORK, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zunbdb6.ndarray" }
