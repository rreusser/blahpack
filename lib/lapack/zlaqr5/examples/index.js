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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqr5 from './../lib/index.js';

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

// Shifts (complex):
const s = new Complex128Array( [ 3.0, 1.0, 2.0, -0.5 ] );

// Workspaces:
const V = new Complex128Array( 3 * NSHFTS );
const U = new Complex128Array( NU * NU );
const WV = new Complex128Array( N * NU );
const WH = new Complex128Array( NU * N );

// 6-by-6 upper Hessenberg matrix (column-major) and Z = I:
let H;
let Z;
H = new Complex128Array( [ 7.3, -0.0, -0.7, -0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.8, -0.9, 6.9, -1.0, 1.0, 0.7, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.9, 0.6, -0.5, 0.2, 2.0, -0.9, -1.3, 0.9, 0.0, 0.0, 0.0, 0.0, -1.2, 0.5, 1.7, 0.9, -0.6, -0.3, 3.1, 0.6, -1.6, 0.5, 0.0, 0.0, 1.2, 0.7, -1.9, 0.9, -1.6, -0.3, 0.4, 0.8, 1.4, 0.8, 0.2, -0.4, -0.7, -0.6, -1.7, -0.7, 0.8, 1.0, -1.4, -0.9, 1.9, 0.1, 0.6, -0.5 ] );
Z = new Complex128Array( N * N );
setIdentity( reinterpret( Z, 0 ), N, 2 );

// Active block rows/columns are 1-based (ktop = 1, kbot = N):

// Using the standard interface (one multi-shift QR sweep):
zlaqr5( 'column-major', true, true, 0, N, 1, N, NSHFTS, s, 1, H, N, 1, N, Z, N, V, 3, U, NU, N, WV, N, N, WH, NU );
console.log( reinterpret( H, 0 ) );

// Using the strided interface:
H = new Complex128Array( [ 7.3, -0.0, -0.7, -0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.8, -0.9, 6.9, -1.0, 1.0, 0.7, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.9, 0.6, -0.5, 0.2, 2.0, -0.9, -1.3, 0.9, 0.0, 0.0, 0.0, 0.0, -1.2, 0.5, 1.7, 0.9, -0.6, -0.3, 3.1, 0.6, -1.6, 0.5, 0.0, 0.0, 1.2, 0.7, -1.9, 0.9, -1.6, -0.3, 0.4, 0.8, 1.4, 0.8, 0.2, -0.4, -0.7, -0.6, -1.7, -0.7, 0.8, 1.0, -1.4, -0.9, 1.9, 0.1, 0.6, -0.5 ] );
Z = new Complex128Array( N * N );
setIdentity( reinterpret( Z, 0 ), N, 2 );
zlaqr5.strided( true, true, 0, N, 1, N, NSHFTS, s, 1, 0, H, 1, N, 0, 1, N, Z, 1, N, 0, V, 1, 3, 0, U, 1, NU, 0, N, WV, 1, N, 0, N, WH, 1, NU, 0 );
console.log( reinterpret( H, 0 ) );
