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
* Generates an M-by-N complex matrix Q with orthonormal rows, defined as the last M rows of a product of K elementary reflectors of order N.
*
* @module @stdlib/lapack/base/zungrq
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zgerqf = require( '@stdlib/lapack/base/zgerqf' );
* var zungrq = require( '@stdlib/lapack/base/zungrq' );
*
* var A = new Complex128Array( [ 1.0, 0.5, 2.0, -0.3, 3.0, 0.2, 4.0, 0.6 ] );
* var TAU = new Complex128Array( 1 );
* var WORK = new Complex128Array( 32 );
*
* zgerqf.ndarray( 1, 4, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
* var info = zungrq.ndarray( 1, 4, 1, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zungrq.ndarray" }
