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
* Apply an orthogonal matrix from a blocked Tall-Skinny QR (TSQR) factorization to a real `M`-by-`N` matrix.
*
* @module @stdlib/lapack/base/dlamtsqr
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlatsqr = require( '@stdlib/lapack/base/dlatsqr' ).ndarray;
* var dlamtsqr = require( '@stdlib/lapack/base/dlamtsqr' ).ndarray;
*
* var M = 6;
* var K = 2;
* var MB = 3;
* var NB = 2;
* var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0 ] );
* var T = new Float64Array( NB * 2 * K );
* var WORK = new Float64Array( NB * K );
*
* dlatsqr( M, K, MB, NB, A, 1, M, 0, T, 1, NB, 0, WORK, 1, 0 );
*
* var C = new Float64Array( M );
* C[ 0 ] = 1.0;
* dlamtsqr( 'left', 'no-transpose', M, 1, K, MB, NB, A, 1, M, 0, T, 1, NB, 0, C, 1, M, 0, WORK, 1, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlamtsqr.ndarray" }
