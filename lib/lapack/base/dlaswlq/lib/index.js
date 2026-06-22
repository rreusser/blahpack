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
* Computes a blocked Tall-Skinny LQ (TSLQ) factorization of a real `M`-by-`N` matrix (with `M <= N`).
*
* @module @stdlib/lapack/base/dlaswlq
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlaswlq = require( './../lib' );
*
* var A = new Float64Array( [ 5.0, 1.0, 0.5, 0.3, 1.0, 6.0, 0.5, 0.5 ] );
* var T = new Float64Array( 4 );
* var WORK = new Float64Array( 4 );
*
* var info = dlaswlq( 'column-major', 2, 4, 2, 8, A, 2, T, 2, WORK );
* // returns 0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlaswlq.ndarray" }
