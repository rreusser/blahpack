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
* Apply an orthogonal matrix from a blocked Short-Wide LQ (SWLQ) factorization to a real `M`-by-`N` matrix.
*
* @module @stdlib/lapack/base/dlamswlq
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlamswlq = require( '@stdlib/lapack/base/dlamswlq' ).ndarray;
*
* var K = 2;
* var N = 6;
* var MB = 2;
* var NB = 3;
* var A = new Float64Array( K * N );
* var T = new Float64Array( MB * 2 * K );
* var WORK = new Float64Array( 8 * MB );
*
* var C = new Float64Array( N );
* C[ 0 ] = 1.0;
* dlamswlq( 'right', 'no-transpose', 1, N, K, MB, NB, A, 1, K, 0, T, 1, MB, 0, C, 1, 1, 0, WORK, 1, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlamswlq.ndarray" }
