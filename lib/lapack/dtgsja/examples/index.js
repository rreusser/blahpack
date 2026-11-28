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
import dtgsja from './../lib/index.js';

const M = 3;
const p = 3;
const N = 3;
const K = 0;
const l = 3;
const tola = 1.0e-12;
const tolb = 1.0e-12;

// Upper triangular A (M-by-N) and B (p-by-N), as preprocessed by dggsvp3 with K = 0 and l = N (column-major):
let A = new Float64Array( [ 2.0, 0.0, 0.0, 1.0, 3.0, 0.0, 0.5, 1.0, 4.0 ] );
let B = new Float64Array( [ 1.0, 0.0, 0.0, 0.5, 2.0, 0.0, 0.2, 0.3, 1.5 ] );
const ALPHA = new Float64Array( N );
const BETA = new Float64Array( N );
const U = new Float64Array( M * M );
const V = new Float64Array( p * p );
const Q = new Float64Array( N * N );
const WORK = new Float64Array( 2 * N );
const ncycle = new Int32Array( 1 );

// Using the standard interface:
let info = dtgsja( 'column-major', 'initialize', 'initialize', 'initialize', M, p, N, K, l, A, M, B, p, tola, tolb, ALPHA, 1, BETA, 1, U, M, V, p, Q, N, WORK, ncycle );
console.log( info ); // eslint-disable-line no-console
console.log( ALPHA ); // eslint-disable-line no-console
console.log( BETA ); // eslint-disable-line no-console

// Using the ndarray interface:
A = new Float64Array( [ 2.0, 0.0, 0.0, 1.0, 3.0, 0.0, 0.5, 1.0, 4.0 ] );
B = new Float64Array( [ 1.0, 0.0, 0.0, 0.5, 2.0, 0.0, 0.2, 0.3, 1.5 ] );
info = dtgsja.ndarray( 'initialize', 'initialize', 'initialize', M, p, N, K, l, A, 1, M, 0, B, 1, p, 0, tola, tolb, ALPHA, 1, 0, BETA, 1, 0, U, 1, M, 0, V, 1, p, 0, Q, 1, N, 0, WORK, 1, 0, ncycle );
console.log( info ); // eslint-disable-line no-console
console.log( ALPHA ); // eslint-disable-line no-console
console.log( BETA ); // eslint-disable-line no-console
