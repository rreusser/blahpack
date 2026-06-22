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
* Overwrites a real M-by-N matrix C with `op(Q)*C` or `C*op(Q)` using the compact WY representation produced by `dgelqt`.
*
* @module @stdlib/lapack/base/dgemlqt
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dgemlqt = require( '@stdlib/lapack/base/dgemlqt' );
*
* var V = new Float64Array( 12 );
* var T = new Float64Array( 6 );
* var C = new Float64Array( 16 );
* var WORK = new Float64Array( 8 );
* // C is overwritten with Q*C in column-major layout.
* dgemlqt.ndarray( 'left', 'no-transpose', 4, 4, 3, 2, V, 1, 3, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dgemlqt.ndarray" }
