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
import dposvx from './../lib/index.js';

const N = 3;
const nrhs = 1;

// Symmetric positive definite matrix (column-major, upper triangle used):
const A = new Float64Array( [ 4.0, 2.0, 0.0, 2.0, 5.0, 1.0, 0.0, 1.0, 3.0 ] );
const AF = new Float64Array( N * N );
const B = new Float64Array( [ 6.0, 8.0, 4.0 ] );
const X = new Float64Array( N * nrhs );
const s = new Float64Array( N );
const rcond = new Float64Array( 1 );
const FERR = new Float64Array( nrhs );
const BERR = new Float64Array( nrhs );

// Using the standard interface:
const equed = [ 'none' ];
const info = dposvx( 'column-major', 'not-factored', 'upper', N, nrhs, A, N, AF, N, equed, s, 1, B, N, X, N, rcond, FERR, 1, BERR, 1, null, null );
console.log( info );
// => 0

console.log( equed[ 0 ] );
// => 'none'

console.log( rcond[ 0 ] );
// => ~0.25

console.log( X );
// => <Float64Array>[ 1.0, 1.0, 1.0 ]
