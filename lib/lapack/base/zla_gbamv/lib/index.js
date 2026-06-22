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
* LAPACK routine to compute `y := alpha*|A|*|x| + beta*|y|` with a complex banded matrix for error-bound estimation.
*
* @module @stdlib/lapack/base/zla_gbamv
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var zla_gbamv = require( '@stdlib/lapack/base/zla_gbamv' );
*
* var AB = new Complex128Array( 12 );
* var x = new Complex128Array( 4 );
* var y = new Float64Array( 4 );
*
* zla_gbamv( 'column-major', 'no-transpose', 4, 4, 1, 1, 1.0, AB, 3, x, 1, 0.0, y, 1 );
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var zla_gbamv = require( '@stdlib/lapack/base/zla_gbamv' );
*
* var AB = new Complex128Array( 12 );
* var x = new Complex128Array( 4 );
* var y = new Float64Array( 4 );
*
* zla_gbamv.ndarray( 'no-transpose', 4, 4, 1, 1, 1.0, AB, 1, 3, 0, x, 1, 0, 0.0, y, 1, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zla_gbamv.ndarray" }
