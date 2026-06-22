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
* Apply a complex unitary matrix Q (or its conjugate-transpose Q^H) from a TSQR factorization (`zlatsqr`) to a complex M-by-N matrix C.
*
* @module @stdlib/lapack/base/zlamtsqr
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zlamtsqr = require( '@stdlib/lapack/base/zlamtsqr' );
*
* var A = new Complex128Array( 8 );
* var T = new Complex128Array( 2 );
* var C = new Complex128Array( 8 );
* var WORK = new Complex128Array( 2 );
*
* // C is overwritten with Q^H * C in column-major layout.
* zlamtsqr.ndarray( 'left', 'conjugate-transpose', 4, 2, 2, 8, 1, A, 1, 4, 0, T, 1, 1, 0, C, 1, 4, 0, WORK, 1, 0, WORK.length );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlamtsqr.ndarray" }
