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
import dlacn2 from './../lib/index.js';

// 3x3 matrix (column-major) whose 1-norm is 9:
const N = 3;
const A = new Float64Array( [ 1.0, -2.0, 3.0, 4.0, 1.0, -1.0, 2.0, 5.0, -2.0 ] );

/**
* Overwrites `x` with `A*x` (`trans` is false) or `A^T*x` (`trans` is true).
*
* @private
* @param {Float64Array} x - input/output vector
* @param {boolean} trans - whether to apply the transpose
*/
function apply( x, trans ) {
	const tmp = new Float64Array( N );
	let i;
	let j;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			tmp[ i ] += ( trans ) ? A[ ( i * N ) + j ] * x[ j ] : A[ ( j * N ) + i ] * x[ j ];
		}
	}
	x.set( tmp );
}

// Using the standard interface (reverse communication: loop until KASE is 0):
let v = new Float64Array( N );
let x = new Float64Array( N );
let ISGN = new Int32Array( N );
let EST = new Float64Array( 1 );
let KASE = new Int32Array( 1 );
let ISAVE = new Int32Array( 3 );
do {
	dlacn2( N, v, 1, x, 1, ISGN, 1, EST, KASE, ISAVE, 1 );
	if ( KASE[ 0 ] !== 0 ) {
		apply( x, KASE[ 0 ] === 2 );
	}
} while ( KASE[ 0 ] !== 0 );
console.log( EST[ 0 ] ); // eslint-disable-line no-console

// Using the strided interface:
v = new Float64Array( N );
x = new Float64Array( N );
ISGN = new Int32Array( N );
EST = new Float64Array( 1 );
KASE = new Int32Array( 1 );
ISAVE = new Int32Array( 3 );
do {
	dlacn2.strided( N, v, 1, 0, x, 1, 0, ISGN, 1, 0, EST, KASE, ISAVE, 1, 0 );
	if ( KASE[ 0 ] !== 0 ) {
		apply( x, KASE[ 0 ] === 2 );
	}
} while ( KASE[ 0 ] !== 0 );
console.log( EST[ 0 ] ); // eslint-disable-line no-console
