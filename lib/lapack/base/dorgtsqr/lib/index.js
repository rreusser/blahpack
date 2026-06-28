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
* Generates a real `M`-by-`N` matrix `Q` with orthonormal columns from a Tall-Skinny QR factorization (`dlatsqr`).
*
* @module @stdlib/lapack/base/dorgtsqr
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dorgtsqr = require( './../lib' );
*
* // Pre-factored 4-by-2 inputs (reflectors and T factors that the corresponding `dlatsqr` call would produce):
* var M = 4;
* var N = 2;
* var mb = 8;
* var nb = 2;
* var A = new Float64Array( M * N ); // would be filled by dlatsqr in real usage
* var T = new Float64Array( nb * N );
* var WORK = new Float64Array( ( M + nb ) * N );
*
* var info = dorgtsqr( 'column-major', M, N, mb, nb, A, M, T, nb, WORK );
* // returns 0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dorgtsqr.ndarray" }
