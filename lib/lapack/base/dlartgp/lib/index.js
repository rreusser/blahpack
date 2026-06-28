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
* Generate a plane rotation with non-negative diagonal.
*
* @module @stdlib/lapack/base/dlartgp
*
* @example
* var dlartgp = require( '@stdlib/lapack/base/dlartgp' );
*
* dlartgp( 1.0, 1.0 );
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlartgp = require( '@stdlib/lapack/base/dlartgp' );
*
* var out = new Float64Array( 3 );
* dlartgp.ndarray( 1.0, 1.0, out );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlartgp.ndarray" }
