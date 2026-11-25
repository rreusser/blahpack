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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zgetrf from './../../zgetrf/lib/index.js';
import zgetrs from './../../zgetrs/lib/index.js';
import zgerfs from './../lib/index.js';

const N = 3;
const NRHS = 1;

// Column-major, diagonally dominant complex matrix (interleaved re/im):
const A = new Complex128Array( [ 4.0, 1.0, 1.0, 0.0, 2.0, -1.0, 1.0, 0.0, 5.0, 2.0, 1.0, 1.0, 2.0, 1.0, 1.0, -1.0, 6.0, 0.0 ] );
const B = new Complex128Array( [ 7.0, 1.0, 7.0, 1.0, 9.0, 0.0 ] );

// Factor A = P*L*U and solve A*X = B:
const AF = new Complex128Array( A );
const IPIV = new Int32Array( N );
zgetrf( 'column-major', N, N, AF, N, IPIV, 1 );
const X = new Complex128Array( B );
zgetrs( 'column-major', 'no-transpose', N, NRHS, AF, N, IPIV, 1, X, N );

const FERR = new Float64Array( NRHS );
const BERR = new Float64Array( NRHS );

// Using the standard interface:
let info = zgerfs( 'column-major', 'no-transpose', N, NRHS, A, N, AF, N, IPIV, 1, B, N, X, N, FERR, 1, BERR, 1, null, null );
console.log( info, reinterpret( X, 0 ), FERR, BERR ); // eslint-disable-line no-console

// Using the ndarray interface:
const WORK = new Complex128Array( 2 * N );
const RWORK = new Float64Array( N );
info = zgerfs.ndarray( 'no-transpose', N, NRHS, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
console.log( info, reinterpret( X, 0 ), FERR, BERR ); // eslint-disable-line no-console
