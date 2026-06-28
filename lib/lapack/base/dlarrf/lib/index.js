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
* Finds a new relatively robust representation for a tridiagonal cluster.
*
* @module @stdlib/lapack/base/dlarrf
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlarrf = require( '@stdlib/lapack/base/dlarrf' );
*
* var N = 4;
* var d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0 ] );
* var l = new Float64Array( [ 0.1, 0.1, 0.1, 0.0 ] );
* var ld = new Float64Array( [ 0.4, 0.3, 0.2, 0.0 ] );
* var w = new Float64Array( [ 0.95, 1.95, 2.95, 4.05 ] );
* var wgap = new Float64Array( [ 0.9, 0.9, 1.0, 0.0 ] );
* var werr = new Float64Array( [ 1e-3, 1e-3, 1e-3, 1e-3 ] );
* var sigma = new Float64Array( 1 );
* var dplus = new Float64Array( N );
* var lplus = new Float64Array( N );
* var work = new Float64Array( 2 * N );
*
* dlarrf( N, d, 1, l, 1, ld, 1, 1, 4, w, 1, wgap, 1, werr, 1, 4.0, 1.0, 1.0, 2.2250738585072014e-308, sigma, dplus, 1, lplus, 1, work, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;
