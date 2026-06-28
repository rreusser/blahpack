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

/* eslint-disable camelcase */

/**
* Improves the computed solution using extra-precise iterative refinement for general banded matrices.
*
* @module @stdlib/lapack/base/dla_gbrfsx_extended
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var dla_gbrfsx_extended = require( '@stdlib/lapack/base/dla_gbrfsx_extended' );
*
* var AB = new Float64Array( [ 0.0, 4.0, -1.0, 0.5, 4.0, -1.0, 0.5, 4.0, -1.0, 0.5, 4.0, 0.0 ] );
* var AFB = new Float64Array( [ 0.0, 0.0, 4.0, -1.0, 0.0, 0.5, 4.0, -1.125, 0.0, 0.5, 3.875, -1.129, 0.0, 0.5, 3.871, 0.0 ] );
* var IPIV = new Int32Array( [ 0, 1, 2, 3 ] );
* var B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
* var Y = new Float64Array( [ 0.19, 0.46, 0.72, 1.18 ] );
* var C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
* var BERR_OUT = new Float64Array( 1 );
* var EBN = new Float64Array( [ 1.0, 1.0, 1.0 ] );
* var EBC = new Float64Array( [ 1.0, 1.0, 1.0 ] );
* var RES = new Float64Array( 4 );
* var AYB = new Float64Array( 4 );
* var DY = new Float64Array( 4 );
* var YT = new Float64Array( 4 );
*
* dla_gbrfsx_extended.ndarray( 2, 'no-transpose', 4, 1, 1, 1, AB, 1, 3, 0, AFB, 1, 4, 0, IPIV, 1, 0, false, C, 1, 0, B, 1, 4, 0, Y, 1, 4, 0, BERR_OUT, 1, 0, 2, EBN, 1, 1, 0, EBC, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dla_gbrfsx_extended.ndarray" }
