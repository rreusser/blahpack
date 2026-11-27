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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlacn2 from './../lib/index.js';

// 2x2 complex matrix (column-major, interleaved real/imaginary parts):
const N = 2;
const A = new Float64Array( [ 1.0, 2.0, -3.0, 0.0, 0.0, 4.0, 2.0, -1.0 ] );

/**
* Overwrites `X` with `A*X` (`conj` is false) or `A^H*X` (`conj` is true).
*
* @private
* @param {Complex128Array} X - input/output vector
* @param {boolean} conj - whether to apply the conjugate transpose
*/
function apply( X, conj ) {
	const xv = reinterpret( X, 0 );
	const tmp = new Float64Array( 2 * N );
	let ar;
	let ai;
	let i;
	let j;
	let k;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			k = ( conj ) ? 2 * ( ( i * N ) + j ) : 2 * ( ( j * N ) + i );
			ar = A[ k ];
			ai = ( conj ) ? -A[ k + 1 ] : A[ k + 1 ];
			tmp[ 2 * i ] += ( ar * xv[ 2 * j ] ) - ( ai * xv[ ( 2 * j ) + 1 ] );
			tmp[ ( 2 * i ) + 1 ] += ( ar * xv[ ( 2 * j ) + 1 ] ) + ( ai * xv[ 2 * j ] );
		}
	}
	xv.set( tmp );
}

// Using the standard interface (reverse communication: loop until KASE is 0):
let V = new Complex128Array( N );
let X = new Complex128Array( N );
let EST = new Float64Array( 1 );
let KASE = new Int32Array( 1 );
let ISAVE = new Int32Array( 3 );
do {
	zlacn2( N, V, 1, X, 1, EST, KASE, ISAVE, 1 );
	if ( KASE[ 0 ] !== 0 ) {
		apply( X, KASE[ 0 ] === 2 );
	}
} while ( KASE[ 0 ] !== 0 );
console.log( EST[ 0 ] ); // eslint-disable-line no-console

// Using the ndarray interface:
V = new Complex128Array( N );
X = new Complex128Array( N );
EST = new Float64Array( 1 );
KASE = new Int32Array( 1 );
ISAVE = new Int32Array( 3 );
do {
	zlacn2.ndarray( N, V, 1, 0, X, 1, 0, EST, KASE, ISAVE, 1, 0 );
	if ( KASE[ 0 ] !== 0 ) {
		apply( X, KASE[ 0 ] === 2 );
	}
} while ( KASE[ 0 ] !== 0 );
console.log( EST[ 0 ] ); // eslint-disable-line no-console
