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
* Simultaneously bidiagonalizes the blocks of a tall and skinny complex matrix `[X11; X21]` with orthonormal columns (CSD-prep variant 4 — widest `M1`/`M2` partition).
*
* @module @stdlib/lapack/base/zunbdb4
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var zunbdb4 = require( '@stdlib/lapack/base/zunbdb4' );
*
* var X11 = new Complex128Array( 32 );
* var X21 = new Complex128Array( 32 );
* var THETA = new Float64Array( 6 );
* var PHI = new Float64Array( 5 );
* var TAUP1 = new Complex128Array( 2 );
* var TAUP2 = new Complex128Array( 2 );
* var TAUQ1 = new Complex128Array( 6 );
* var PHANTOM = new Complex128Array( 8 );
* var WORK = new Complex128Array( 16 );
*
* zunbdb4( 'column-major', 8, 4, 6, X11, 8, X21, 8, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, PHANTOM, 1, WORK, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zunbdb4.ndarray" }
