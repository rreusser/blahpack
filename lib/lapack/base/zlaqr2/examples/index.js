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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqr2 from './../lib/index.js';

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
const NW = 3;
const ns = new Int32Array( 1 );
const nd = new Int32Array( 1 );

let H;
let Z;
let SH;
let V;
let T;
let WV;
let WORK;

// 6-by-6 upper Hessenberg matrix (column-major); deflation window of NW rows:
H = new Complex128Array( [ 6.7, -0.9, -4.0, -0.3, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.3, 8.6, 0.8, 0.1, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.4, -1.8, 3.2, 1.1, 7.0, 1.2, -0.9, -0.4, 0.0, 0.0, 0.0, 0.0, -3.2, 0.5, -3.5, -1.7, -2.3, -1.4, 1.7, -1.8, -4.0, -1.4, 0.0, 0.0, -3.2, -0.5, -3.8, 1.5, 0.9, -1.4, -2.0, -0.6, 0.8999999999999999, -1.5, 2.8, 2.0, -0.3, -0.1, -3.3, -1.6, -1.3, -0.9, 2.6, -1.4, -3.8, 1.8, 1.2, -1.4 ] );
Z = new Complex128Array( N * N );
setIdentity( reinterpret( Z, 0 ), N, 2 );
SH = new Complex128Array( N );
V = new Complex128Array( NW * NW );
T = new Complex128Array( NW * NW );
WV = new Complex128Array( N * NW );
WORK = new Complex128Array( 2 * N * N );

// Using the standard interface:
zlaqr2( 'column-major', true, true, N, 1, N, NW, H, N, 1, N, Z, N, ns, nd, SH, 1, V, NW, NW, T, NW, N, WV, N, WORK );
console.log( 'ns = %d, nd = %d', ns[ 0 ], nd[ 0 ] );
console.log( reinterpret( SH, 0 ) );

// Using the ndarray interface:
H = new Complex128Array( [ 6.7, -0.9, -4.0, -0.3, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.3, 8.6, 0.8, 0.1, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.4, -1.8, 3.2, 1.1, 7.0, 1.2, -0.9, -0.4, 0.0, 0.0, 0.0, 0.0, -3.2, 0.5, -3.5, -1.7, -2.3, -1.4, 1.7, -1.8, -4.0, -1.4, 0.0, 0.0, -3.2, -0.5, -3.8, 1.5, 0.9, -1.4, -2.0, -0.6, 0.8999999999999999, -1.5, 2.8, 2.0, -0.3, -0.1, -3.3, -1.6, -1.3, -0.9, 2.6, -1.4, -3.8, 1.8, 1.2, -1.4 ] );
Z = new Complex128Array( N * N );
setIdentity( reinterpret( Z, 0 ), N, 2 );
SH = new Complex128Array( N );
V = new Complex128Array( NW * NW );
T = new Complex128Array( NW * NW );
WV = new Complex128Array( N * NW );
WORK = new Complex128Array( 2 * N * N );
zlaqr2.ndarray( true, true, N, 1, N, NW, H, 1, N, 0, 1, N, Z, 1, N, 0, ns, nd, SH, 1, 0, V, 1, NW, 0, NW, T, 1, NW, 0, N, WV, 1, N, 0, WORK, 1, 0 );
console.log( 'ns = %d, nd = %d', ns[ 0 ], nd[ 0 ] );
console.log( reinterpret( SH, 0 ) );
