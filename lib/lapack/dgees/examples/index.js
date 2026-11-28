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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import dgees from './../lib/index.js';

/**
* Selects eigenvalues with a positive real part.
*
* @private
* @param {number} wr - real part of the eigenvalue
* @param {number} wi - imaginary part of the eigenvalue
* @returns {boolean} boolean indicating whether to select the eigenvalue
*/
function select( wr, wi ) { // eslint-disable-line no-unused-vars
	return wr > 0.0;
}

// Real Schur factorization A = Z * T * Z^T of a 3x3 matrix (column-major), sorting eigenvalues with positive real part first:
const N = 3;
const sdim = new Int32Array( 1 );

// Using the standard interface:
let A = new Float64Array( [ 1.0, 3.0, 0.0, -2.0, 1.0, 0.0, 1.0, 2.0, -4.0 ] );
let WR = new Float64Array( N );
let WI = new Float64Array( N );
let VS = new Float64Array( N * N );
let info = dgees( 'column-major', 'compute-vectors', 'sort', select, N, A, N, sdim, WR, 1, WI, 1, VS, N, null, null );
console.log( info, sdim[ 0 ], WR, WI ); // eslint-disable-line no-console

// Using the strided interface:
A = new Float64Array( [ 1.0, 3.0, 0.0, -2.0, 1.0, 0.0, 1.0, 2.0, -4.0 ] );
WR = new Float64Array( N );
WI = new Float64Array( N );
VS = new Float64Array( N * N );
const WORK = new Float64Array( 3 * N );
const BWORK = new Uint8Array( N );
info = dgees.strided( 'compute-vectors', 'sort', select, N, A, 1, N, 0, sdim, WR, 1, 0, WI, 1, 0, VS, 1, N, 0, WORK, 1, 0, BWORK, 1, 0 );
console.log( info, sdim[ 0 ], WR, WI ); // eslint-disable-line no-console
