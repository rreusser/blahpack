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

/* eslint-disable camelcase */

/**
* Computes the modified LU factorization without pivoting of a real general M-by-N matrix (blocked driver).
*
* @module @stdlib/lapack/base/dlaorhr_col_getrfnp
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlaorhr_col_getrfnp = require( '@stdlib/lapack/base/dlaorhr_col_getrfnp' );
*
* var A = new Float64Array( [ 0.5, 0.3, -0.2, -0.4, 0.6, 0.1, 0.2, -0.1, 0.7 ] );
* var D = new Float64Array( 3 );
*
* dlaorhr_col_getrfnp( 'column-major', 3, 3, A, 3, D, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlaorhr_col_getrfnp.ndarray" }
