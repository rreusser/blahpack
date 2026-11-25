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
import sqrt from '@stdlib/math/base/special/sqrt/lib/index.js';
import dlaqps from './../lib/index.js';

/**
* Computes the Euclidean norm of each column of a column-major matrix.
*
* @private
* @param {Float64Array} v - matrix elements (real view)
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} VN1 - output partial column norms
* @param {Float64Array} VN2 - output exact column norms
*/
function colnorms( v, N, VN1, VN2 ) {
	const len = v.length / N;
	let s;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		s = 0.0;
		for ( i = 0; i < len; i++ ) {
			s += v[ ( j * len ) + i ] * v[ ( j * len ) + i ];
		}
		VN1[ j ] = sqrt( s );
		VN2[ j ] = VN1[ j ];
	}
}

const M = 3;
const N = 3;
const NB = 2;
const kb = new Int32Array( 1 );

// 3-by-3 matrix (column-major):
let A;
let JPVT;
let TAU;
let VN1;
let VN2;
let AUXV;
let F;
A = new Float64Array( [ 1.0, 2.0, 3.0, -1.0, 4.0, 0.5, 2.0, 1.0, -2.0 ] );
JPVT = new Int32Array( [ 0, 1, 2 ] );
TAU = new Float64Array( N );
VN1 = new Float64Array( N );
VN2 = new Float64Array( N );
AUXV = new Float64Array( NB );
F = new Float64Array( N * NB );
colnorms( A, N, VN1, VN2 );

// Using the standard interface (factorize a block of NB columns):
dlaqps( 'column-major', M, N, 0, NB, kb, A, M, JPVT, 1, TAU, 1, VN1, 1, VN2, 1, AUXV, 1, F, N );
console.log( kb[ 0 ] );
console.log( A );

// Using the ndarray interface:
A = new Float64Array( [ 1.0, 2.0, 3.0, -1.0, 4.0, 0.5, 2.0, 1.0, -2.0 ] );
JPVT = new Int32Array( [ 0, 1, 2 ] );
TAU = new Float64Array( N );
VN1 = new Float64Array( N );
VN2 = new Float64Array( N );
AUXV = new Float64Array( NB );
F = new Float64Array( N * NB );
colnorms( A, N, VN1, VN2 );
dlaqps.ndarray( M, N, 0, NB, kb, A, 1, M, 0, JPVT, 1, 0, TAU, 1, 0, VN1, 1, 0, VN2, 1, 0, AUXV, 1, 0, F, 1, N, 0 );
console.log( kb[ 0 ] );
console.log( A );
