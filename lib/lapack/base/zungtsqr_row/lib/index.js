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
* Generates an `M`-by-`N` complex matrix `Q` with orthonormal columns from the output of `zlatsqr`, using a row-block (GETT) sweep.
*
* @module @stdlib/lapack/base/zungtsqr_row
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zlatsqr = require( '@stdlib/lapack/base/zlatsqr' );
* var zungtsqr_row = require( '@stdlib/lapack/base/zungtsqr_row' );
*
* var A = new Complex128Array( 6 );
* var T = new Complex128Array( 4 );
* var WORK = new Complex128Array( 2 );
* zlatsqr( 'column-major', 3, 2, 4, 2, A, 3, T, 2, WORK );
* zungtsqr_row( 'column-major', 3, 2, 4, 2, A, 3, T, 2, WORK );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zungtsqr_row.ndarray" }
