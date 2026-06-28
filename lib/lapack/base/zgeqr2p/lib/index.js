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
* Compute a QR factorization of a complex matrix with non-negative real diagonal elements (unblocked algorithm).
*
* @module @stdlib/lapack/base/zgeqr2p
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zgeqr2p = require( '@stdlib/lapack/base/zgeqr2p' );
*
* var A = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
* var TAU = new Complex128Array( [ 1.0, 2.0 ] );
* var WORK = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0 ] );
*
* zgeqr2p( 'row-major', 2, 2, A, 2, TAU, 1, WORK, 1 );
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zgeqr2p = require( '@stdlib/lapack/base/zgeqr2p' );
*
* var A = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
* var TAU = new Complex128Array( [ 1.0, 2.0 ] );
* var WORK = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0 ] );
*
* zgeqr2p.ndarray( 2, 2, A, 1, 2, 0, TAU, 1, 0, WORK, 1, 0 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zgeqr2p.ndarray" }
