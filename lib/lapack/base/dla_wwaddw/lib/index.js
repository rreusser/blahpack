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
* Add a vector to a doubled-single precision accumulator (X, Y).
*
* @module @stdlib/lapack/base/dla-wwaddw
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dla_wwaddw = require( '@stdlib/lapack/base/dla-wwaddw' );
*
* var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
* var y = new Float64Array( [ 0.1, 0.2, 0.3 ] );
* var w = new Float64Array( [ 10.0, 20.0, 30.0 ] );
*
* dla_wwaddw( 3, x, 1, y, 1, w, 1 );
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dla_wwaddw = require( '@stdlib/lapack/base/dla-wwaddw' );
*
* var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
* var y = new Float64Array( [ 0.1, 0.2, 0.3 ] );
* var w = new Float64Array( [ 10.0, 20.0, 30.0 ] );
*
* dla_wwaddw.ndarray( 3, x, 1, 0, y, 1, 0, w, 1, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dla_wwaddw.ndarray" }
