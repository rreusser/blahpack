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
import dtrsna from './../lib/index.js';

// Upper (quasi-)triangular Schur factor T = diag( 1, 2, 3 ) (column-major):
const N = 3;
const T = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 3.0 ]);

// Left/right eigenvectors of a diagonal T are the identity columns:
const VL = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ]);
const VR = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ]);

const SELECT = new Uint8Array( N ); // unused when howmny = 'all'
const s = new Float64Array( N );    // reciprocal eigenvalue condition numbers
const SEP = new Float64Array( N );
const WORK = new Float64Array( N * ( N + 6 ) );
const IWORK = new Int32Array( 2 * N );

// Reciprocal condition numbers of the eigenvalues (all 1 for a normal matrix):
const out = dtrsna( 'column-major', 'eigenvalues', 'all', SELECT, 1, N, T, N, VL, N, VR, N, s, 1, SEP, 1, N, WORK, N, IWORK, 1, 0 );

console.log( 'info: %d, m: %d', out.info, out.m ); // eslint-disable-line no-console
console.log( 's: [ %s ]', Array.prototype.slice.call( s, 0, N ).join( ', ' ) ); // eslint-disable-line no-console
