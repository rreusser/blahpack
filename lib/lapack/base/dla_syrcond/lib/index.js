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
* Estimates the Skeel condition number for a symmetric indefinite matrix.
*
* @module @stdlib/lapack/base/dla_syrcond
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var dla_syrcond = require( '@stdlib/lapack/base/dla_syrcond' );
*
* var A = new Float64Array( [ 2.0, -1.0, -1.0, 3.0 ] );
* var AF = new Float64Array( [ 2.0, -1.0, -1.0, 3.0 ] );
* var IPIV = new Int32Array( [ 0, 1 ] );
* var c = new Float64Array( [ 1.0, 1.0 ] );
* var WORK = new Float64Array( 6 );
* var IWORK = new Int32Array( 2 );
*
* var rcond = dla_syrcond( 'column-major', 'upper', 2, A, 2, AF, 2, IPIV, 1, c, WORK, IWORK );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dla_syrcond.ndarray" }
