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
* Computes the generalized singular value decomposition of a complex matrix pair.
*
* @module @stdlib/lapack/base/zggsvd3
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Int32Array = require( '@stdlib/array/int32' );
* var zggsvd3 = require( '@stdlib/lapack/base/zggsvd3' );
*
* var A = new Complex128Array( 9 );
* var B = new Complex128Array( 6 );
* // Populate A and B, then invoke zggsvd3 with the required workspaces...
* var K = new Int32Array( 1 );
* // info = zggsvd3( 'compute-U', 'compute-V', 'compute-Q', 3, 3, 2, K, L, A, 3, B, 2, ... );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zggsvd3.ndarray" }
