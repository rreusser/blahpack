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
import dlaqr5 from './../lib/index.js';

/**
* Sets a column-major N-by-N matrix to the identity.
*
* @private
* @param {Float64Array} v - matrix elements (real view)
* @param {PositiveInteger} N - matrix order
* @param {PositiveInteger} k - number of real values per element
*/
function setIdentity( v, N, k ) {
	let i;
	for ( i = 0; i < N; i++ ) {
		v[ k * ( ( i * N ) + i ) ] = 1.0;
	}
}

const N = 6;
const NSHFTS = 2;
const NU = ( 2 * NSHFTS ) + 1;

// A complex-conjugate pair of shifts:
const SR = new Float64Array( [ 2.0, 2.0 ] );
const SI = new Float64Array( [ 0.5, -0.5 ] );

// Workspaces:
const V = new Float64Array( 3 * NSHFTS );
const U = new Float64Array( NU * NU );
const WV = new Float64Array( N * NU );
const WH = new Float64Array( NU * N );

// 6-by-6 upper Hessenberg matrix (column-major) and Z = I:
let H;
let Z;
H = new Float64Array( [ 6.5, 1.2, 0.0, 0.0, 0.0, 0.0, 1.0, 3.1, 1.8, 0.0, 0.0, 0.0, 1.6, -0.1, 4.2, -1.9, 0.0, 0.0, -0.9, 1.1, 1.2, 3.5, -2.0, 0.0, -1.2, 1.9, -0.8, 0.2, 0.8, 0.8, 1.6, -0.6, -1.4, -0.8, -2.0, 0.4 ] );
Z = new Float64Array( N * N );
setIdentity( Z, N, 1 );

// Active block rows/columns are 0-based (ktop = 0, kbot = N-1):

// Using the standard interface (one multi-shift QR sweep):
dlaqr5( 'column-major', true, true, 0, N, 0, N - 1, NSHFTS, SR, 1, SI, 1, H, N, 0, N - 1, Z, N, V, 3, U, NU, N, WV, N, N, WH, NU );
console.log( H );

// Using the ndarray interface:
H = new Float64Array( [ 6.5, 1.2, 0.0, 0.0, 0.0, 0.0, 1.0, 3.1, 1.8, 0.0, 0.0, 0.0, 1.6, -0.1, 4.2, -1.9, 0.0, 0.0, -0.9, 1.1, 1.2, 3.5, -2.0, 0.0, -1.2, 1.9, -0.8, 0.2, 0.8, 0.8, 1.6, -0.6, -1.4, -0.8, -2.0, 0.4 ] );
Z = new Float64Array( N * N );
setIdentity( Z, N, 1 );
dlaqr5.ndarray( true, true, 0, N, 0, N - 1, NSHFTS, SR, 1, 0, SI, 1, 0, H, 1, N, 0, 0, N - 1, Z, 1, N, 0, V, 1, 3, 0, U, 1, NU, 0, N, WV, 1, N, 0, N, WH, 1, NU, 0 );
console.log( H );
