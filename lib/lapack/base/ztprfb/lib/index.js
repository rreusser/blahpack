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
* Apply a complex triangular-pentagonal block reflector to a matrix.
*
* @module @stdlib/lapack/base/ztprfb
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var ztprfb = require( '@stdlib/lapack/base/ztprfb' );
*
* var V = new Complex128Array( 16 );
* var T = new Complex128Array( 9 );
* var A = new Complex128Array( 12 );
* var B = new Complex128Array( 20 );
* var W = new Complex128Array( 12 );
*
* ztprfb.ndarray( 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, V, 1, 5, 0, T, 1, 3, 0, A, 1, 3, 0, B, 1, 5, 0, W, 1, 3, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "ztprfb.ndarray" }
