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
import dsytrf from './../../dsytrf/lib/index.js';
import dsytrs from './../lib/index.js';

const N = 3;
const nrhs = 1;

// Factor the symmetric indefinite matrix A (column-major) with dsytrf:
const A = new Float64Array( [ 1.0, 2.0, 3.0, 2.0, -4.0, 5.0, 3.0, 5.0, 6.0 ] );
const IPIV = new Int32Array( N );
dsytrf( 'column-major', 'upper', N, A, N, IPIV, 1, null );

// Solve A*X = B, where B = A * [ 1, 1, 1 ]^T, using the standard interface:
let B = new Float64Array( [ 6.0, 3.0, 14.0 ] );
let info = dsytrs( 'column-major', 'upper', N, nrhs, A, N, IPIV, 1, B, N );
console.log( info ); // eslint-disable-line no-console
console.log( B ); // eslint-disable-line no-console

// Using the strided interface:
B = new Float64Array( [ 6.0, 3.0, 14.0 ] );
info = dsytrs.strided( 'upper', N, nrhs, A, 1, N, 0, IPIV, 1, 0, B, 1, N, 0 );
console.log( info ); // eslint-disable-line no-console
console.log( B ); // eslint-disable-line no-console
