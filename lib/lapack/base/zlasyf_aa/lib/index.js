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
* Factorize a panel of a complex symmetric matrix using Aasen's algorithm.
*
* @module @stdlib/lapack/base/zlasyf_aa
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Int32Array = require( '@stdlib/array/int32' );
* var zlasyfAa = require( '@stdlib/lapack/base/zlasyf_aa' );
*
* var A = new Complex128Array( 9 );
* var H = new Complex128Array( 9 );
* var WORK = new Complex128Array( 3 );
* var IPIV = new Int32Array( 3 );
*
* zlasyfAa( 'column-major', 'lower', 1, 3, 3, A, 3, IPIV, 1, 0, H, 3, WORK, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlasyf_aa.ndarray" }
