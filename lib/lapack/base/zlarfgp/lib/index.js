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
* Generates a complex elementary reflector with non-negative beta.
*
* @module @stdlib/lapack/base/zlarfgp
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zlarfgp = require( '@stdlib/lapack/base/zlarfgp' );
*
* var alpha = new Complex128Array( [ 3.0, 0.0 ] );
* var x = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0 ] );
* var tau = new Complex128Array( 1 );
*
* zlarfgp( 3, alpha, 0, x, 1, tau, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlarfgp.ndarray" }
