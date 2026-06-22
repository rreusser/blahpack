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
* Reduces a complex Hermitian matrix `A` to complex Hermitian band-diagonal form `AB` by a unitary similarity transformation.
*
* @module @stdlib/lapack/base/zhetrd_he2hb
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zhetrd_he2hb = require( '@stdlib/lapack/base/zhetrd_he2hb' );
*
* var N = 4;
* var kd = 1;
* var A = new Complex128Array( N * N );
* var AB = new Complex128Array( (kd+1) * N );
* var TAU = new Complex128Array( N - kd );
*
* zhetrd_he2hb( 'column-major', 'lower', N, kd, A, N, AB, kd+1, TAU, 1, null, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zhetrd_he2hb.ndarray" }
