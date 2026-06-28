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
* Compute a blocked LQ factorization of a real M-by-N matrix A using the compact WY representation of Q.
*
* @module @stdlib/lapack/base/dgelqt
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dgelqt = require( '@stdlib/lapack/base/dgelqt' );
*
* var A = new Float64Array( [ 3.0, 0.5, 0.6, 4.0, 0.4, 0.7, 0.2, 0.3 ] );
* var T = new Float64Array( 4 );
* var WORK = new Float64Array( 8 );
*
* dgelqt( 'column-major', 2, 4, 2, A, 2, T, 2, WORK );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dgelqt.ndarray" }
