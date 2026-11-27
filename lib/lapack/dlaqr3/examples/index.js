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
import dlaqr3 from './../lib/index.js';

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
let SR;
let SI;
let V;
let T;
let WV;
let WORK;

// 6-by-6 upper Hessenberg matrix (column-major); deflation window of NW rows:
H = new Float64Array( [ 5.3, -2.8, 0.0, 0.0, 0.0, 0.0, -3.7, 7.1, 3.0, 0.0, 0.0, 0.0, 1.6, 0.6, 6.7, -0.2, 0.0, 0.0, -3.5, 1.2, 2.6, 2.1, -3.8, 0.0, -2.7, -3.5, -3.0, -0.9, -1.4, 0.4, 2.6, -1.8, -1.1, 3.7, -2.6, -1.1 ] );
Z = new Float64Array( N * N );
setIdentity( Z, N, 1 );
SR = new Float64Array( N );
SI = new Float64Array( N );
V = new Float64Array( NW * NW );
T = new Float64Array( NW * NW );
WV = new Float64Array( N * NW );
WORK = new Float64Array( 2 * N * N );

// Using the standard interface:
dlaqr3( 'column-major', true, true, N, 1, N, NW, H, N, 1, N, Z, N, ns, nd, SR, 1, SI, 1, V, NW, NW, T, NW, N, WV, N, WORK );
console.log( 'ns = %d, nd = %d', ns[ 0 ], nd[ 0 ] );
console.log( SR );
console.log( SI );

// Using the ndarray interface:
H = new Float64Array( [ 5.3, -2.8, 0.0, 0.0, 0.0, 0.0, -3.7, 7.1, 3.0, 0.0, 0.0, 0.0, 1.6, 0.6, 6.7, -0.2, 0.0, 0.0, -3.5, 1.2, 2.6, 2.1, -3.8, 0.0, -2.7, -3.5, -3.0, -0.9, -1.4, 0.4, 2.6, -1.8, -1.1, 3.7, -2.6, -1.1 ] );
Z = new Float64Array( N * N );
setIdentity( Z, N, 1 );
SR = new Float64Array( N );
SI = new Float64Array( N );
V = new Float64Array( NW * NW );
T = new Float64Array( NW * NW );
WV = new Float64Array( N * NW );
WORK = new Float64Array( 2 * N * N );
dlaqr3.ndarray( true, true, N, 1, N, NW, H, 1, N, 0, 1, N, Z, 1, N, 0, ns, nd, SR, 1, 0, SI, 1, 0, V, 1, NW, 0, NW, T, 1, NW, 0, N, WV, 1, N, 0, WORK, 1, 0 );
console.log( 'ns = %d, nd = %d', ns[ 0 ], nd[ 0 ] );
console.log( SR );
console.log( SI );
