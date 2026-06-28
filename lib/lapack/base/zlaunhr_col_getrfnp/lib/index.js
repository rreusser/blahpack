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
* Computes the modified LU factorization without pivoting of a complex general M-by-N matrix (blocked driver).
*
* @module @stdlib/lapack/base/zlaunhr_col_getrfnp
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zlaunhr_col_getrfnp = require( '@stdlib/lapack/base/zlaunhr_col_getrfnp' );
*
* var A = new Complex128Array( [ 0.5, 0.3, 0.2, -0.1, -0.3, 0.2, -0.1, 0.4, 0.6, -0.2, 0.1, 0.3, 0.2, -0.3, -0.4, 0.1, 0.5, 0.2 ] );
* var D = new Complex128Array( 3 );
*
* zlaunhr_col_getrfnp( 'column-major', 3, 3, A, 3, D, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlaunhr_col_getrfnp.ndarray" }
