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
* Simultaneously bidiagonalize the blocks of a tall and skinny matrix with orthonormal columns.
*
* @module @stdlib/lapack/base/dorbdb1
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dorbdb1 = require( '@stdlib/lapack/base/dorbdb1' );
*
* var X11 = new Float64Array( 16 );
* var X21 = new Float64Array( 16 );
* var THETA = new Float64Array( 2 );
* var PHI = new Float64Array( 1 );
* var TAUP1 = new Float64Array( 4 );
* var TAUP2 = new Float64Array( 4 );
* var TAUQ1 = new Float64Array( 2 );
* var WORK = new Float64Array( 6 );
*
* dorbdb1( 'column-major', 8, 4, 2, X11, 4, X21, 4, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, WORK, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dorbdb1.ndarray" }
